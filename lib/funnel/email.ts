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

function formatFromAddress(rawFrom?: string): string {
  const defaultSender = `Xync <${identity.email}>`;
  if (!rawFrom || !rawFrom.trim()) {
    return defaultSender;
  }
  const trimmed = rawFrom.trim();
  if (trimmed.includes("<") && trimmed.includes(">")) {
    return trimmed;
  }
  return `Xync <${trimmed}>`;
}

function getEmailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY,
    from: formatFromAddress(process.env.LEADS_EMAIL_FROM),
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

function buildClientSummaryHtml(lead: NormalizedLead): string {
  const items: Array<{ label: string; value: string }> = [];

  if (lead.labels.tipo) {
    items.push({ label: "Tipo de proyecto", value: lead.labels.tipo });
  }
  if (lead.labels.situacion) {
    items.push({ label: "Situación actual", value: lead.labels.situacion });
  }
  if (lead.labels.objetivo) {
    items.push({ label: "Objetivo principal", value: lead.labels.objetivo });
  }
  if (lead.labels.plazo) {
    items.push({ label: "Plazo previsto", value: lead.labels.plazo });
  }
  if (lead.labels.presupuesto) {
    items.push({ label: "Inversión estimada", value: lead.labels.presupuesto });
  }

  if (items.length === 0) return "";

  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 5px 0; font-size: 13px; color: #64748b; width: 40%; vertical-align: top;">${escapeHtml(item.label)}:</td>
        <td style="padding: 5px 0; font-size: 13px; font-weight: 600; color: #0f172a; vertical-align: top;">${escapeHtml(item.value)}</td>
      </tr>`
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0 24px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px;">
      <tr>
        <td colspan="2" style="padding-bottom: 6px; border-bottom: 1px solid #e2e8f0;">
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Resumen de tu solicitud</span>
        </td>
      </tr>
      <tr><td colspan="2" style="height: 6px;"></td></tr>
      ${rows}
    </table>
  `;
}

function buildClientSummaryText(lead: NormalizedLead): string {
  const items: string[] = [];
  if (lead.labels.tipo) items.push(`• Tipo de proyecto: ${lead.labels.tipo}`);
  if (lead.labels.situacion) items.push(`• Situación actual: ${lead.labels.situacion}`);
  if (lead.labels.objetivo) items.push(`• Objetivo principal: ${lead.labels.objetivo}`);
  if (lead.labels.plazo) items.push(`• Plazo previsto: ${lead.labels.plazo}`);
  if (lead.labels.presupuesto) items.push(`• Inversión estimada: ${lead.labels.presupuesto}`);

  if (items.length === 0) return "";
  return `RESUMEN DE TU SOLICITUD\n----------------------------------------\n${items.join("\n")}\n----------------------------------------\n\n`;
}

