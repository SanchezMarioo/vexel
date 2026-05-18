import { getServerSession } from "next-auth";
import { ZodError, z } from "zod";
import { authOptions } from "@/lib/auth/options";
import { updateProject, deleteProject } from "@/lib/data/projects";
import { hasTrustedOrigin, isJsonContentType } from "@/lib/security/request";
import { secureJson } from "@/lib/security/response";

export const runtime = "nodejs";

const updateProjectSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  summary: z.string().trim().max(5000).nullable().optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
  budgetFinal: z.number().min(0).max(9999999).nullable().optional(),
  estimatedDays: z.number().int().min(1).max(3650).nullable().optional(),
  adminNotes: z.string().trim().max(5000).nullable().optional(),
});

function errorResponse(message: string, status: number) {
  return secureJson({ ok: false, message }, { status });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  if (!hasTrustedOrigin(request)) {
    return errorResponse("Origen no permitido.", 403);
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "admin") {
    return errorResponse("No autorizado.", 403);
  }

  const { projectId } = await params;

  try {
    await deleteProject(projectId);
    return secureJson({ ok: true });
  } catch {
    return errorResponse("No se pudo eliminar el proyecto.", 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
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

  const { projectId } = await params;

  try {
    const payload = await request.json();
    const parsed = updateProjectSchema.parse(payload);

    const project = await updateProject(projectId, parsed);

    return secureJson({ ok: true, project });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(error.issues[0]?.message ?? "Datos no validos.", 400);
    }

    if (error instanceof SyntaxError) {
      return errorResponse("Body JSON invalido.", 400);
    }

    return errorResponse("No se pudo actualizar el proyecto.", 500);
  }
}
