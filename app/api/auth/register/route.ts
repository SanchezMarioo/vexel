import { ZodError } from "zod";
import { authService } from "@/lib/auth/service";
import { getClientIp, hasTrustedOrigin, isJsonContentType } from "@/lib/security/request";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { secureJson } from "@/lib/security/response";

export const runtime = "nodejs";

const TOO_MANY_REQUESTS_MESSAGE = "Demasiados intentos. Intentalo de nuevo en unos minutos.";
const REGISTER_IP_LIMIT = {
  limit: 25,
  windowMs: 15 * 60 * 1000,
};
const REGISTER_EMAIL_LIMIT = {
  limit: 5,
  windowMs: 15 * 60 * 1000,
};

function errorResponse(message: string, status: number) {
  return secureJson({ ok: false, message }, { status });
}

function mapRegisterError(error: unknown) {
  if (error instanceof ZodError) {
    return {
      status: 400,
      message: error.issues[0]?.message ?? "Datos no validos.",
    };
  }

  if (error instanceof SyntaxError) {
    return {
      status: 400,
      message: "Body JSON invalido.",
    };
  }

  if (!(error instanceof Error)) {
    return {
      status: 500,
      message: "No se pudo completar el registro.",
    };
  }

  const message = error.message;

  if (message.includes("Ya existe") || message.includes("duplicate key value")) {
    return {
      status: 409,
      message: "Ya existe una cuenta con ese email.",
    };
  }

  return {
    status: 500,
    message: "No se pudo completar el registro.",
  };
}

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) {
    return errorResponse("Origen no permitido.", 403);
  }

  if (!isJsonContentType(request.headers.get("content-type"))) {
    return errorResponse("Content-Type no soportado.", 415);
  }

  const clientIp = getClientIp(request);
  const ipRateLimit = checkRateLimit({
    bucket: "auth:register:ip",
    key: clientIp,
    ...REGISTER_IP_LIMIT,
  });

  if (!ipRateLimit.ok) {
    return errorResponse(TOO_MANY_REQUESTS_MESSAGE, 429);
  }

  try {
    const payload = await request.json();
    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "unknown";

    const emailRateLimit = checkRateLimit({
      bucket: "auth:register:email",
      key: email,
      ...REGISTER_EMAIL_LIMIT,
    });

    if (!emailRateLimit.ok) {
      return errorResponse(TOO_MANY_REQUESTS_MESSAGE, 429);
    }

    const user = await authService.registerWithPassword(payload);

    return secureJson(
      {
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const mapped = mapRegisterError(error);

    if (mapped.status >= 500) {
      console.error("[register] unexpected error", error);
    }

    return errorResponse(mapped.message, mapped.status);
  }
}