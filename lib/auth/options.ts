import "server-only";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { sanitizeCallbackUrl } from "@/lib/auth/callback-url";
import { getAuthSecret, getGoogleAuthConfig } from "@/lib/auth/env";
import { credentialsSchema } from "@/lib/auth/schemas";
import { ensureStarterProjects } from "@/lib/data/projects";
import { ensureOAuthUser, findUserByEmail, findUserById } from "@/lib/data/users";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { verifyPassword } from "@/lib/security/password";

const AUTH_SECRET = getAuthSecret();

const AUTH_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const CREDENTIALS_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const CREDENTIALS_RATE_LIMIT_ATTEMPTS = 10;
const AUTH_REDIRECT_FALLBACK = "/";

function readHeaderValue(headers: unknown, headerName: string) {
  const key = headerName.toLowerCase();

  if (headers instanceof Headers) {
    return headers.get(key);
  }

  if (headers && typeof headers === "object") {
    const record = headers as Record<string, string | string[] | undefined>;
    const value = record[key] ?? record[headerName];

    if (Array.isArray(value)) {
      return value[0] ?? null;
    }

    return value ?? null;
  }

  return null;
}

function getAuthRequestIp(request: unknown) {
  if (!request || typeof request !== "object") {
    return "unknown";
  }

  const headers = (request as { headers?: unknown }).headers;
  const forwardedFor = readHeaderValue(headers, "x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = readHeaderValue(headers, "x-real-ip");

  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Email y contrasena",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Contrasena", type: "password" },
    },
    async authorize(credentials, request) {
      const parsed = credentialsSchema.safeParse(credentials);

      if (!parsed.success) {
        return null;
      }

      const loginRateLimit = checkRateLimit({
        bucket: "auth:credentials",
        key: `${parsed.data.email}:${getAuthRequestIp(request)}`,
        limit: CREDENTIALS_RATE_LIMIT_ATTEMPTS,
        windowMs: CREDENTIALS_RATE_LIMIT_WINDOW_MS,
      });

      if (!loginRateLimit.ok) {
        return null;
      }

      const user = await findUserByEmail(parsed.data.email);

      if (!user?.passwordHash) {
        return null;
      }

      const isValidPassword = await verifyPassword(parsed.data.password, user.passwordHash);

      if (!isValidPassword) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.avatarUrl,
      };
    },
  }),
];

const googleAuthConfig = getGoogleAuthConfig();

if (googleAuthConfig) {
  providers.push(
    GoogleProvider({
      clientId: googleAuthConfig.clientId,
      clientSecret: googleAuthConfig.clientSecret,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
    updateAge: 60 * 60,
  },
  jwt: {
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
  },
  secret: AUTH_SECRET,
  pages: {
    signIn: "/auth/login",
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }

      if (!user.email) {
        return false;
      }

      const accountUser = await ensureOAuthUser({
        email: user.email,
        name: user.name,
        avatarUrl: user.image,
      });

      user.id = accountUser.id;
      user.name = accountUser.name;
      user.image = accountUser.avatarUrl;

      await ensureStarterProjects(accountUser.id);

      return true;
    },

    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
      }

      if (!token.userId && typeof token.sub === "string") {
        token.userId = token.sub;
      }

      if (!token.userId && token.email) {
        const existingUser = await findUserByEmail(token.email);
        token.userId = existingUser?.id;
        token.role = existingUser?.role ?? "user";
      }

      if (token.userId && !token.role) {
        const existingUser = await findUserById(token.userId);
        token.role = existingUser?.role ?? "user";
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        const resolvedUserId = token.userId ?? (typeof token.sub === "string" ? token.sub : undefined);

        if (resolvedUserId) {
          session.user.id = resolvedUserId;
        }

        session.user.role = (token.role === "admin" ? "admin" : "user");
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        const safePath = sanitizeCallbackUrl(url, AUTH_REDIRECT_FALLBACK);
        return new URL(safePath, baseUrl).toString();
      }

      try {
        const parsed = new URL(url);

        if (parsed.origin === baseUrl) {
          const safePath = sanitizeCallbackUrl(
            `${parsed.pathname}${parsed.search}${parsed.hash}`,
            AUTH_REDIRECT_FALLBACK,
          );

          return new URL(safePath, baseUrl).toString();
        }
      } catch {
        return new URL(AUTH_REDIRECT_FALLBACK, baseUrl).toString();
      }

      return new URL(AUTH_REDIRECT_FALLBACK, baseUrl).toString();
    },
  },
};
