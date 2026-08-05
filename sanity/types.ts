/**
 * Tipos de los documentos tal y como los devuelven las proyecciones GROQ
 * (sanity/queries.ts). Nada de `any`: cada campo proyectado tiene tipo.
 */

export interface SanityImage {
  url: string;
  alt: string;
  width: number;
  height: number;
  lqip?: string;
}

export interface SanityCategory {
  title: string;
  slug: string;
}

export interface SanityAuthor {
  name: string;
  bio?: string;
  image?: { url: string; alt: string };
}

export interface SanitySpan {
  _type: "span";
  _key: string;
  text: string;
  marks?: string[];
}

export interface SanityMarkDef {
  _key: string;
  _type: string;
  href?: string;
}

export interface SanityPtBlock {
  _type: "block";
  _key: string;
  style: string;
  listItem?: "bullet" | "number";
  level?: number;
  children?: SanitySpan[];
  markDefs?: SanityMarkDef[];
}

export interface SanityPtImage {
  _type: "image";
  _key: string;
  alt?: string;
  caption?: string;
  /** Ref original del asset (spread del documento) para el url builder. */
  asset?: { _ref?: string; _type?: string };
  /** Proyección directa (url, dimensiones y placeholder). */
  url?: string;
  width?: number;
  height?: number;
  lqip?: string;
}

export interface SanityPtCode {
  _type: "code";
  _key: string;
  language?: string;
  code?: string;
}

export interface SanityPtEvidence {
  _type: "evidence";
  _key: string;
  text?: string;
  projectSlug?: string;
  projectName?: string;
}

export type SanityPortableText = Array<
  SanityPtBlock | SanityPtImage | SanityPtCode | SanityPtEvidence
>;

export interface SanityPostCta {
  title: string;
  text: string;
  label: string;
  href: string;
}

/** Tarjeta de listado (sin cuerpo Portable Text). */
export interface SanityPostCard {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  intro: string;
  publishedAt: string;
  updatedAt?: string;
  featured: boolean;
  category: string | null;
  categorySlug: string | null;
  wordCount: number;
}

/** Artículo completo. */
export interface SanityPostFull extends SanityPostCard {
  content: SanityPortableText | null;
  author: SanityAuthor | null;
  cta: SanityPostCta | null;
  seoTitle?: string;
  seoDescription?: string;
  coverImage: SanityImage | null;
  ogImage: SanityImage | null;
}

export interface SanityServiceCard {
  _id: string;
  slug: string;
  title: string;
  updatedAt?: string;
  status: "published";
}

export interface SanityServiceFull extends SanityServiceCard {
  seoTitle?: string;
  metaDescription: string;
  hero: {
    eyebrow?: string;
    title?: string;
    text?: string;
    image?: SanityImage;
  } | null;
  content: SanityPortableText | null;
  faq: Array<{ question: string; answer: string }> | null;
  cta: { title?: string; text?: string; label?: string; href?: string } | null;
  ogImage: SanityImage | null;
}
