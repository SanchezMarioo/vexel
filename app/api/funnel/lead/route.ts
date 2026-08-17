import { ZodError } from "zod";
import { secureJson } from "@/lib/security/response";
import { hasTrustedOrigin, isJsonContentType, getClientIp } from "@/lib/security/request";
import { checkRateLimitUpstash } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 32_000;

interface StoredLead {
  leadId: string;
  email: string;
  nombre: string;
  createdAt: string;
}

// Store temporal en memoria (solo para desarrollo/local)
// En producción debería usarse una base de datos real
const leadStore = new Map<string, StoredLead>();

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

  try {
    const payload = await request.json();
    const { email, nombre } = payload;

    if (!email || typeof email !== "string") {
      return errorResponse("Email inválido.", 400);
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse("Email inválido.", 400);
    }

    const leadId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    // Guardar lead minimalista
    leadStore.set(leadId, {
      leadId,
      email,
      nombre: nombre || "",
      createdAt,
    });

    return secureJson({ 
      ok: true, 
      message: "Solicitud de borrado registrada. Contacta con soporte si necesitas eliminar tus datos." 
    }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(error.issues[0]?.message ?? "Revisa los datos enviados.", 400);
    }

    if (error instanceof SyntaxError) {
      return errorResponse("Body JSON inválido.", 400);
    }

    return errorResponse("Error procesando tu solicitud.", 500);
  }
}

export async function DELETE(request: Request) {
  if (!hasTrustedOrigin(request)) {
    return errorResponse("Origen no permitido.", 403);
  }

  const clientIp = getClientIp(request);
  
  // Rate limiting específico para operaciones GDPR
  const rateLimit = await checkRateLimitUpstash(`gdpr:ip:${clientIp}`);
  
  if (!rateLimit.ok) {
    return errorResponse("Demasiadas solicitudes. Inténtalo más tarde.", 429);
  }

  try {
    const payload = await request.json();
    const { email, leadId } = payload;

    if (!email && !leadId) {
      return errorResponse("Proporciona email o leadId.", 400);
    }

    // Buscar y eliminar lead
    let deleted = false;
    for (const [key, value] of leadStore.entries()) {
      if ((email && value.email === email) || (leadId && value.leadId === leadId)) {
        leadStore.delete(key);
        deleted = true;
        break;
      }
    }

    if (!deleted) {
      // No revelar si existe o no el lead (previene enumeración)
      return secureJson({ 
        ok: true, 
        message: "Si existía, tus datos han sido eliminados." 
      }, { status: 200 });
    }

    return secureJson({ 
      ok: true, 
      message: "Tus datos han sido eliminados." 
    }, { status: 200 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse("Body JSON inválido.", 400);
    }

    return errorResponse("Error procesando tu solicitud.", 500);
  }
}

export async function GET(request: Request) {
  if (!hasTrustedOrigin(request)) {
    return errorResponse("Origen no permitido.", 403);
  }

  const clientIp = getClientIp(request);
  
  // Rate limiting específico para operaciones GDPR
  const rateLimit = await checkRateLimitUpstash(`gdpr:ip:${clientIp}`);
  
  if (!rateLimit.ok) {
    return errorResponse("Demasiadas solicitudes. Inténtalo más tarde.", 429);
  }

  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    const leadId = url.searchParams.get("leadId");

    if (!email && !leadId) {
      return errorResponse("Proporciona email o leadId como parámetro.", 400);
    }

    // Buscar lead (sin exponer datos sensibles)
    for (const [, value] of leadStore.entries()) {
      if ((email && value.email === email) || (leadId && value.leadId === leadId)) {
        return secureJson({ 
          ok: true, 
          data: {
            leadId: value.leadId,
            createdAt: value.createdAt,
            // No exponer email completo ni nombre
            email: `${value.email.split("@")[0]}***`,
          } 
        }, { status: 200 });
      }
    }

    return secureJson({ 
      ok: true, 
      message: "No se encontraron datos asociados.",
      data: null 
    }, { status: 200 });
  } catch (error) {
    return errorResponse("Error procesando tu solicitud.", 500);
  }
}
