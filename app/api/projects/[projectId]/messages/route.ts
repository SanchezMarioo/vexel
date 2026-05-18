import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import { authOptions } from "@/lib/auth/options";
import { messageSchema } from "@/lib/auth/schemas";
import { listMessagesByProject, createMessage } from "@/lib/data/messages";
import { getProjectByIdForUser } from "@/lib/data/projects";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasTrustedOrigin, isJsonContentType } from "@/lib/security/request";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { secureJson } from "@/lib/security/response";
import { assertUuid } from "@/lib/security/validation";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return secureJson({ ok: false, message }, { status });
}

async function canAccessProject(userId: string, isAdmin: boolean, projectId: string): Promise<boolean> {
  if (isAdmin) return true;
  const project = await getProjectByIdForUser(userId, projectId);
  return project !== null;
}

async function adminProjectExists(projectId: string): Promise<boolean> {
  const client = getSupabaseAdminClient();
  const { data } = await client
    .from("user_projects")
    .select("id")
    .eq("id", projectId)
    .maybeSingle();
  return data !== null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return errorResponse("No autenticado.", 401);
  }

  const { projectId } = await params;

  try {
    assertUuid(projectId, "projectId");
  } catch {
    return errorResponse("ID de proyecto no valido.", 400);
  }

  const isAdmin = session.user.role === "admin";
  const hasAccess = await canAccessProject(session.user.id, isAdmin, projectId);

  if (!hasAccess) {
    return errorResponse("No autorizado.", 403);
  }

  const messages = await listMessagesByProject(projectId);
  return secureJson({ ok: true, messages });
}

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
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

  const { projectId } = await params;

  try {
    assertUuid(projectId, "projectId");
  } catch {
    return errorResponse("ID de proyecto no valido.", 400);
  }

  const isAdmin = session.user.role === "admin";

  const hasAccess = isAdmin
    ? await adminProjectExists(projectId)
    : await canAccessProject(session.user.id, false, projectId);

  if (!hasAccess) {
    return errorResponse("No autorizado.", 403);
  }

  const userRateLimit = checkRateLimit({
    bucket: "project:messages:user",
    key: session.user.id,
    limit: 30,
    windowMs: 5 * 60 * 1000,
  });

  if (!userRateLimit.ok) {
    return errorResponse("Demasiados mensajes en poco tiempo.", 429);
  }

  try {
    const payload = await request.json();
    const { content } = messageSchema.parse(payload);

    const message = await createMessage(
      projectId,
      session.user.id,
      isAdmin ? "admin" : "user",
      content,
    );

    return secureJson({ ok: true, message }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(error.issues[0]?.message ?? "Datos no validos.", 400);
    }

    if (error instanceof SyntaxError) {
      return errorResponse("Body JSON invalido.", 400);
    }

    return errorResponse("No se pudo enviar el mensaje.", 500);
  }
}
