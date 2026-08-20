import "server-only";

import type { NormalizedLead } from "@/lib/funnel/lead";
import type { LeadScore } from "@/lib/funnel/score";
import { toAbsoluteUrl } from "@/lib/site-url";

export interface TelegramLeadContext {
  lead: NormalizedLead;
  leadId: string;
  createdAt?: string;
  score: LeadScore;
}

export interface GenericTelegramLeadInput {
  leadId: string;
  nombre: string;
  empresa?: string | null;
  email?: string | null;
  telefono?: string | null;
  servicio?: string | null;
  presupuesto?: string | null;
  plazo?: string | null;
  objetivo?: string | null;
  proyecto?: string | null;
  landingPage?: string | null;
  fuente?: string | null;
  scoreTier?: "alta" | "media" | "baja";
  scoreValue?: number;
  isUpdate?: boolean;
}

export interface TelegramResult {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
}

// ── Deduplicación en memoria ──────────────────────────────────────────
const recentSentLeadIds = new Map<string, number>();
const DEDUP_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_DEDUP_ENTRIES = 1000;

function shouldSkipDuplicate(leadId: string): boolean {
  if (!leadId) return false;
  const now = Date.now();

  // Limpieza periódica de registros antiguos si el mapa crece
  if (recentSentLeadIds.size > MAX_DEDUP_ENTRIES) {
    for (const [id, timestamp] of recentSentLeadIds.entries()) {
      if (now - timestamp > DEDUP_WINDOW_MS) {
        recentSentLeadIds.delete(id);
      }
    }
  }

  const lastSent = recentSentLeadIds.get(leadId);
  if (lastSent && now - lastSent < DEDUP_WINDOW_MS) {
    return true;
  }

  recentSentLeadIds.set(leadId, now);
  return false;
}

