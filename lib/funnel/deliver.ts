import "server-only";

import type { NormalizedLead } from "./lead";
import type { LeadScore } from "./score";

export interface FunnelDelivery {
  lead: NormalizedLead;
  leadId: string;
  createdAt: string;
  score: LeadScore;
}

/**
 * Entrega del lead en Google Sheets vía Apps Script (server→server, sin CORS),
 * la misma integración que usa /api/contact. PRIORIDAD: guardar el lead está
 * por encima de todo lo demás; si no hay webhook configurado (p. ej. en local)
 * se registra en consola y se confirma, igual que hace el formulario clásico.
 */
const DANGEROUS_FORMULA_CHARS = /^[=+\-@\t\r]/;

export function sanitizeForSheet(value: string | undefined): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (DANGEROUS_FORMULA_CHARS.test(trimmed)) {
    return `'${trimmed}`;
  }
  return trimmed;
}

export async function deliverFunnelLead(
  input: FunnelDelivery,
): Promise<{ ok: boolean; message?: string }> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhookUrl) {
    console.info("[funnel] lead recibido (sin webhook configurado)", {
      lead_id: input.leadId,
      score: input.score.value,
      tier: input.score.tier,
    });
    return { ok: true };
  }

  const { lead, leadId, createdAt, score } = input;

  try {
    const sheetRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(process.env.GOOGLE_SHEETS_WEBHOOK_SECRET
          ? { secret: process.env.GOOGLE_SHEETS_WEBHOOK_SECRET }
          : {}),
        lead_id: leadId,
        created_at: createdAt,
        fecha: createdAt,
        status: "nuevo",
        actualizacion: lead.actualizacion ? "sí" : "no",
        nombre: sanitizeForSheet(lead.nombre),
        email: sanitizeForSheet(lead.email),
        situacion: sanitizeForSheet(lead.labels.situacion),
        situacion_detalle: sanitizeForSheet(lead.situacionDetalle),
        tipo: sanitizeForSheet(lead.labels.tipo),
        catalogo: sanitizeForSheet(lead.labels.catalogo),
        web_actual: sanitizeForSheet(lead.labels.webActual),
        presupuesto: sanitizeForSheet(lead.labels.presupuesto),
        plazo: sanitizeForSheet(lead.labels.plazo),
        landing_page: sanitizeForSheet(lead.landing_page),
        form_page: sanitizeForSheet(lead.form_page),
        current_url: sanitizeForSheet(lead.current_url),
        referrer: sanitizeForSheet(lead.referrer),
        utm_source: sanitizeForSheet(lead.utm_source),
        utm_medium: sanitizeForSheet(lead.utm_medium),
        utm_campaign: sanitizeForSheet(lead.utm_campaign),
        utm_content: sanitizeForSheet(lead.utm_content),
        utm_term: sanitizeForSheet(lead.utm_term),
        lead_score: score.value,
        lead_temperature: score.tier,
        lead_score_reasons: score.reasons.map((r) => sanitizeForSheet(r)).join(", "),
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!sheetRes.ok) {
      console.error("[funnel] Apps Script respondió con", sheetRes.status);
      return {
        ok: false,
        message: "No pudimos enviar tus respuestas. Inténtalo de nuevo.",
      };
    }
  } catch (deliveryError) {
    console.error("[funnel] fallo al entregar en Sheets", deliveryError);
    return {
      ok: false,
      message: "No pudimos enviar tus respuestas. Inténtalo de nuevo.",
    };
  }

  return { ok: true };
}
