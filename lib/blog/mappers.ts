import "server-only";
import type { BlogPost } from "@/lib/content/blog";
import type { SanityPostCard, SanityPostFull } from "@/sanity/types";
import { getOgImage } from "@/lib/seo/getOgImage";
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
    status: post.status,
    featured: post.featured,
    wordCount: post.wordCount,
  };
}

function mapImage(image?: { url: string; alt: string; width: number; height: number; lqip?: string }) {
  if (!image?.url || !image.width || !image.height) return undefined;
  return {
    src: image.url,
    alt: image.alt,
    width: image.width,
    height: image.height,
    ...(image.lqip ? { blurDataURL: image.lqip } : {}),
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

  // La imagen social solo usa el campo OG explícito; si falta, getOgImage()
  // aplica el fallback global del sitio.
  const social = post.ogImage;
  const ogImage = {
    src: getOgImage(social),
    alt: social?.alt ?? post.title,
    width: 1200,
    height: 630,
  };

  const heroImage = mapImage(post.hero?.image);

  return {
    ...mapCard(post),
    hero: post.hero
      ? {
          ...(post.hero.eyebrow ? { eyebrow: post.hero.eyebrow } : {}),
          ...(post.hero.title ? { title: post.hero.title } : {}),
          ...(post.hero.text ? { text: post.hero.text } : {}),
          ...(heroImage ? { image: heroImage } : {}),
        }
      : null,
    content: mapPortableTextToBlocks(post.content),
    faq: post.faq ?? [],
    cta,
    // Conteo exacto sobre los bloques mapeados (más fiel que el de la tarjeta).
    wordCount: undefined,
    ...(post.author?.name ? { authorName: post.author.name } : {}),
    ...(post.seoTitle ? { seoTitle: post.seoTitle } : {}),
    ...(post.seoDescription || post.metaDescription
      ? {
          seoDescription: post.seoDescription || post.metaDescription,
          metaDescription: post.metaDescription || post.seoDescription,
        }
      : {}),
    ogImage,
  };
}
