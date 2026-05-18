import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { MessageSenderRole, ProjectMessageRow } from "@/lib/supabase/types";
import { assertUuid } from "@/lib/security/validation";

const MESSAGE_SELECT = "id,project_id,sender_id,sender_role,content,image_urls,created_at";

export interface AppMessage {
  id: string;
  projectId: string;
  senderId: string;
  senderRole: MessageSenderRole;
  content: string;
  imageUrls: string[];
  createdAt: string;
}

function toAppMessage(row: ProjectMessageRow): AppMessage {
  return {
    id: row.id,
    projectId: row.project_id,
    senderId: row.sender_id,
    senderRole: row.sender_role,
    content: row.content,
    imageUrls: row.image_urls ?? [],
    createdAt: row.created_at,
  };
}

export async function listMessagesByProject(projectId: string): Promise<AppMessage[]> {
  assertUuid(projectId, "projectId");
  const client = getSupabaseAdminClient();

  const { data, error } = await client
    .from("project_messages")
    .select(MESSAGE_SELECT)
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Unable to list messages: ${error.message}`);
  }

  return data.map(toAppMessage);
}

export async function createMessage(
  projectId: string,
  senderId: string,
  senderRole: MessageSenderRole,
  content: string,
  imageUrls: string[] = [],
): Promise<AppMessage> {
  assertUuid(projectId, "projectId");
  assertUuid(senderId, "senderId");
  const client = getSupabaseAdminClient();

  const { data, error } = await client
    .from("project_messages")
    .insert({ project_id: projectId, sender_id: senderId, sender_role: senderRole, content, image_urls: imageUrls })
    .select(MESSAGE_SELECT)
    .single();

  if (error) {
    throw new Error(`Unable to create message: ${error.message}`);
  }

  return toAppMessage(data);
}
