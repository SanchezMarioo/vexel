import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getProjectByIdForUser } from "@/lib/data/projects";
import { hasTrustedOrigin } from "@/lib/security/request";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { secureJson } from "@/lib/security/response";
import { assertUuid } from "@/lib/security/validation";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 3;
const BUCKET = "message-images";

function errorResponse(message: string, status: number) {
  return secureJson({ ok: false, message }, { status });
}

async function projectExists(projectId: string): Promise<boolean> {
  const client = getSupabaseAdminClient();
  const { data } = await client.from("user_projects").select("id").eq("id", projectId).maybeSingle();
  return data !== null;
}

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  if (!hasTrustedOrigin(request)) {
    return errorResponse("Origen no permitido.", 403);
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
    ? await projectExists(projectId)
    : (await getProjectByIdForUser(session.user.id, projectId)) !== null;

  if (!hasAccess) {
    return errorResponse("No autorizado.", 403);
  }

  const rateLimit = checkRateLimit({
    bucket: "project:upload:user",
    key: session.user.id,
    limit: 30,
    windowMs: 5 * 60 * 1000,
  });

  if (!rateLimit.ok) {
    return errorResponse("Demasiadas subidas en poco tiempo.", 429);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("No se pudo leer el formulario.", 400);
  }

  const files = formData.getAll("images") as File[];

  if (files.length === 0) {
    return errorResponse("No se han enviado imagenes.", 400);
  }

  if (files.length > MAX_FILES) {
    return errorResponse(`Maximo ${MAX_FILES} imagenes por mensaje.`, 400);
  }

  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return errorResponse("Formato no permitido. Solo jpeg, png, gif y webp.", 415);
    }
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse("Cada imagen debe pesar menos de 5 MB.", 413);
    }
    if (file.size === 0) {
      return errorResponse("Archivo vacio no permitido.", 400);
    }
  }

  const client = getSupabaseAdminClient();
  const uploadedPaths: string[] = [];
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1]!;
    const path = `projects/${projectId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await client.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (error) {
      if (uploadedPaths.length > 0) {
        await client.storage.from(BUCKET).remove(uploadedPaths);
      }
      return errorResponse("No se pudo subir la imagen.", 500);
    }

    uploadedPaths.push(path);
    const { data: publicData } = client.storage.from(BUCKET).getPublicUrl(path);
    uploadedUrls.push(publicData.publicUrl);
  }

  return secureJson({ ok: true, imageUrls: uploadedUrls }, { status: 201 });
}
