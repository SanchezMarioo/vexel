import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import { authOptions } from "@/lib/auth/options";
import { profileSchema } from "@/lib/auth/schemas";
import { updateUserName } from "@/lib/data/users";
import { getClientIp, hasTrustedOrigin, isJsonContentType } from "@/lib/security/request";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { secureJson } from "@/lib/security/response";

export const runtime = "nodejs";

const TOO_MANY_REQUESTS_MESSAGE = "Demasiadas actualizaciones en poco tiempo. Intentalo de nuevo en unos minutos.";
const PROFILE_USER_LIMIT = {
  limit: 12,
  windowMs: 5 * 60 * 1000,
};
const PROFILE_IP_LIMIT = {
  limit: 40,
  windowMs: 5 * 60 * 1000,
};

function errorResponse(message: string, status: number) {
  return secureJson({ ok: false, message }, { status });
}

export async function PATCH(request: Request) {
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
    bucket: "account:profile:user",
    key: session.user.id,
    ...PROFILE_USER_LIMIT,
  });

  const ipRateLimit = checkRateLimit({
    bucket: "account:profile:ip",
    key: clientIp,
    ...PROFILE_IP_LIMIT,
  });

  if (!userRateLimit.ok || !ipRateLimit.ok) {
    return errorResponse(TOO_MANY_REQUESTS_MESSAGE, 429);
  }

  try {
    const payload = await request.json();
    const parsed = profileSchema.parse(payload);

    const updatedUser = await updateUserName(session.user.id, parsed.name);

    return Response.json({
      ok: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(error.issues[0]?.message ?? "Datos no validos.", 400);
    }

    if (error instanceof SyntaxError) {
      return errorResponse("Body JSON invalido.", 400);
    }

    return errorResponse("No se pudo actualizar el perfil.", 500);
  }
}