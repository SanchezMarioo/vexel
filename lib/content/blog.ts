/**
 * Contenido del blog de Xync.
 *
 * El blog existe para SEO y para demostrar criterio (E-E-A-T), no como diario:
 * cada artículo responde una pregunta real que hace un cliente NO técnico y
 * nace de un proyecto propio. Reglas editoriales:
 *
 * - `intro` es el primer párrafo del artículo: autosuficiente y citable
 *   (134–167 palabras), responde directamente la pregunta del título. Es lo
 *   que un AI Overview o ChatGPT pueden citar sin más contexto.
 * - Los H2/H3 van en formato pregunta cuando el contenido responde una
 *   búsqueda real ("¿Por qué mi web va lenta en móvil?").
 * - `evidence` conecta el punto con un proyecto real (/proyectos/[slug]).
 * - Enlaces inline con la sintaxis [texto](/ruta) dentro de párrafos, listas
 *   y citas: el renderer los convierte en <Link> internos o <a> externos.
 *   Nunca se inyecta HTML crudo.
 *
 * El tiempo de lectura NO se guarda a mano: se calcula del contenido
 * (getReadingTime) para que nunca quede desactualizado al editar.
 */

export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "list"; style: "bullet" | "number"; items: string[] }
  | { type: "quote"; text: string; source?: string }
  | { type: "evidence"; text: string; projectSlug: string; projectName: string }
  | { type: "image"; src: string; alt: string; width: number; height: number; caption?: string; blurDataURL?: string }
  | { type: "code"; language: string; code: string };

export interface BlogCta {
  /** Titular del CTA, conectado al tema del artículo (no un banner genérico). */
  title: string;
  text: string;
  label: string;
  href: string;
}

export interface BlogPost {
  /** Segmento de URL en /blog/[slug]. Estable y único. */
  slug: string;
  title: string;
  /** Meta description y resumen de una línea en el listado (150–160 car.). */
  excerpt: string;
  /** Primer párrafo citable (134–167 palabras). Responde el título. */
  intro: string;
  /** ISO 8601 (YYYY-MM-DD). */
  publishedAt: string;
  updatedAt?: string;
  category: string;
  status?: "published" | "draft";
  hero?: {
    eyebrow?: string;
    title?: string;
    text?: string;
    image?: { src: string; alt: string; width: number; height: number; blurDataURL?: string };
  } | null;
  content: BlogBlock[];
  faq?: Array<{ question: string; answer: string }>;
  cta: BlogCta;
  /** Marcado en el CMS para destacarse en /blog (fallback: el más reciente). */
  featured?: boolean;
  /**
   * Palabras de intro + cuerpo cuando la fuente no trae el cuerpo cargado
   * (tarjetas de Sanity en listados). Si está, getReadingTime lo usa en vez
   * de contar los bloques.
   */
  wordCount?: number;
  /** Nombre del autor (CMS). Si falta, la firma cae al titular del estudio. */
  authorName?: string;
  /** Overrides SEO del CMS; si faltan se usa title/excerpt. */
  seoTitle?: string;
  seoDescription?: string;
  metaDescription?: string;
  /** Imagen OG propia del artículo (CMS); si falta, la OG del sitio. */
  ogImage?: { src: string; alt: string; width: number; height: number };
}

export const blogPosts: BlogPost[] = [];

/** Busca un artículo por su slug de URL. */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

/** Artículos ordenados de más reciente a más antiguo (para el listado). */
export function getPostsByDate(): BlogPost[] {
  return [...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/**
 * Relacionados: misma categoría primero, luego los más recientes, excluyendo
 * el propio artículo. Máximo `limit` (por defecto 3, nunca el listado entero).
 * Función pura compartida por la fuente local y por Sanity (lib/blog/*).
 */
export function pickRelatedPosts(all: BlogPost[], slug: string, limit = 3): BlogPost[] {
  const current = all.find((post) => post.slug === slug);
  if (!current) return [];

  const others = all.filter((post) => post.slug !== slug);
  const sameCategory = others.filter((post) => post.category === current.category);
  const rest = others.filter((post) => post.category !== current.category);

  return [...sameCategory, ...rest].slice(0, limit);
}

const WORDS_PER_MINUTE = 200;

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function countBlockWords(block: BlogBlock): number {
  switch (block.type) {
    case "paragraph":
    case "heading":
    case "quote":
      return countWords(block.text) + ("source" in block && block.source ? countWords(block.source) : 0);
    case "list":
      return block.items.reduce((total, item) => total + countWords(item), 0);
    case "evidence":
      return countWords(block.text);
    case "image":
      return block.caption ? countWords(block.caption) : 0;
    case "code":
      // El código no se "lee" como prosa: no infla el tiempo de lectura.
      return 0;
  }
}

function resolveWordCount(post: BlogPost): number {
  if (typeof post.wordCount === "number") return post.wordCount;
  return (
    countWords(post.intro) +
    post.content.reduce((total, block) => total + countBlockWords(block), 0)
  );
}

/** "X min de lectura", calculado del contenido real (≈200 palabras/min). */
export function getReadingTime(post: BlogPost): string {
  const minutes = Math.max(2, Math.round(resolveWordCount(post) / WORDS_PER_MINUTE));
  return `${minutes} min de lectura`;
}

/** Número de palabras del cuerpo (para wordCount del schema BlogPosting). */
export function getWordCount(post: BlogPost): number {
  return resolveWordCount(post);
}

const postDateFormatter = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Fecha larga en español, estable en servidor (zona UTC fija). */
export function formatPostDate(isoDate: string): string {
  return postDateFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}
