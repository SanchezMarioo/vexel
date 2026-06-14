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

    // TODO (ver PORTFOLIO.md): conectar la entrega real del mensaje, p.ej.
    //   - Email transaccional con Resend (https://resend.com), o
    //   - Insertar en una tabla `contact_messages` de Supabase.
    // Hasta entonces se registra en el servidor para no perder ningún mensaje.
    console.info("[contact] nuevo mensaje", {
      name: data.name,
      email: data.email,
      length: data.message.length,
    });

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
