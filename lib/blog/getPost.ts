import "server-only";
import { cache } from "react";
import type { BlogPost } from "@/lib/content/blog";
import { getPostBySlug as getLocalPost } from "@/lib/content/blog";
import { sanityFetch } from "@/sanity/client";
import { isSanityConfigured } from "@/sanity/env";
import { POST_BY_SLUG_QUERY } from "@/sanity/queries";
import type { SanityPostFull } from "@/sanity/types";
import { mapSanityPost } from "./mappers";

/**
 * Artículo completo por slug. Devuelve null si no existe (la página hace
 * notFound). En preview (Draft Mode) también encuentra borradores.
 */
export const getPost = cache(async function getPost(slug: string, preview = false): Promise<BlogPost | null> {
  if (!isSanityConfigured) {
    return getLocalPost(slug) ?? null;
  }

  try {
    const post = await sanityFetch<SanityPostFull | null>({
      query: POST_BY_SLUG_QUERY,
      params: { slug },
      preview,
    });
    return post ? mapSanityPost(post) : null;
  } catch (error) {
    console.error(`[blog] Error leyendo "${slug}" de Sanity; usando contenido local.`, error);
    return getLocalPost(slug) ?? null;
  }
});
