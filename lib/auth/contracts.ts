import type { AppUser } from "@/lib/data/users";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface AuthServicePort {
  getSessionUser(): Promise<SessionUser | null>;
  requireSessionUser(callbackUrl?: string): Promise<SessionUser>;
  registerWithPassword(input: RegisterUserInput): Promise<AppUser>;
}