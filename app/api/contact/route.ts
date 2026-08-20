import { ZodError } from "zod";
import { contactSchema } from "@/lib/portfolio/contact-schema";
import { checkRateLimitUpstash } from "@/lib/security/rate-limit";
import { getClientIp, hasTrustedOrigin, isJsonContentType } from "@/lib/security/request";
import { secureJson } from "@/lib/security/response";
import { sanitizeTextForStorage } from "@/lib/security/sanitize";
import { insertLeadInSupabase } from "@/lib/supabase/server";
import { sendTelegramNotification } from "@/lib/notifications/telegram";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 32_000;

function errorResponse(message: string, status: number) {
  return secureJson({ ok: false, message }, { status });
}

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

  const clientIp = getClientIp(request);

  const rateLimit = await checkRateLimitUpstash(`contact:ip:${clientIp}`);

  if (!rateLimit.ok) {
    return errorResponse("Demasiados mensajes en poco tiempo. Inténtalo más tarde.", 429);
  }

  try {
    const payload = JSON.parse(rawBody);
    const data = contactSchema.parse(payload);

    // Honeypot: un visitante real nunca lo rellena. Fingir éxito y descartar.
    if (data.company && data.company.trim().length > 0) {
      return secureJson({ ok: true }, { status: 200 });
    }

    const safeName = sanitizeTextForStorage(data.name);
    const safeEmail = data.email.trim().toLowerCase();
    const safeMessage = sanitizeTextForStorage(data.message);

    // Persistir el mensaje de contacto en Supabase como lead
    const result = await insertLeadInSupabase({
      status: "nuevo",
      nombre: safeName,
      email: safeEmail,
      descripcion: safeMessage,
      situacion: "Contacto directo",
      tipo: "contacto-directo",
      presupuesto: "no-claro",
      plazo: "cuanto-antes",
      form_page: "/",
      score_value: 50,
      score_tier: "media",
      score_reasons: ["Formulario de contacto directo"],
      is_update: false,
      notes: "Mensaje recibido desde el formulario de contacto directo de la home.",
      empresa: null,
      telefono: null,
      situacion_detalle: null,
      objetivo: null,
      catalogo: null,
      web_actual: null,
      landing_page: "/",
      current_url: "/",
      referrer: null,
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
      raw_answers: data as unknown as Record<string, unknown>,
    });

    if (!result.ok) {
      console.warn("[contact] aviso guardando en Supabase:", result.error);
    } else if (result.id) {
      try {
        await sendTelegramNotification({
          leadId: result.id,
          nombre: safeName,
          email: safeEmail,
          proyecto: safeMessage,
          servicio: "Contacto directo",
          landingPage: "/",
          fuente: "Formulario web directo",
          scoreTier: "media",
        });
      } catch (err) {
        console.error("[contact] error inesperado enviando notificación Telegram:", err);
      }
    }

    return secureJson({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(error.issues[0]?.message ?? "Datos no válidos.", 400);
    }

    if (error instanceof SyntaxError) {
      return errorResponse("Body JSON inválido.", 400);
    }

    return errorResponse("No se pudo enviar el mensaje.", 500);
  }
}
