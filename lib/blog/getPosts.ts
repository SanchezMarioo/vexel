import "server-only";
import { cache } from "react";
import type { BlogPost } from "@/lib/content/blog";
import { getPostsByDate as getLocalPosts } from "@/lib/content/blog";
import { sanityFetch } from "@/sanity/client";
import { isSanityConfigured } from "@/sanity/env";
import { POSTS_QUERY } from "@/sanity/queries";
import type { SanityPostCard } from "@/sanity/types";
import { mapSanityCard } from "./mappers";

/**
 * Todos los artículos (tarjeta, de más reciente a más antiguo).
 *
 * Fuente: Sanity si está configurado; si falta configuración o la petición
 * falla (red, token, dataset inexistente), cae al contenido local de
 * lib/content/blog.ts para que el sitio nunca se rompa.
 */
export const getPosts = cache(async function getPosts(preview = false): Promise<BlogPost[]> {
  const local = getLocalPosts();
  if (!isSanityConfigured) {
    return local;
  }

  try {
    const sanityPosts = await sanityFetch<SanityPostCard[]>({ query: POSTS_QUERY, preview });
    const mappedSanity = sanityPosts.map(mapSanityCard);

    // Mantiene los de Sanity y añade los artículos locales que no existan en Sanity
    const sanitySlugs = new Set(mappedSanity.map((p) => p.slug));
    const remainingLocal = local.filter((p) => !sanitySlugs.has(p.slug));

    return [...mappedSanity, ...remainingLocal].sort((a, b) =>
      b.publishedAt.localeCompare(a.publishedAt),
    );
  } catch (error) {
    console.error("[blog] Error leyendo artículos de Sanity; usando contenido local.", error);
    return local;
  }
});
