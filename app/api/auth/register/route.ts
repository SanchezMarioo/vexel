import { ZodError } from "zod";
import { authService } from "@/lib/auth/service";

function errorResponse(message: string, status: number) {
  return Response.json({ ok: false, message }, { status });
}

function mapRegisterError(error: unknown) {
  if (error instanceof ZodError) {
    return {
      status: 400,
      message: error.issues[0]?.message ?? "Datos no validos.",
    };
  }

  if (error instanceof SyntaxError) {
    return {
      status: 400,
      message: "Body JSON invalido.",
    };
  }

  if (!(error instanceof Error)) {
    return {
      status: 500,
      message: "No se pudo completar el registro.",
    };
  }

  const message = error.message;

  if (message.includes("Ya existe") || message.includes("duplicate key value")) {
    return {
      status: 409,
      message: "Ya existe una cuenta con ese email.",
    };
  }

  if (message.includes("Missing SUPABASE_URL") || message.includes("Missing NEXT_PUBLIC_SUPABASE_URL")) {
    return {
      status: 500,
      message: "Falta configurar SUPABASE_URL en el entorno del servidor.",
    };
  }

  if (message.includes("Missing SUPABASE_SERVICE_ROLE_KEY")) {
    return {
      status: 500,
      message: "Falta SUPABASE_SERVICE_ROLE_KEY en el entorno del servidor.",
    };
  }

  if (
    message.includes('relation "user_accounts" does not exist') ||
    message.includes('relation "user_projects" does not exist')
  ) {
    return {
      status: 500,
      message: "Faltan tablas en Supabase. Ejecuta supabase/schema.sql en SQL Editor.",
    };
  }

  if (message.includes("row-level security") || message.includes("permission denied")) {
    return {
      status: 500,
      message: "Permisos insuficientes en Supabase. Revisa RLS y policies de schema.sql.",
    };
  }

  return {
    status: 500,
    message: "No se pudo completar el registro.",
  };
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const user = await authService.registerWithPassword(payload);

    return Response.json(
      {
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const mapped = mapRegisterError(error);

    if (mapped.status >= 500) {
      console.error("[register] unexpected error", error);
    }

    return errorResponse(mapped.message, mapped.status);
  }
}