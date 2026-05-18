import { getServerSession } from "next-auth";
import { ZodError, z } from "zod";
import { authOptions } from "@/lib/auth/options";
import { updatePayment, deletePayment } from "@/lib/data/payments";
import { hasTrustedOrigin, isJsonContentType } from "@/lib/security/request";
import { secureJson } from "@/lib/security/response";

export const runtime = "nodejs";

const updatePaymentSchema = z.object({
  description: z.string().trim().min(1).max(200).optional(),
  amount: z.number().positive().max(9999999).optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  status: z.enum(["pending", "paid"]).optional(),
});

function errorResponse(message: string, status: number) {
  return secureJson({ ok: false, message }, { status });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string; paymentId: string }> },
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

  const { paymentId } = await params;

  try {
    const payload = await request.json();
    const parsed = updatePaymentSchema.parse(payload);

    const payment = await updatePayment(paymentId, parsed);

    return secureJson({ ok: true, payment });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(error.issues[0]?.message ?? "Datos no validos.", 400);
    }

    if (error instanceof SyntaxError) {
      return errorResponse("Body JSON invalido.", 400);
    }

    return errorResponse("No se pudo actualizar el pago.", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string; paymentId: string }> },
) {
  if (!hasTrustedOrigin(request)) {
    return errorResponse("Origen no permitido.", 403);
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "admin") {
    return errorResponse("No autorizado.", 403);
  }

  const { paymentId } = await params;

  try {
    await deletePayment(paymentId);
    return secureJson({ ok: true });
  } catch {
    return errorResponse("No se pudo eliminar el pago.", 500);
  }
}
