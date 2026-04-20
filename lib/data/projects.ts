import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ProjectStatus, UserProjectRow } from "@/lib/supabase/types";

export interface AppProject {
  id: string;
  userId: string;
  title: string;
  summary: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

const PROJECT_SELECT = "id,user_id,title,summary,status,created_at,updated_at";

function toAppProject(row: UserProjectRow): AppProject {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    summary: row.summary,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listProjectsByUser(userId: string) {
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

export async function ensureStarterProjects(userId: string) {
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