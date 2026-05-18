import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ProjectRequestRow, RequestStatus } from "@/lib/supabase/types";
import { assertUuid } from "@/lib/security/validation";
import type { AppProject } from "@/lib/data/projects";

const REQUEST_SELECT =
  "id,user_id,title,description,project_type,budget,reference_url,status,admin_note,created_at,updated_at";

export interface AppRequest {
  id: string;
  userId: string;
  title: string;
  description: string;
  projectType: string;
  budget: string | null;
  referenceUrl: string | null;
  status: RequestStatus;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

function toAppRequest(row: ProjectRequestRow): AppRequest {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    projectType: row.project_type,
    budget: row.budget,
    referenceUrl: row.reference_url,
    status: row.status,
    adminNote: row.admin_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createProjectRequest(
  userId: string,
  input: {
    title: string;
    description: string;
    projectType: string;
    budget?: string;
    referenceUrl?: string;
  },
): Promise<AppRequest> {
  assertUuid(userId, "userId");
  const client = getSupabaseAdminClient();

  const { data, error } = await client
    .from("project_requests")
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description,
      project_type: input.projectType as ProjectRequestRow["project_type"],
      budget: input.budget ?? null,
      reference_url: input.referenceUrl ?? null,
    })
    .select(REQUEST_SELECT)
    .single();

  if (error) {
    throw new Error(`Unable to create project request: ${error.message}`);
  }

  return toAppRequest(data);
}

export async function listRequestsByUser(userId: string): Promise<AppRequest[]> {
  assertUuid(userId, "userId");
  const client = getSupabaseAdminClient();

  const { data, error } = await client
    .from("project_requests")
    .select(REQUEST_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to list requests: ${error.message}`);
  }

  return data.map(toAppRequest);
}

export async function getRequestById(id: string): Promise<AppRequest | null> {
  assertUuid(id, "id");
  const client = getSupabaseAdminClient();

  const { data, error } = await client
    .from("project_requests")
    .select(REQUEST_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load request: ${error.message}`);
  }

  return data ? toAppRequest(data) : null;
}

export async function listAllRequests(status?: RequestStatus): Promise<AppRequest[]> {
  const client = getSupabaseAdminClient();

  let query = client
    .from("project_requests")
    .select(REQUEST_SELECT)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Unable to list all requests: ${error.message}`);
  }

  return data.map(toAppRequest);
}

export async function acceptRequest(
  requestId: string,
  adminNote?: string,
): Promise<{ request: AppRequest; project: AppProject }> {
  assertUuid(requestId, "requestId");
  const client = getSupabaseAdminClient();

  const request = await getRequestById(requestId);

  if (!request) {
    throw new Error("Request not found.");
  }

  const { data: projectData, error: projectError } = await client
    .from("user_projects")
    .insert({
      user_id: request.userId,
      title: request.title,
      summary: request.description,
      status: "active",
      request_id: requestId,
    })
    .select("id,user_id,title,summary,status,request_id,created_at,updated_at")
    .single();

  if (projectError) {
    throw new Error(`Unable to create project from request: ${projectError.message}`);
  }

  const { data: requestData, error: requestError } = await client
    .from("project_requests")
    .update({ status: "accepted", admin_note: adminNote ?? null })
    .eq("id", requestId)
    .select(REQUEST_SELECT)
    .single();

  if (requestError) {
    throw new Error(`Unable to update request status: ${requestError.message}`);
  }

  const project: AppProject = {
    id: projectData.id,
    userId: projectData.user_id,
    title: projectData.title,
    summary: projectData.summary,
    status: projectData.status,
    createdAt: projectData.created_at,
    updatedAt: projectData.updated_at,
  };

  return { request: toAppRequest(requestData), project };
}

export async function rejectRequest(requestId: string, adminNote?: string): Promise<AppRequest> {
  assertUuid(requestId, "requestId");
  const client = getSupabaseAdminClient();

  const { data, error } = await client
    .from("project_requests")
    .update({ status: "rejected", admin_note: adminNote ?? null })
    .eq("id", requestId)
    .select(REQUEST_SELECT)
    .single();

  if (error) {
    throw new Error(`Unable to reject request: ${error.message}`);
  }

  return toAppRequest(data);
}

export async function getRequestByProjectId(projectId: string): Promise<AppRequest | null> {
  assertUuid(projectId, "projectId");
  const client = getSupabaseAdminClient();

  const { data: projectData, error: projectError } = await client
    .from("user_projects")
    .select("request_id")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError || !projectData?.request_id) {
    return null;
  }

  return getRequestById(projectData.request_id);
}
