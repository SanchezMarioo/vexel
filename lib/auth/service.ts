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
  if (!session?.user?.id || !session.user.email) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? null,
    image: session.user.image ?? null,
  };
}

export const authService: AuthServicePort = {
  async getSessionUser() {
    const session = await getServerSession(authOptions);
    return mapSessionUser(session);
  },

  async requireSessionUser(callbackUrl) {
    const currentUser = await this.getSessionUser();

    if (currentUser) {
      return currentUser;
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