export async function sendClientLeadEmail(context: LeadEmailContext): Promise<EmailResult> {
  const { lead, leadId } = context;
  const booking = escapeHtml(bookingUrl());
  const summaryHtml = buildClientSummaryHtml(lead);
  const summaryText = buildClientSummaryText(lead);

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>Hemos recibido tu proyecto — Xync</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <div style="display: none; font-size: 1px; color: #f4f5f7; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Hemos recibido la información de tu proyecto en Xync. Te responderemos en menos de 24 horas con una propuesta a medida.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f5f7; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);">
          
          <!-- Cabecera / Marca -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a; text-transform: uppercase;">XYNC</span>
                    <span style="display: inline-block; margin-left: 8px; padding: 2px 8px; background-color: #f1f5f9; color: #64748b; font-size: 11px; font-weight: 600; border-radius: 4px; letter-spacing: 0.5px;">ESTUDIO DIGITAL</span>
                  </td>
                  <td align="right">
                    <span style="font-size: 12px; color: #94a3b8; font-weight: 500;">Salamanca, ES</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contenido principal -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a; line-height: 1.35;">
                Hemos recibido tu proyecto${lead.nombre ? `, ${escapeHtml(lead.nombre)}` : ""}
              </h1>
              
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                Muchas gracias por ponerte en contacto con nosotros${lead.empresa ? ` en nombre de <strong>${escapeHtml(lead.empresa)}</strong>` : ""}. Ya tenemos la información de tu proyecto y la estamos analizando personalmente para evaluar la mejor solución técnica y de conversión.
              </p>

              ${summaryHtml}

              <!-- Próximos pasos -->
              <div style="margin: 24px 0 20px 0;">
                <p style="margin: 0 0 14px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a;">
                  ¿Cuáles son los siguientes pasos?
                </p>
                
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding-bottom: 12px; vertical-align: top; width: 26px;">
                      <div style="background-color: #0f172a; color: #ffffff; font-size: 11px; font-weight: 700; width: 20px; height: 20px; border-radius: 50%; text-align: center; line-height: 20px;">1</div>
                    </td>
                    <td style="padding-bottom: 12px; padding-left: 10px; vertical-align: top;">
                      <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #334155;">
                        <strong style="color: #0f172a;">Revisión técnica y de alcance:</strong> Evaluamos tus necesidades para definir la arquitectura, el diseño y las optimizaciones necesarias.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 12px; vertical-align: top; width: 26px;">
                      <div style="background-color: #0f172a; color: #ffffff; font-size: 11px; font-weight: 700; width: 20px; height: 20px; border-radius: 50%; text-align: center; line-height: 20px;">2</div>
                    </td>
                    <td style="padding-bottom: 12px; padding-left: 10px; vertical-align: top;">
                      <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #334155;">
                        <strong style="color: #0f172a;">Propuesta personalizada en &lt; 24h:</strong> Te responderemos por email con una propuesta clara sobre alcance, plazos y presupuesto cerrado.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="vertical-align: top; width: 26px;">
                      <div style="background-color: #0f172a; color: #ffffff; font-size: 11px; font-weight: 700; width: 20px; height: 20px; border-radius: 50%; text-align: center; line-height: 20px;">3</div>
                    </td>
                    <td style="padding-left: 10px; vertical-align: top;">
                      <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #334155;">
                        <strong style="color: #0f172a;">Llamada de 15 minutos (opcional):</strong> Si prefieres agilizar la puesta en marcha o resolver dudas en directo, puedes agendar una videollamada.
                      </p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Bloque de llamada CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 26px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #0f172a;">
                      ¿Quieres acelerar el proceso?
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="border-radius: 6px; background-color: #0f172a;">
                          <a href="${booking}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px;">
                            Reservar llamada de 15 minutos &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 10px 0 0 0; font-size: 12px; color: #64748b;">
                      Sin compromiso · No necesitas preparar nada previo
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Nota de respuesta y firma -->
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Si deseas adjuntar enlaces de referencia, documentos o resolver cualquier cuestión, puedes <strong>responder directamente a este correo</strong>.
              </p>

              <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; margin-top: 20px;">
                <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">Alejandro Martín</p>
                <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b;">Fundador & Desarrollador en Xync</p>
              </div>
            </td>
          </tr>

          <!-- Pie de email -->
          <tr>
            <td style="padding: 22px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b; font-weight: 600;">
                Xync · Desarrollo web, tiendas online y productos digitales
              </p>
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #94a3b8;">
                <a href="https://www.xync.es" style="color: #64748b; text-decoration: underline;">www.xync.es</a> &nbsp;·&nbsp;
                <a href="mailto:contacto@xync.es" style="color: #64748b; text-decoration: underline;">contacto@xync.es</a> &nbsp;·&nbsp;
                Salamanca, España
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.4;">
                Has recibido este correo porque enviaste una solicitud de proyecto en nuestro sitio web.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Hola ${lead.nombre},\n\nMuchas gracias por ponerte en contacto con nosotros${lead.empresa ? ` en nombre de ${lead.empresa}` : ""}. Ya tenemos la información de tu proyecto y la estamos analizando personalmente para ofrecerte la mejor solución.\n\n${summaryText}¿CUÁLES SON LOS SIGUIENTES PASOS?\n1. Revisión técnica y de alcance: Evaluamos tus necesidades técnicas, de diseño y conversión.\n2. Propuesta personalizada en < 24h: Te responderemos por email con una propuesta clara sobre alcance, plazos y presupuesto cerrado.\n3. Llamada de 15 minutos (opcional): Si quieres agilizar el inicio, puedes reservar una llamada sin compromiso aquí:\n${bookingUrl()}\n\nSi deseas aportar más detalles o documentos, puedes responder directamente a este correo.\n\nUn saludo,\n\nAlejandro Martín\nFundador & Desarrollador en Xync\ncontacto@xync.es · https://www.xync.es\nSalamanca, España`;

  return sendEmail({
    to: lead.email,
    leadId,
    subject: "Hemos recibido tu solicitud de proyecto — Xync",
    html,
    text,
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
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:8px 12px 8px 0;vertical-align:top;font-size:13px;color:#64748b;font-weight:600;border-bottom:1px solid #f1f5f9">${escapeHtml(label)}</th><td style="padding:8px 0;font-size:13px;color:#0f172a;border-bottom:1px solid #f1f5f9">${escapeHtml(value || "—")}</td></tr>`
    )
    .join("");

  const text = rows.map(([label, value]) => `${label}: ${value || "—"}`).join("\n");

  return sendEmail({
    to: internalTo,
    leadId,
    subject: `[${lead.actualizacion ? "Actualización" : "Nuevo lead"} ${score.tier}] ${lead.nombre} — ${lead.labels.tipo}`,
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><title>Nuevo Lead</title></head>
<body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f8fafc;color:#0f172a;">
  <div style="max-width:680px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:24px 28px;box-shadow:0 2px 4px rgba(0,0,0,0.03)">
    <h2 style="margin:0 0 16px 0;font-size:18px;color:#0f172a;">${lead.actualizacion ? "Actualización de lead del funnel" : "Nuevo lead del funnel"}</h2>
    <table style="width:100%;border-collapse:collapse">${htmlRows}</table>
  </div>
</body>
</html>`,
    text: `${lead.actualizacion ? "Actualización de lead del funnel" : "Nuevo lead del funnel"}\n\n${text}`,
  });
}
