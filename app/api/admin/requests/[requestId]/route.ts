import { getServerSession } from "next-auth";
import { ZodError, z } from "zod";
import { authOptions } from "@/lib/auth/options";
import { acceptRequest, rejectRequest } from "@/lib/data/requests";
import { hasTrustedOrigin, isJsonContentType } from "@/lib/security/request";
import { secureJson } from "@/lib/security/response";

export const runtime = "nodejs";

const actionSchema = z.object({
  action: z.enum(["accept", "reject"]),
  adminNote: z.string().trim().max(500).optional(),
});

function errorResponse(message: string, status: number) {
  return secureJson({ ok: false, message }, { status });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ requestId: string }> }) {
  if (!hasTrustedOrigin(request)) {
    return errorResponse("Origen no permitido.", 403);
  }

  if (!isJsonContentType(request.headers.get("content-type"))) {
    return errorResponse("Content-Type no soportado.", 415);
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "admin") {
    return errorResponse("No autorizado.", 403);
  }

  const { requestId } = await params;

  try {
    const payload = await request.json();
    const { action, adminNote } = actionSchema.parse(payload);

    if (action === "accept") {
      const { request: req, project } = await acceptRequest(requestId, adminNote);
      return secureJson({ ok: true, request: req, project: { id: project.id } });
    }

    const req = await rejectRequest(requestId, adminNote);
    return secureJson({ ok: true, request: req });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(error.issues[0]?.message ?? "Datos no validos.", 400);
    }

    if (error instanceof SyntaxError) {
      return errorResponse("Body JSON invalido.", 400);
    }

    return errorResponse("No se pudo procesar la solicitud.", 500);
  }
}
