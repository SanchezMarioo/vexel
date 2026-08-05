import { revalidatePath, revalidateTag } from "next/cache";
import { parseBody } from "next-sanity/webhook";
import type { NextRequest } from "next/server";
import { BLOG_CACHE_TAG, SERVICES_CACHE_TAG } from "@/sanity/client";

/**
 * Webhook de Sanity (Settings → Webhooks del proyecto): al publicar,
 * actualizar o borrar un `post`/`category`/`author`, Sanity hace POST con
 * firma HMAC (SANITY_REVALIDATE_SECRET). Invalidamos el tag "blog" — todas
 * las páginas y feeds que leen del CMS (ISR) — sin redeployar.
 *
 * Configurar en Sanity con: URL https://www.xync.es/api/revalidate/sanity,
 * secret = SANITY_REVALIDATE_SECRET, trigger on create/update/delete.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return Response.json({ message: "Webhook no configurado" }, { status: 503 });
  }

  const { isValidSignature, body } = await parseBody<{ _type?: string; slug?: { current?: string } }>(
    request,
    secret,
  );

  if (!isValidSignature) {
    return Response.json({ message: "Firma inválida" }, { status: 401 });
  }

  // Invalida todas las lecturas del blog (páginas ISR, sitemap y RSS).
  // { expire: 0 }: expiración inmediata para llamadas externas (webhook de Sanity).
  const isService = body?._type === "service";
  revalidateTag(isService ? SERVICES_CACHE_TAG : BLOG_CACHE_TAG, { expire: 0 });
  revalidatePath(isService ? "/sitemap.xml" : "/blog");

  if (body?.slug?.current) {
    revalidatePath(isService ? `/${body.slug.current}` : `/blog/${body.slug.current}`);
  }

  return Response.json({ revalidated: true, type: body?._type ?? null, now: Date.now() });
}
