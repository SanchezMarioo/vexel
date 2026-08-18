import "server-only";
import { cache } from "react";
import type { BlogPost } from "@/lib/content/blog";
import { getPosts } from "./getPosts";

/**
 * Artículo destacado del listado: el marcado con `featured` más reciente;
 * si ninguno lo está, el más reciente publicado. Devuelve también el resto
 * (ordenado por fecha) para componer el índice sin duplicarlo.
 */
export const getFeaturedPost = cache(async function getFeaturedPost(
  preview = false,
): Promise<{ featured: BlogPost | null; rest: BlogPost[] }> {
  const posts = await getPosts(preview);

  if (posts.length === 0) {
    return { featured: null, rest: [] };
  }

  const featuredIndex = posts.findIndex((post) => post.featured === true);
  if (featuredIndex === -1) {
    const [featured, ...rest] = posts;
    return { featured: featured ?? null, rest };
  }

  const featured = posts[featuredIndex] ?? null;
  return {
    featured,
    rest: posts.filter((_, index) => index !== featuredIndex),
  };
});
