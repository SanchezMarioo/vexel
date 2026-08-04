import "server-only";
import type { BlogPost } from "@/lib/content/blog";
import type { SanityPostCard, SanityPostFull } from "@/sanity/types";
import { mapPortableTextToBlocks } from "./portable-text";

/**
 * Conversión documento Sanity → BlogPost del dominio (el contrato que la UI
 * ya consume). Aquí viven todos los fallbacks por campos ausentes:
 * categoría sin asignar, sin CTA propio, fechas con hora, etc.
 */

function toIsoDate(value: string): string {
  // publishedAt es datetime en Sanity; el modelo del sitio usa YYYY-MM-DD.
  return value.slice(0, 10);
}

const DEFAULT_CTA: BlogPost["cta"] = {
  title: "¿Hablamos de tu proyecto?",
  text: "Cuéntanos qué necesitas y te decimos con franqueza si podemos ayudarte, con precio y plazo cerrados antes de empezar.",
  label: "Cuéntanos tu caso",
  href: "/#contacto",
};

function mapCard(post: SanityPostCard): Omit<BlogPost, "content" | "cta"> {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    intro: post.intro,
    publishedAt: toIsoDate(post.publishedAt),
    ...(post.updatedAt ? { updatedAt: toIsoDate(post.updatedAt) } : {}),
    category: post.category ?? "General",
    featured: post.featured,
    wordCount: post.wordCount,
  };
}

/**
 * Tarjeta de listado: BlogPost completo en forma, con el cuerpo vacío (los
 * componentes del listado no lo usan) y wordCount precalculado en GROQ para
 * que el tiempo de lectura siga siendo correcto sin cargar Portable Text.
 */
export function mapSanityCard(post: SanityPostCard): BlogPost {
  return {
    ...mapCard(post),
    content: [],
    cta: DEFAULT_CTA,
  };
}

export function mapSanityPost(post: SanityPostFull): BlogPost {
  const cta =
    post.cta?.title && post.cta.text && post.cta.label && post.cta.href
      ? { title: post.cta.title, text: post.cta.text, label: post.cta.label, href: post.cta.href }
      : DEFAULT_CTA;

  // Imagen social: ogImage propia; si falta, la portada. Dimensiones de la CDN.
  const social = post.ogImage ?? post.coverImage;
  const ogImage =
    social && social.width > 0 && social.height > 0
      ? { src: social.url, alt: social.alt, width: social.width, height: social.height }
      : undefined;

  return {
    ...mapCard(post),
    content: mapPortableTextToBlocks(post.content),
    cta,
    // Conteo exacto sobre los bloques mapeados (más fiel que el de la tarjeta).
    wordCount: undefined,
    ...(post.author?.name ? { authorName: post.author.name } : {}),
    ...(post.seoTitle ? { seoTitle: post.seoTitle } : {}),
    ...(post.seoDescription ? { seoDescription: post.seoDescription } : {}),
    ...(ogImage ? { ogImage } : {}),
  };
}
