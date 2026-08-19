import "server-only";

import { insertLeadInSupabase } from "@/lib/supabase/server";
import type { LeadInsert } from "@/lib/supabase/types";
import type { NormalizedLead } from "./lead";
import type { LeadScore } from "./score";

export interface FunnelDelivery {
  lead: NormalizedLead;
  leadId: string;
  createdAt: string;
  score: LeadScore;
}

/**
 * Guarda el lead en Supabase (fuente principal y definitiva de persistencia para Xync).
 */
export async function deliverToSupabase(
  input: FunnelDelivery,
): Promise<{ ok: boolean; error?: string }> {
  const { lead, leadId, createdAt, score } = input;

  const leadPayload: LeadInsert = {
    id: leadId,
    created_at: createdAt,
    status: "nuevo",
    nombre: lead.nombre,
    empresa: lead.empresa || null,
    email: lead.email,
    telefono: lead.telefono || null,
    descripcion: lead.descripcion || null,
    situacion: lead.labels.situacion || lead.situacion,
    situacion_detalle: lead.situacionDetalle || null,
    tipo: lead.labels.tipo || lead.tipo,
    objetivo: lead.labels.objetivo || lead.objetivo || null,
    catalogo: lead.labels.catalogo || lead.catalogo || null,
    web_actual: lead.labels.webActual || lead.webActual || null,
    presupuesto: lead.labels.presupuesto || lead.presupuesto,
    plazo: lead.labels.plazo || lead.plazo,
    landing_page: lead.landing_page || null,
    form_page: lead.form_page || null,
    current_url: lead.current_url || null,
    referrer: lead.referrer || null,
    utm_source: lead.utm_source || null,
    utm_medium: lead.utm_medium || null,
    utm_campaign: lead.utm_campaign || null,
    utm_content: lead.utm_content || null,
    utm_term: lead.utm_term || null,
    score_value: score.value,
    score_tier: score.tier,
    score_reasons: score.reasons,
    is_update: lead.actualizacion ?? false,
    notes: "",
    raw_answers: lead as unknown as Record<string, unknown>,
  };

  return insertLeadInSupabase(leadPayload);
}

/**
 * Orquestador principal de entrega del lead del funnel.
 * Supabase es la fuente principal de almacenamiento.
 */
export async function deliverFunnelLead(
  input: FunnelDelivery,
): Promise<{ ok: boolean; message?: string }> {
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  // En local sin Supabase configurado, registramos en consola para desarrollo
  if (!hasSupabaseConfig) {
    console.info("[funnel] lead recibido en desarrollo (Supabase no configurado)", {
      lead_id: input.leadId,
      score: input.score.value,
      tier: input.score.tier,
    });
    return { ok: true };
  }

  const result = await deliverToSupabase(input);

  if (!result.ok) {
    console.error("[funnel] fallo al guardar el lead en Supabase:", result.error);
    return {
      ok: false,
      message: "No pudimos guardar tus respuestas. Por favor, inténtalo de nuevo en unos momentos.",
    };
  }

  return { ok: true };
}