// ── Escape HTML seguro para Telegram ─────────────────────────────────
export function escapeTelegramHtml(value: string | null | undefined): string {
  if (!value) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeSecrets(message: string, token?: string): string {
  if (!token || !token.trim()) return message;
  try {
    const regex = new RegExp(escapeRegex(token.trim()), "gi");
    return message.replace(regex, "[REDACTED_BOT_TOKEN]");
  } catch {
    return message;
  }
}

// ── Formateo de atribución ───────────────────────────────────────────
function formatAttribution(lead: {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  referrer?: string | null;
}): string {
  const source = lead.utm_source?.trim();
  const medium = lead.utm_medium?.trim();

  if (source && medium) {
    return `${source} / ${medium}`;
  }
  if (source) {
    return source;
  }
  if (lead.referrer?.trim()) {
    try {
      const parsed = new URL(lead.referrer.trim());
      return parsed.hostname.replace(/^www\./, "");
    } catch {
      return lead.referrer.trim();
    }
  }
  return "Directo / Orgánico";
}

// ── Formateo de URL de Landing ────────────────────────────────────────
function formatLandingUrl(landingPath?: string | null): string {
  if (!landingPath || !landingPath.trim()) {
    return toAbsoluteUrl("/");
  }
  return toAbsoluteUrl(landingPath.trim());
}

// ── Construcción del Mensaje HTML ────────────────────────────────────
function formatLeadTelegramMessage(input: GenericTelegramLeadInput, adminUrl: string): string {
  const header = input.isUpdate ? "🚀 <b>ACTUALIZACIÓN DE LEAD</b>" : "🚀 <b>NUEVO LEAD</b>";

  let tierBadge = "🔥 <b>HOT</b>";
  if (input.scoreTier === "media") {
    tierBadge = "⚡ <b>WARM</b>";
  } else if (input.scoreTier === "baja") {
    tierBadge = "❄️ <b>COLD</b>";
  }

  const empresa = escapeTelegramHtml(input.empresa?.trim() || "—");
  const contacto = escapeTelegramHtml(input.nombre?.trim() || "—");
  const servicio = escapeTelegramHtml(input.servicio?.trim() || "—");
  const presupuesto = escapeTelegramHtml(input.presupuesto?.trim() || "—");
  const plazo = escapeTelegramHtml(input.plazo?.trim() || "—");
  const objetivo = escapeTelegramHtml(input.objetivo?.trim() || "—");
  const proyecto = escapeTelegramHtml(input.proyecto?.trim() || "—");
  const landing = escapeTelegramHtml(formatLandingUrl(input.landingPage));
  const fuente = escapeTelegramHtml(input.fuente || "Directo / Orgánico");

  return [
    header,
    "",
    tierBadge,
    "",
    `<b>Empresa:</b> ${empresa}`,
    `<b>Contacto:</b> ${contacto}`,
    "",
    `<b>Servicio:</b> ${servicio}`,
    `<b>Presupuesto:</b> ${presupuesto}`,
    `<b>Plazo:</b> ${plazo}`,
    "",
    "<b>Objetivo:</b>",
    objetivo,
    "",
    "<b>Proyecto:</b>",
    proyecto,
    "",
    "<b>Landing:</b>",
    landing,
    "",
    "<b>Fuente:</b>",
    fuente,
    "",
    `👉 <a href="${adminUrl}"><b>[ 👁 Ver lead ]</b></a>`,
  ].join("\n");
}

// ── Envío a Telegram Bot API ──────────────────────────────────────────
export async function sendTelegramNotification(
  input: GenericTelegramLeadInput,
): Promise<TelegramResult> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        "[telegram] notificación no enviada: TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID ausentes.",
      );
    }
    return { ok: false, reason: "credentials_missing" };
  }

  // Deduplicación para evitar duplicados por reintentos de cliente
  if (shouldSkipDuplicate(input.leadId)) {
    console.info(`[telegram] notificación duplicada omitida para lead ${input.leadId}`);
    return { ok: true, skipped: true };
  }

  const adminUrl = toAbsoluteUrl(`/admin/leads/${encodeURIComponent(input.leadId)}`);
  const text = formatLeadTelegramMessage(input, adminUrl);

  const payload = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "👁 Ver lead",
            url: adminUrl,
          },
        ],
      ],
    },
  };

  const telegramEndpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(telegramEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      const rawError = await response.text().catch(() => "");
      const safeError = sanitizeSecrets(rawError.slice(0, 300), botToken);
      console.error("[telegram] error de respuesta de Telegram Bot API:", {
        status: response.status,
        details: safeError,
      });
      return { ok: false, reason: `status_${response.status}` };
    }

    return { ok: true };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "unknown_error";
    const safeMsg = sanitizeSecrets(errMsg, botToken);
    console.error("[telegram] excepción al enviar notificación:", safeMsg);
    return { ok: false, reason: safeMsg };
  }
}

/**
 * Notificador de leads procedentes del funnel de captación.
 */
export async function sendTelegramLeadNotification(
  context: TelegramLeadContext,
): Promise<TelegramResult> {
  const { lead, leadId, score } = context;

  const servicio = lead.labels.tipo || lead.tipo || null;
  const presupuesto = lead.labels.presupuesto || lead.presupuesto || null;
  const plazo = lead.labels.plazo || lead.plazo || null;
  const objetivo = lead.labels.objetivo || lead.objetivo || null;
  const proyecto = lead.descripcion || lead.situacionDetalle || lead.labels.situacion || lead.situacion || null;
  const fuente = formatAttribution(lead);

  return sendTelegramNotification({
    leadId,
    nombre: lead.nombre,
    empresa: lead.empresa || null,
    email: lead.email,
    telefono: lead.telefono || null,
    servicio,
    presupuesto,
    plazo,
    objetivo,
    proyecto,
    landingPage: lead.landing_page || lead.form_page || lead.current_url || null,
    fuente,
    scoreTier: score.tier,
    scoreValue: score.value,
    isUpdate: lead.actualizacion ?? false,
  });
}
