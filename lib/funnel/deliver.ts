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
export async function deliverFunnelLead(
  input: FunnelDelivery,
): Promise<{ ok: boolean; message?: string }> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const webhookSecret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;
  
  // En producción, el secret es OBLIGATORIO para evitar acceso no autorizado
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction && !webhookSecret) {
    console.error("[funnel] GOOGLE_SHEETS_WEBHOOK_SECRET no configurado en producción");
    return { 
      ok: false, 
      message: "Configuración incompleta. Contacta con soporte." 
    };
  }

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
        secret: webhookSecret,
        lead_id: leadId,
        created_at: createdAt,
        fecha: createdAt,
        status: "nuevo",
        actualizacion: lead.actualizacion ? "sí" : "no",
        nombre: lead.nombre,
        email: lead.email,
        situacion: lead.labels.situacion,
        situacion_detalle: lead.situacionDetalle,
        tipo: lead.labels.tipo,
        catalogo: lead.labels.catalogo,
        web_actual: lead.labels.webActual,
        presupuesto: lead.labels.presupuesto,
        plazo: lead.labels.plazo,
        landing_page: lead.landing_page,
        form_page: lead.form_page,
        current_url: lead.current_url,
        referrer: lead.referrer,
        utm_source: lead.utm_source,
        utm_medium: lead.utm_medium,
        utm_campaign: lead.utm_campaign,
        utm_content: lead.utm_content,
        utm_term: lead.utm_term,
        lead_score: score.value,
        lead_temperature: score.tier,
        lead_score_reasons: score.reasons.join(", "),
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
