import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import { authOptions } from "@/lib/auth/options";
import { requestSchema } from "@/lib/auth/schemas";
import { createProjectRequest } from "@/lib/data/requests";
import { getClientIp, hasTrustedOrigin, isJsonContentType } from "@/lib/security/request";
import { checkRateLimit } from "@/lib/security/rate-limit";
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

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return errorResponse("No autenticado.", 401);
  }

  const clientIp = getClientIp(request);

  const userRateLimit = checkRateLimit({
    bucket: "account:requests:user",
    key: session.user.id,
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });

  const ipRateLimit = checkRateLimit({
    bucket: "account:requests:ip",
    key: clientIp,
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });

  if (!userRateLimit.ok || !ipRateLimit.ok) {
    return errorResponse("Demasiadas solicitudes en poco tiempo. Intentalo mas tarde.", 429);
  }

  try {
    const payload = await request.json();
    const parsed = requestSchema.parse(payload);

    const req = await createProjectRequest(session.user.id, {
      title: parsed.title,
      description: parsed.description,
      projectType: parsed.projectType,
      budget: parsed.budget,
      referenceUrl: parsed.referenceUrl,
    });

    return secureJson({ ok: true, request: { id: req.id, status: req.status } }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(error.issues[0]?.message ?? "Datos no validos.", 400);
    }

    if (error instanceof SyntaxError) {
      return errorResponse("Body JSON invalido.", 400);
    }

    return errorResponse("No se pudo crear la solicitud.", 500);
  }
}
