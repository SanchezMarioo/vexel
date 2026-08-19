import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Lead, LeadInsert, LeadStatus, LeadStats } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Cliente de Supabase para operaciones en servidor con permisos de service_role.
 * Bypasses RLS de forma controlada exclusivamente tras autenticar y autorizar en el backend.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Inserta un nuevo lead en Supabase.
 */
export async function insertLeadInSupabase(
  lead: LeadInsert,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "Supabase no configurado (SUPABASE_SERVICE_ROLE_KEY ausente)." };
  }

  try {
    const { data, error } = await supabase
      .from("leads")
      .insert([lead])
      .select("id")
      .single();

    if (error) {
      console.error("[supabase] error insertando lead:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true, id: data.id };
  } catch (err) {
    console.error("[supabase] excepción al insertar lead:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

/**
 * Obtiene lista de leads con filtros y ordenación.
 */
export async function getLeadsFromSupabase(options?: {
  status?: LeadStatus | "todos";
  search?: string;
  limit?: number;
  offset?: number;
  tier?: string;
}): Promise<{ leads: Lead[]; count: number; error?: string }> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { leads: [], count: 0, error: "Supabase no configurado" };
  }

  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;

  try {
    let query = supabase
      .from("leads")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (options?.status && options.status !== "todos") {
      query = query.eq("status", options.status);
    }

    if (options?.tier && options.tier !== "all") {
      query = query.eq("score_tier", options.tier);
    }

    if (options?.search && options.search.trim()) {
      const term = `%${options.search.trim()}%`;
      query = query.or(`nombre.ilike.${term},email.ilike.${term},empresa.ilike.${term}`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("[supabase] error obteniendo leads:", error);
      return { leads: [], count: 0, error: error.message };
    }

    return { leads: (data as Lead[]) ?? [], count: count ?? 0 };
  } catch (err) {
    console.error("[supabase] excepción al obtener leads:", err);
    return { leads: [], count: 0, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

/**
 * Obtiene el detalle de un lead por su ID.
 */
export async function getLeadByIdFromSupabase(id: string): Promise<Lead | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Lead;
  } catch {
    return null;
  }
}

/**
 * Actualiza el estado de un lead.
 */
export async function updateLeadStatusInSupabase(
  id: string,
  status: LeadStatus,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "Supabase no configurado" };
  }

  try {
    const { error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", id);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

/**
 * Actualiza las notas internas de un lead.
 */
export async function updateLeadNotesInSupabase(
  id: string,
  notes: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "Supabase no configurado" };
  }

  try {
    const { error } = await supabase
      .from("leads")
      .update({ notes })
      .eq("id", id);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

/**
 * Elimina un lead por su ID.
 */
export async function deleteLeadFromSupabase(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "Supabase no configurado" };
  }

  try {
    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[supabase] error eliminando lead:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    console.error("[supabase] excepción al eliminar lead:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

/**
 * Métricas agregadas de leads por estado.
 */
export async function getLeadsStatsFromSupabase(): Promise<LeadStats> {
  const defaultStats: LeadStats = {
    total: 0,
    nuevo: 0,
    contactado: 0,
    llamada_agendada: 0,
    propuesta_enviada: 0,
    ganado: 0,
    perdido: 0,
  };

  const supabase = getSupabaseServerClient();
  if (!supabase) return defaultStats;

  try {
    const { data, error } = await supabase
      .from("leads")
      .select("status");

    if (error || !data) return defaultStats;

    const stats = { ...defaultStats, total: data.length };
    for (const item of data) {
      const status = item.status as LeadStatus;
      if (status in stats) {
        stats[status] += 1;
      }
    }

    return stats;
  } catch {
    return defaultStats;
  }
}
