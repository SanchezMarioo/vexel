import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PaymentStatus, ProjectPaymentRow } from "@/lib/supabase/types";
import { assertUuid } from "@/lib/security/validation";

const PAYMENT_SELECT = "id,project_id,description,amount,due_date,status,paid_at,created_at,updated_at";

export interface AppPayment {
  id: string;
  projectId: string;
  description: string;
  amount: number;
  dueDate: string | null;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function toAppPayment(row: ProjectPaymentRow): AppPayment {
  return {
    id: row.id,
    projectId: row.project_id,
    description: row.description,
    amount: Number(row.amount),
    dueDate: row.due_date,
    status: row.status,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listPaymentsByProject(projectId: string): Promise<AppPayment[]> {
  assertUuid(projectId, "projectId");
  const client = getSupabaseAdminClient();

  const { data, error } = await client
    .from("project_payments")
    .select(PAYMENT_SELECT)
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Unable to list payments: ${error.message}`);
  }

  return data.map(toAppPayment);
}

export async function createPayment(
  projectId: string,
  input: { description: string; amount: number; dueDate?: string | null },
): Promise<AppPayment> {
  assertUuid(projectId, "projectId");
  const client = getSupabaseAdminClient();

  const { data, error } = await client
    .from("project_payments")
    .insert({
      project_id: projectId,
      description: input.description,
      amount: input.amount,
      due_date: input.dueDate ?? null,
    })
    .select(PAYMENT_SELECT)
    .single();

  if (error) {
    throw new Error(`Unable to create payment: ${error.message}`);
  }

  return toAppPayment(data);
}

export async function updatePayment(
  paymentId: string,
  input: {
    description?: string;
    amount?: number;
    dueDate?: string | null;
    status?: PaymentStatus;
  },
): Promise<AppPayment> {
  assertUuid(paymentId, "paymentId");
  const client = getSupabaseAdminClient();

  const update: Record<string, unknown> = {};
  if (input.description !== undefined) update.description = input.description;
  if (input.amount !== undefined) update.amount = input.amount;
  if (input.dueDate !== undefined) update.due_date = input.dueDate;
  if (input.status !== undefined) {
    update.status = input.status;
    update.paid_at = input.status === "paid" ? new Date().toISOString() : null;
  }

  const { data, error } = await client
    .from("project_payments")
    .update(update)
    .eq("id", paymentId)
    .select(PAYMENT_SELECT)
    .single();

  if (error) {
    throw new Error(`Unable to update payment: ${error.message}`);
  }

  return toAppPayment(data);
}

export async function deletePayment(paymentId: string): Promise<void> {
  assertUuid(paymentId, "paymentId");
  const client = getSupabaseAdminClient();

  const { error } = await client.from("project_payments").delete().eq("id", paymentId);

  if (error) {
    throw new Error(`Unable to delete payment: ${error.message}`);
  }
}
