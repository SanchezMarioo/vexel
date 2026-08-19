import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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
 * Comprueba si un correo está autorizado como administrador.
 * Si no hay ADMIN_EMAILS definidos, permite el acceso a cualquier usuario autenticado.
 */
export function checkIsAdmin(email: string): boolean {
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) return true;
  return adminEmails.includes(email.trim().toLowerCase());
}

/**
 * Valida que la petición provenga de una sesión activa de Clerk y pertenezca a la lista blanca de administradores.
 * Si no está autenticado o no está autorizado, redirige de forma segura sin provocar bucles.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const { userId } = await auth();

  if (!userId) {
    redirect("/admin/login");
  }

  const user = await currentUser();
  if (!user) {
    redirect("/admin/login");
  }

  const userEmail = user.emailAddresses?.[0]?.emailAddress?.toLowerCase() ?? "";

  if (!checkIsAdmin(userEmail)) {
    console.warn(`[admin/auth] Acceso denegado: el correo '${userEmail}' no está en ADMIN_EMAILS.`);
    redirect("/admin/login?error=unauthorized");
  }

  return {
    userId: user.id,
    email: userEmail,
    name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || userEmail,
  };
}
