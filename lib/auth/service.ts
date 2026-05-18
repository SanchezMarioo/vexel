import "server-only";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { sanitizeCallbackUrl } from "@/lib/auth/callback-url";
import type { AuthServicePort, RegisterUserInput, SessionUser } from "@/lib/auth/contracts";
import { registerSchema } from "@/lib/auth/schemas";
import { ensureStarterProjects } from "@/lib/data/projects";
import { createCredentialsUser, findUserByEmail } from "@/lib/data/users";
import { hashPassword } from "@/lib/security/password";

function mapSessionUser(session: Session | null): SessionUser | null {
  if (!session?.user?.email) {
    return null;
  }

  return {
    id: session.user.id ?? "",
    email: session.user.email,
    name: session.user.name ?? null,
    image: session.user.image ?? null,
    role: session.user.role ?? "user",
  };
}

export const authService: AuthServicePort = {
  async getSessionUser() {
    const session = await getServerSession(authOptions);
    return mapSessionUser(session);
  },

  async requireSessionUser(callbackUrl) {
    const session = await getServerSession(authOptions);
    const currentUser = mapSessionUser(session);

    if (currentUser) {
      if (currentUser.id) {
        return currentUser;
      }

      const persistedUser = await findUserByEmail(currentUser.email);

      if (persistedUser) {
        return {
          id: persistedUser.id,
          email: persistedUser.email,
          name: persistedUser.name ?? currentUser.name,
          image: persistedUser.avatarUrl ?? currentUser.image,
          role: persistedUser.role ?? "user",
        };
      }
    }

    const safeCallbackUrl = sanitizeCallbackUrl(callbackUrl, "/cuenta");
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`);
  },

  async registerWithPassword(input: RegisterUserInput) {
    const parsedInput = registerSchema.parse(input);
    const existingUser = await findUserByEmail(parsedInput.email);

    if (existingUser) {
      throw new Error("Ya existe una cuenta con ese email.");
    }

    const passwordHash = await hashPassword(parsedInput.password);

    const user = await createCredentialsUser({
      email: parsedInput.email,
      name: parsedInput.name,
      passwordHash,
    });

    await ensureStarterProjects(user.id);

    return user;
  },
};

export async function getSessionUser() {
  return authService.getSessionUser();
}

export async function requireSessionUser(callbackUrl?: string) {
  return authService.requireSessionUser(callbackUrl);
}

export async function requireAdminUser() {
  const user = await requireSessionUser("/cuenta");
  if (user.role !== "admin") {
    redirect("/");
  }
  return user;
}
