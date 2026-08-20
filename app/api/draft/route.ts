import crypto from "crypto";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Activa Draft Mode para previsualizar borradores de Sanity.
 *
 *   /api/draft?secret=…&slug=/blog/mi-borrador
 *
 * El secreto es SANITY_REVALIDATE_SECRET (mismo que el webhook): una sola
 * credencial compartida Sanity ↔ sitio. Sin secreto válido, 401.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug") ?? "/blog";

  const envSecret = process.env.SANITY_REVALIDATE_SECRET;
  if (!envSecret || !secret || !safeCompare(secret, envSecret)) {
    return new Response("Secreto inválido", { status: 401 });
  }

  // Solo rutas internas del blog: nada de open redirects.
  const target = slug.startsWith("/blog") ? slug : "/blog";

  const draft = await draftMode();
  draft.enable();

  redirect(target);
}
