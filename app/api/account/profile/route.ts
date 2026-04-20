import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import { authOptions } from "@/lib/auth/options";
import { profileSchema } from "@/lib/auth/schemas";
import { updateUserName } from "@/lib/data/users";

function errorResponse(message: string, status: number) {
  return Response.json({ ok: false, message }, { status });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return errorResponse("No autenticado.", 401);
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

    return errorResponse("No se pudo actualizar el perfil.", 500);
  }
}