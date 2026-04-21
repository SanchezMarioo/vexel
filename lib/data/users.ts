import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { UserAccountRow } from "@/lib/supabase/types";
import { assertUuid } from "@/lib/security/validation";

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  passwordHash: string | null;
  authSource: "credentials" | "google";
}

const USER_SELECT = "id,email,full_name,avatar_url,password_hash,auth_source,created_at,updated_at";

function toAppUser(row: UserAccountRow): AppUser {
  return {
    id: row.id,
    email: row.email,
    name: row.full_name,
    avatarUrl: row.avatar_url,
    passwordHash: row.password_hash,
    authSource: row.auth_source,
  };
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(email: string) {
  const client = getSupabaseAdminClient();
  const normalizedEmail = normalizeEmail(email);

  const { data, error } = await client
    .from("user_accounts")
    .select(USER_SELECT)
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load user by email: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return toAppUser(data);
}

export async function findUserById(userId: string) {
  assertUuid(userId, "userId");
  const client = getSupabaseAdminClient();

  const { data, error } = await client
    .from("user_accounts")
    .select(USER_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load user by id: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return toAppUser(data);
}

export async function createCredentialsUser(input: {
  email: string;
  name: string;
  passwordHash: string;
}) {
  const client = getSupabaseAdminClient();
  const normalizedEmail = normalizeEmail(input.email);

  const { data, error } = await client
    .from("user_accounts")
    .insert({
      email: normalizedEmail,
      full_name: input.name,
      password_hash: input.passwordHash,
      auth_source: "credentials",
    })
    .select(USER_SELECT)
    .single();

  if (error) {
    throw new Error(`Unable to create credentials user: ${error.message}`);
  }

  return toAppUser(data);
}

export async function ensureOAuthUser(input: {
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}) {
  const client = getSupabaseAdminClient();
  const normalizedEmail = normalizeEmail(input.email);
  const existing = await findUserByEmail(normalizedEmail);

  if (existing) {
    const existingName = existing.name?.trim();
    const incomingName = input.name?.trim();

    const shouldUpdateName = Boolean(incomingName && !existingName);
    const shouldUpdateAvatar = Boolean(input.avatarUrl && input.avatarUrl !== existing.avatarUrl);

    if (!shouldUpdateName && !shouldUpdateAvatar) {
      return existing;
    }

    const { data, error } = await client
      .from("user_accounts")
      .update({
        full_name: shouldUpdateName ? incomingName : existing.name,
        avatar_url: input.avatarUrl ?? existing.avatarUrl,
      })
      .eq("id", existing.id)
      .select(USER_SELECT)
      .single();

    if (error) {
      throw new Error(`Unable to update oauth user profile: ${error.message}`);
    }

    return toAppUser(data);
  }

  const { data, error } = await client
    .from("user_accounts")
    .insert({
      email: normalizedEmail,
      full_name: input.name ?? null,
      avatar_url: input.avatarUrl ?? null,
      auth_source: "google",
      password_hash: null,
    })
    .select(USER_SELECT)
    .single();

  if (error) {
    throw new Error(`Unable to create oauth user: ${error.message}`);
  }

  return toAppUser(data);
}

export async function updateUserName(userId: string, name: string) {
  assertUuid(userId, "userId");
  const client = getSupabaseAdminClient();

  const { data, error } = await client
    .from("user_accounts")
    .update({ full_name: name })
    .eq("id", userId)
    .select(USER_SELECT)
    .single();

  if (error) {
    throw new Error(`Unable to update user profile: ${error.message}`);
  }

  return toAppUser(data);
}