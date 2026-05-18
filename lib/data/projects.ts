import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ProjectStatus, UserProjectRow } from "@/lib/supabase/types";
import { assertUuid } from "@/lib/security/validation";

export interface AppProject {
  id: string;
  userId: string;
  title: string;
  summary: string | null;
  status: ProjectStatus;
  budgetFinal: number | null;
  estimatedDays: number | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

const PROJECT_SELECT =
  "id,user_id,title,summary,status,request_id,budget_final,estimated_days,admin_notes,created_at,updated_at";

function toAppProject(row: UserProjectRow): AppProject {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    summary: row.summary,
    status: row.status,
    budgetFinal: row.budget_final,
    estimatedDays: row.estimated_days,
    adminNotes: row.admin_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listProjectsByUser(userId: string) {
  assertUuid(userId, "userId");
  const client = getSupabaseAdminClient();

  const { data, error } = await client
    .from("user_projects")
    .select(PROJECT_SELECT)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to list projects: ${error.message}`);
  }

  return data.map(toAppProject);
}

export async function getProjectByIdForUser(userId: string, projectId: string) {
  assertUuid(userId, "userId");
  assertUuid(projectId, "projectId");
  const client = getSupabaseAdminClient();

  const { data, error } = await client
    .from("user_projects")
    .select(PROJECT_SELECT)
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load project detail: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return toAppProject(data);
}

export async function getProjectById(projectId: string) {
  assertUuid(projectId, "projectId");
  const client = getSupabaseAdminClient();

  const { data, error } = await client
    .from("user_projects")
    .select(PROJECT_SELECT)
    .eq("id", projectId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load project: ${error.message}`);
  }

  return data ? toAppProject(data) : null;
}

export async function updateProject(
  projectId: string,
  input: {
    title?: string;
    summary?: string | null;
    status?: ProjectStatus;
    budgetFinal?: number | null;
    estimatedDays?: number | null;
    adminNotes?: string | null;
  },
) {
  assertUuid(projectId, "projectId");
  const client = getSupabaseAdminClient();

  const update: Record<string, unknown> = {};
  if (input.title !== undefined) update.title = input.title;
  if (input.summary !== undefined) update.summary = input.summary;
  if (input.status !== undefined) update.status = input.status;
  if (input.budgetFinal !== undefined) update.budget_final = input.budgetFinal;
  if (input.estimatedDays !== undefined) update.estimated_days = input.estimatedDays;
  if (input.adminNotes !== undefined) update.admin_notes = input.adminNotes;

  const { data, error } = await client
    .from("user_projects")
    .update(update)
    .eq("id", projectId)
    .select(PROJECT_SELECT)
    .single();

  if (error) {
    throw new Error(`Unable to update project: ${error.message}`);
  }

  return toAppProject(data);
}

export async function deleteProject(projectId: string): Promise<void> {
  assertUuid(projectId, "projectId");
  const client = getSupabaseAdminClient();

  const { error } = await client.from("user_projects").delete().eq("id", projectId);

  if (error) {
    throw new Error(`Unable to delete project: ${error.message}`);
  }
}

export async function ensureStarterProjects(userId: string) {
  assertUuid(userId, "userId");
  const client = getSupabaseAdminClient();

  const { count, error: countError } = await client
    .from("user_projects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) {
    throw new Error(`Unable to verify starter projects: ${countError.message}`);
  }

  if ((count ?? 0) > 0) {
    return;
  }

  const starterProjects = [
    {
      user_id: userId,
      title: "Landing page principal",
      summary: "Version inicial para captar leads con CTA principal y formulario.",
      status: "active" as ProjectStatus,
    },
    {
      user_id: userId,
      title: "Campana local de temporada",
      summary: "Pagina orientada a promocion temporal para trafico local.",
      status: "draft" as ProjectStatus,
    },
  ];

  const { error } = await client.from("user_projects").insert(starterProjects);

  if (error) {
    throw new Error(`Unable to seed starter projects: ${error.message}`);
  }
}
