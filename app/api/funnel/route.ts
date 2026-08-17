import { ZodError } from "zod";
import { deliverFunnelLead } from "@/lib/funnel/deliver";
import { sendClientLeadEmail, sendInternalLeadEmail } from "@/lib/funnel/email";
import { buildLead } from "@/lib/funnel/lead";
import { funnelSchema } from "@/lib/funnel/schema";
import { scoreLead } from "@/lib/funnel/score";
import { checkRateLimitUpstash } from "@/lib/security/rate-limit";
import { getClientIp, hasTrustedOrigin, isJsonContentType } from "@/lib/security/request";
import { secureJson } from "@/lib/security/response";

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

  const clientIp = getClientIp(request);

  // Rate limiting distribuido con Upstash (fallback a in-memory en desarrollo)
  const rateLimit = await checkRateLimitUpstash(`funnel:ip:${clientIp}`);

  if (!rateLimit.ok) {
    return errorResponse("Demasiados envíos en poco tiempo. Inténtalo más tarde.", 429);
  }

  try {
    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_BYTES) {
      return errorResponse("La solicitud es demasiado grande.", 413);
    }

    const payload = JSON.parse(rawBody);
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

    const emailTasks: Array<{ type: "client" | "internal"; promise: Promise<{ ok: boolean; reason?: string }> }> = [];

    // Solo se envía email de confirmación al cliente en la primera entrega.
    // Si edita sus respuestas en el resumen (actualización), no lo molestamos de nuevo.
    if (!lead.actualizacion) {
      emailTasks.push({
        type: "client",
        promise: sendClientLeadEmail({ lead, leadId, createdAt, score }),
      });
    }

    // El email interno siempre se envía para que el equipo reciba la última versión.
    emailTasks.push({
      type: "internal",
      promise: sendInternalLeadEmail({ lead, leadId, createdAt, score }),
    });

    const emailResults = await Promise.allSettled(emailTasks.map((task) => task.promise));
    emailResults.forEach((result, index) => {
      if (result.status === "rejected" || !result.value.ok) {
        console.error("[funnel] email not sent", {
          type: emailTasks[index].type,
          reason: result.status === "rejected" ? "unexpected failure" : result.value.reason,
          leadId,
        });
      }
    });

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
