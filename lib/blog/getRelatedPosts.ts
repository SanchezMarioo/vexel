import "server-only";
import type { BlogPost } from "@/lib/content/blog";
import { getPostBySlug as getLocalPost, getPostsByDate as getLocalPosts, pickRelatedPosts } from "@/lib/content/blog";
import { isSanityConfigured } from "@/sanity/env";
import { getPosts } from "./getPosts";

/**
 * Relacionados: misma categoría primero, luego los más recientes, excluyendo
 * el propio artículo (máx. 3, nunca el listado entero). El algoritmo es el
 * mismo para Sanity y para el contenido local (pickRelatedPosts).
 */
export async function getRelatedPosts(slug: string, preview = false): Promise<BlogPost[]> {
  if (!isSanityConfigured) {
    const current = getLocalPost(slug);
    return current ? pickRelatedPosts(getLocalPosts(), slug) : [];
  }

  const posts = await getPosts(preview);
  return pickRelatedPosts(posts, slug);
}
