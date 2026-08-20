import { ZodError } from "zod";
import { deliverFunnelLead } from "@/lib/funnel/deliver";
import { sendClientLeadEmail } from "@/lib/funnel/email";
import { buildLead } from "@/lib/funnel/lead";
import { funnelSchema } from "@/lib/funnel/schema";
import { scoreLead } from "@/lib/funnel/score";
import { sendTelegramLeadNotification } from "@/lib/notifications/telegram";
import { checkRateLimitUpstash } from "@/lib/security/rate-limit";
import { getClientIp, hasTrustedOrigin, isJsonContentType } from "@/lib/security/request";
import { secureJson } from "@/lib/security/response";
import { verifyTurnstileToken } from "@/lib/security/turnstile";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return secureJson({ ok: false, message }, { status });
}

const MAX_BODY_BYTES = 32_000;

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) {
    return errorResponse("Origen no permitido.", 403);
  }

  if (!isJsonContentType(request.headers.get("content-type"))) {
    return errorResponse("Content-Type no soportado.", 415);
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return errorResponse("La solicitud es demasiado grande.", 413);
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return errorResponse("No pudimos leer la solicitud.", 400);
  }

  if (rawBody.length > MAX_BODY_BYTES) {
    return errorResponse("La solicitud es demasiado grande.", 413);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return errorResponse("Body JSON inválido.", 400);
  }

  const clientIp = getClientIp(request);

  // 1. Verificación en servidor de Cloudflare Turnstile (Anti-bot)
  const tokenCandidate =
    payload && typeof payload === "object" && "turnstileToken" in payload
      ? (payload as { turnstileToken?: unknown }).turnstileToken
      : undefined;

  const turnstileToken = typeof tokenCandidate === "string" ? tokenCandidate : undefined;
  const turnstileResult = await verifyTurnstileToken(turnstileToken, clientIp);

  if (!turnstileResult.ok) {
    return errorResponse("No hemos podido verificar el envío. Inténtalo de nuevo.", 403);
  }

  // 2. Rate limiting distribuido con Upstash (fallback a in-memory en desarrollo)
  const rateLimit = await checkRateLimitUpstash(`funnel:ip:${clientIp}`);

  if (!rateLimit.ok) {
    return errorResponse("Demasiados envíos en poco tiempo. Inténtalo más tarde.", 429);
  }

  try {
    const data = funnelSchema.parse(payload);

    // Honeypot: un visitante real nunca lo rellena. Fingir éxito y descartar.
    if (data.company && data.company.trim().length > 0) {
      return secureJson({ ok: true }, { status: 200 });
    }

    const leadId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const lead = buildLead(data);
    const score = scoreLead(lead);

    // PRIORIDAD: primero guardar el lead; los emails son posteriores y nunca
    // pueden tumbar una entrega que ya ha entrado en el sheet.
    const delivery = await deliverFunnelLead({
      lead,
      leadId,
      createdAt,
      score,
    });

    if (!delivery.ok) {
      return errorResponse(
        delivery.message ?? "No pudimos enviar tus respuestas. Inténtalo de nuevo.",
        502,
      );
    }

    // Notificación Telegram (secundaria, no bloqueante del lead persistido)
    try {
      await sendTelegramLeadNotification({ lead, leadId, createdAt, score });
    } catch (err) {
      console.error("[funnel] error inesperado enviando notificación Telegram:", err);
    }

    // Email transaccional al cliente (solo en la primera entrega, no en actualizaciones)
    if (!lead.actualizacion) {
      sendClientLeadEmail({ lead, leadId, createdAt, score })
        .then((result) => {
          if (!result.ok) {
            console.error("[funnel] client email delivery failed", {
              reason: result.reason,
              leadId,
            });
          }
        })
        .catch((err) => {
          console.error("[funnel] unexpected error sending client email", err);
        });
    }

    return secureJson({ ok: true, leadId }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(error.issues[0]?.message ?? "Revisa los datos enviados.", 400);
    }

    if (error instanceof SyntaxError) {
      return errorResponse("Body JSON inválido.", 400);
    }

    return errorResponse("No pudimos enviar tus respuestas.", 500);
  }
}
