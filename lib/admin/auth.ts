import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export interface AdminUser {
  userId: string;
  email: string;
  name: string;
}

/**
 * Devuelve la lista blanca de emails de administradores autorizados.
 */
export function getAdminEmails(): string[] {
  const envEmails = process.env.ADMIN_EMAILS;
  if (!envEmails) return [];
  return envEmails
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Comprueba si un correo está autorizado como administrador contra la lista blanca.
 * Si no hay ADMIN_EMAILS definidos o la lista está vacía, DENEGAMOS el acceso por defecto (fail-closed).
 */
export function checkIsAdmin(email: string): boolean {
  if (!email || !email.trim()) return false;
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) {
    console.error("[admin/auth] Acceso denegado: ADMIN_EMAILS no está configurado en las variables de entorno.");
    return false;
  }
  return adminEmails.includes(email.trim().toLowerCase());
}

/**
 * Valida que la petición provenga de una sesión activa de Clerk y pertenezca a la lista blanca de administradores.
 * Si no está autenticado o no está autorizado, lanza notFound() para devolver un 404 real a nivel de servidor,
 * haciendo que las rutas de administración sean indistinguibles de rutas inexistentes.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  const user = await currentUser();
  if (!user) {
    notFound();
  }

  // Validar que el usuario tenga al menos un correo verificado en Clerk que pertenezca a ADMIN_EMAILS.
  // Esto previene que un atacante añada un email no verificado (verification.status !== "verified")
  // o que un orden arbitrario en user.emailAddresses otorgue acceso indebido o bloquee al admin legítimo.
  const verifiedAdminEmail = user.emailAddresses?.find(
    (e) => e.verification?.status === "verified" && checkIsAdmin(e.emailAddress),
  );

  if (!verifiedAdminEmail) {
    const attemptedEmails =
      user.emailAddresses
        ?.map((e) => `${e.emailAddress} (${e.verification?.status ?? "no-status"})`)
        .join(", ") ?? "ninguno";
    console.warn(
      `[admin/auth] Acceso denegado: ningún email verificado del usuario coincide con ADMIN_EMAILS. Correos asociados: [${attemptedEmails}].`,
    );
    notFound();
  }

  const userEmail = verifiedAdminEmail.emailAddress.trim().toLowerCase();

  return {
    userId: user.id,
    email: userEmail,
    name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || userEmail,
  };
}
