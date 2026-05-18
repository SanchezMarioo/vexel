import { getServerSession } from "next-auth";
import { ZodError, z } from "zod";
import { authOptions } from "@/lib/auth/options";
import { createProject } from "@/lib/data/projects";
import { findUserByEmail } from "@/lib/data/users";
import { hasTrustedOrigin, isJsonContentType } from "@/lib/security/request";
import { secureJson } from "@/lib/security/response";

export const runtime = "nodejs";

const createProjectSchema = z.object({
  userEmail: z.string().trim().email("Email de cliente no valido."),
  title: z.string().trim().min(1, "El titulo es obligatorio.").max(200),
  summary: z.string().trim().max(5000).nullable().optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
});

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

  if (!session?.user?.id || session.user.role !== "admin") {
    return errorResponse("No autorizado.", 403);
  }

  try {
    const payload = await request.json();
    const parsed = createProjectSchema.parse(payload);

    const user = await findUserByEmail(parsed.userEmail);
    if (!user) {
      return errorResponse("No existe ninguna cuenta con ese email.", 404);
    }

    const project = await createProject({
      userId: user.id,
      title: parsed.title,
      summary: parsed.summary,
      status: parsed.status,
    });

    return secureJson({ ok: true, project }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(error.issues[0]?.message ?? "Datos no validos.", 400);
    }

    if (error instanceof SyntaxError) {
      return errorResponse("Body JSON invalido.", 400);
    }

    return errorResponse("No se pudo crear el proyecto.", 500);
  }
}
