"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { updateLeadStatusInSupabase, updateLeadNotesInSupabase } from "@/lib/supabase/server";
import type { LeadStatus } from "@/lib/supabase/types";

/**
 * Server Action para actualizar el estado de un lead desde el dashboard.
 */
export async function updateLeadStatusAction(id: string, status: LeadStatus) {
  // Asegurar que el usuario tiene permisos de administrador
  await requireAdmin();

  const result = await updateLeadStatusInSupabase(id, status);

  if (result.ok) {
    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${id}`);
  }

  return result;
}

/**
 * Server Action para actualizar las notas internas de un lead.
 */
export async function updateLeadNotesAction(id: string, notes: string) {
  await requireAdmin();

  const result = await updateLeadNotesInSupabase(id, notes);

  if (result.ok) {
    revalidatePath(`/admin/leads/${id}`);
    revalidatePath("/admin/leads");
  }

  return result;
}
