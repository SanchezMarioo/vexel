import { getServerSession } from "next-auth";
import { ZodError, z } from "zod";
import { authOptions } from "@/lib/auth/options";
import { listPaymentsByProject, createPayment } from "@/lib/data/payments";
import { hasTrustedOrigin, isJsonContentType } from "@/lib/security/request";
import { secureJson } from "@/lib/security/response";

export const runtime = "nodejs";

const createPaymentSchema = z.object({
  description: z.string().trim().min(1, "La descripcion es obligatoria.").max(200),
  amount: z.number().positive("El importe debe ser mayor que 0.").max(9999999),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha invalida.").nullable().optional(),
});

function errorResponse(message: string, status: number) {
  return secureJson({ ok: false, message }, { status });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "admin") {
    return errorResponse("No autorizado.", 403);
  }

  const { projectId } = await params;
  const payments = await listPaymentsByProject(projectId);

  return secureJson({ ok: true, payments });
}

export async function POST(
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
    const parsed = createPaymentSchema.parse(payload);

    const payment = await createPayment(projectId, {
      description: parsed.description,
      amount: parsed.amount,
      dueDate: parsed.dueDate,
    });

    return secureJson({ ok: true, payment }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(error.issues[0]?.message ?? "Datos no validos.", 400);
    }

    if (error instanceof SyntaxError) {
      return errorResponse("Body JSON invalido.", 400);
    }

    return errorResponse("No se pudo crear el pago.", 500);
  }
}
