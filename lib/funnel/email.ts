import "server-only";

import { identity } from "@/lib/portfolio/content";
import type { NormalizedLead } from "./lead";
import type { LeadScore } from "./score";

interface LeadEmailContext {
  lead: NormalizedLead;
  leadId: string;
  createdAt: string;
  score: LeadScore;
}

interface EmailResult {
  ok: boolean;
  reason?: string;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getEmailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.LEADS_EMAIL_FROM,
    internalTo: process.env.LEADS_INTERNAL_EMAIL ?? "contacto@xync.es",
  };
}

/** Enlace de reserva: misma integración Cal.com que el sitio (CalButton). */
function bookingUrl() {
  return `https://cal.com/${identity.calUrl}`;
}

async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  leadId: string;
}): Promise<EmailResult> {
  const { apiKey, from } = getEmailConfig();
  if (!apiKey || !from) {
    return { ok: false, reason: "email configuration missing" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `xync-lead-${input.leadId}-${input.to}`,
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return { ok: false, reason: `provider status ${response.status}` };
    }

    return { ok: true };
  } catch (error) {
    console.error("[funnel] email delivery failed", error instanceof Error ? error.name : "unknown");
    return { ok: false, reason: "provider request failed" };
  }
}

export async function sendClientLeadEmail(context: LeadEmailContext): Promise<EmailResult> {
  const { lead, leadId } = context;
  const booking = escapeHtml(bookingUrl());

  return sendEmail({
    to: lead.email,
    leadId,
    subject: "Hemos recibido tu proyecto — Xync",
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:600px"><p>Hola ${escapeHtml(lead.nombre)},</p><p>Hemos recibido la información de tu proyecto y vamos a revisarla personalmente. Te responderemos con una orientación clara sobre el siguiente paso.</p><p>Si quieres acelerar el proceso, puedes reservar una llamada de 20 minutos con nosotros. No necesitas preparar nada: hablaremos de tu proyecto, tus objetivos y los próximos pasos.</p><p style="margin:28px 0"><a href="${booking}" style="background:#111;color:#fff;padding:13px 18px;text-decoration:none">Reservar una llamada de 20 minutos</a></p><p>Y si prefieres esperar, no pasa nada: te escribimos pronto.</p><p>Un saludo,<br />Xync</p></div>`,
    text: `Hola ${lead.nombre},\n\nHemos recibido la información de tu proyecto y vamos a revisarla personalmente. Te responderemos con una orientación clara sobre el siguiente paso.\n\nSi quieres acelerar el proceso, puedes reservar una llamada de 20 minutos con nosotros. No necesitas preparar nada: hablaremos de tu proyecto, tus objetivos y los próximos pasos.\n\nReservar una llamada de 20 minutos: ${bookingUrl()}\n\nY si prefieres esperar, no pasa nada: te escribimos pronto.\n\nUn saludo,\nXync`,
  });
}

export async function sendInternalLeadEmail(context: LeadEmailContext): Promise<EmailResult> {
  const { lead, leadId, createdAt, score } = context;
  const { internalTo } = getEmailConfig();
  const rows = [
    ["Tipo", lead.actualizacion ? "ACTUALIZACIÓN de lead existente" : "NUEVO LEAD"],
    ["Nombre", lead.nombre],
    ["Empresa", lead.empresa || "—"],
    ["Email", lead.email],
    ["Teléfono", lead.telefono || "—"],
    ["Situación", lead.labels.situacion],
    ["Detalle", lead.situacionDetalle || "—"],
    ["Proyecto", lead.labels.tipo],
    ["Objetivo", lead.labels.objetivo || "—"],
    ["Catálogo", lead.labels.catalogo || "—"],
    ["Web actual", lead.labels.webActual || "—"],
    ["Inversión", lead.labels.presupuesto],
    ["Plazo", lead.labels.plazo],
    ["Descripción", lead.descripcion || "—"],
    ["Landing page", lead.landing_page],
    ["Form page", lead.form_page],
    ["URL de envío", lead.current_url],
    ["Referrer", lead.referrer],
    ["UTM source", lead.utm_source],
    ["UTM medium", lead.utm_medium],
    ["UTM campaign", lead.utm_campaign],
    ["UTM content", lead.utm_content],
    ["UTM term", lead.utm_term],
    ["Lead score", `${score.value}/100 (${score.tier})`],
    ["Motivos", score.reasons.join(", ")],
    ["Lead ID", leadId],
    ["Fecha", createdAt],
  ] as const;
  const htmlRows = rows
    .map(([label, value]) => `<tr><th align="left" style="padding:6px 12px 6px 0;vertical-align:top">${escapeHtml(label)}</th><td style="padding:6px 0">${escapeHtml(value || "—")}</td></tr>`)
    .join("");
  const text = rows.map(([label, value]) => `${label}: ${value || "—"}`).join("\n");

  return sendEmail({
    to: internalTo,
    leadId,
    subject: `[${lead.actualizacion ? "Actualización" : "Nuevo lead"} ${score.tier}] ${lead.nombre} — ${lead.labels.tipo}`,
    html: `<div style="font-family:Arial,sans-serif;color:#111;max-width:700px"><h2>${lead.actualizacion ? "Actualización de lead del funnel" : "Nuevo lead del funnel"}</h2><table style="border-collapse:collapse">${htmlRows}</table></div>`,
    text: `${lead.actualizacion ? "Actualización de lead del funnel" : "Nuevo lead del funnel"}\n\n${text}`,
  });
}
