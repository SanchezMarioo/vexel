import { groq } from "next-sanity";

/**
 * Queries GROQ reutilizables del blog. Las páginas NUNCA contienen GROQ:
 * solo llaman a los helpers de lib/blog/*, que usan estas constantes.
 */

/** Campos de la tarjeta de listado — sin el cuerpo Portable Text (pesado).
 *  wordCount se calcula en GROQ con pt::text para el tiempo de lectura. */
const POST_CARD_FIELDS = groq`
  _id,
  "slug": slug.current,
  title,
  excerpt,
  intro,
  status,
  publishedAt,
  "updatedAt": coalesce(updatedAt, _updatedAt),
  "featured": coalesce(featured, false),
  "category": category->title,
  "categorySlug": category->slug.current,
  "wordCount": length(string::split(pt::text(coalesce(content, [])), " "))
    + length(string::split(coalesce(intro, ""), " "))
`;

/** Todas las tarjetas, de más reciente a más antigua. */
export const POSTS_QUERY = groq`
  *[_type == "post" && defined(slug.current) && (status == "published" || !defined(status))] | order(publishedAt desc) {
    ${POST_CARD_FIELDS}
  }
`;

/** Artículo completo por slug (con hero, cuerpo, faq, autor, CTA y SEO). */
export const POST_BY_SLUG_QUERY = groq`
  *[_type == "post" && (status == "published" || !defined(status)) && slug.current == $slug][0] {
    ${POST_CARD_FIELDS},
    hero {
      eyebrow,
      title,
      text,
      image {
        "url": asset->url,
        "alt": coalesce(alt, ""),
        "width": asset->metadata.dimensions.width,
        "height": asset->metadata.dimensions.height,
        "lqip": asset->metadata.lqip
      }
    },
    content[]{
      ...,
      markDefs,
      _type == "image" => {
        "url": asset->url,
        "width": asset->metadata.dimensions.width,
        "height": asset->metadata.dimensions.height,
        "lqip": asset->metadata.lqip
      }
    },
    faq[]{ question, answer },
    "author": author->{
      name,
      bio,
      "image": image{ "url": asset->url, "alt": coalesce(alt, "") }
    },
    "cta": cta{ title, text, label, href },
    seoTitle,
    "seoDescription": coalesce(seoDescription, metaDescription, excerpt),
    metaDescription,
    "coverImage": coverImage{
      asset,
      crop,
      hotspot,
      "alt": coalesce(alt, ""),
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    },
    "ogImage": ogImage{
      asset,
      crop,
      hotspot,
      "alt": coalesce(alt, ""),
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    }
  }
`;

const SERVICE_CARD_FIELDS = groq`
  _id,
  "slug": slug.current,
  title,
  "updatedAt": coalesce(updatedAt, _updatedAt),
  status
`;

/** Todas las páginas comerciales publicadas, ordenadas por actualización. */
export const SERVICES_QUERY = groq`
  *[_type == "service" && status == "published" && defined(slug.current)] | order(updatedAt desc, _updatedAt desc) {
    ${SERVICE_CARD_FIELDS}
  }
`;

/** Página comercial publicada por su slug raíz. */
export const SERVICE_BY_SLUG_QUERY = groq`
  *[_type == "service" && status == "published" && slug.current == $slug][0] {
    ${SERVICE_CARD_FIELDS},
    seoTitle,
    metaDescription,
    hero {
      eyebrow,
      title,
      text,
      image {
        "url": asset->url,
        "alt": coalesce(alt, ""),
        "width": asset->metadata.dimensions.width,
        "height": asset->metadata.dimensions.height,
        "lqip": asset->metadata.lqip
      }
    },
    content[]{
      ...,
      markDefs,
      _type == "image" => {
        "url": asset->url,
        "width": asset->metadata.dimensions.width,
        "height": asset->metadata.dimensions.height,
        "lqip": asset->metadata.lqip
      }
    },
    faq[]{ question, answer },
    "cta": cta{ title, text, label, href },
    "ogImage": ogImage{
      asset,
      crop,
      hotspot,
      "alt": coalesce(alt, ""),
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    }
  }
`;
