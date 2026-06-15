import { ZodError } from "zod";
import { contactSchema } from "@/lib/portfolio/contact-schema";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIp, hasTrustedOrigin, isJsonContentType } from "@/lib/security/request";
import { secureJson } from "@/lib/security/response";

export const runtime = "nodejs";

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

  const clientIp = getClientIp(request);

  const rateLimit = checkRateLimit({
    bucket: "contact:ip",
    key: clientIp,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });

  if (!rateLimit.ok) {
    return errorResponse("Demasiados mensajes en poco tiempo. Inténtalo más tarde.", 429);
  }

  try {
    const payload = await request.json();
    const data = contactSchema.parse(payload);

    // Honeypot: a real visitor never fills this. Pretend success and drop it.
    if (data.company && data.company.trim().length > 0) {
      return secureJson({ ok: true }, { status: 200 });
    }

    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

    // Sin webhook configurado (otro entorno): registrar para no perder el mensaje.
    if (!webhookUrl) {
      console.info("[contact] mensaje recibido (sin webhook configurado)", {
        name: data.name,
        email: data.email,
        length: data.message.length,
      });
      return secureJson({ ok: true }, { status: 201 });
    }

    // Entrega en Google Sheets vía Apps Script (server→server, sin CORS). El
    // Apps Script espera las claves nombre / email / descripcion.
    try {
      const sheetRes = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: data.name,
          email: data.email,
          descripcion: data.message,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!sheetRes.ok) {
        console.error("[contact] Apps Script respondió con", sheetRes.status);
        return errorResponse(
          "No se pudo enviar el mensaje. Inténtalo de nuevo o escríbeme por email.",
          502,
        );
      }
    } catch (deliveryError) {
      console.error("[contact] fallo al entregar en Sheets", deliveryError);
      return errorResponse(
        "No se pudo enviar el mensaje. Inténtalo de nuevo o escríbeme por email.",
        502,
      );
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
