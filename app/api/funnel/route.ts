import { ZodError } from "zod";
import { deliverFunnelLead } from "@/lib/funnel/deliver";
import { sendClientLeadEmail, sendInternalLeadEmail } from "@/lib/funnel/email";
import { buildLead } from "@/lib/funnel/lead";
import { funnelSchema } from "@/lib/funnel/schema";
import { scoreLead } from "@/lib/funnel/score";
import { checkRateLimit } from "@/lib/security/rate-limit";
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

  const rateLimit = checkRateLimit({
    bucket: "funnel:ip",
    key: clientIp,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });

  if (!rateLimit.ok) {
    return errorResponse("Demasiados envíos en poco tiempo. Inténtalo más tarde.", 429);
  }

  try {
    const payload = await request.json();
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

    const emailResults = await Promise.allSettled([
      sendClientLeadEmail({ lead, leadId, createdAt, score }),
      sendInternalLeadEmail({ lead, leadId, createdAt, score }),
    ]);
    emailResults.forEach((result, index) => {
      if (result.status === "rejected" || !result.value.ok) {
        console.error("[funnel] email not sent", {
          type: index === 0 ? "client" : "internal",
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
