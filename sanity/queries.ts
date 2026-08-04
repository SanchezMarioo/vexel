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
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    ${POST_CARD_FIELDS}
  }
`;

/** Artículo completo por slug (con cuerpo, autor, CTA y SEO). */
export const POST_BY_SLUG_QUERY = groq`
  *[_type == "post" && slug.current == $slug][0] {
    ${POST_CARD_FIELDS},
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
    "author": author->{
      name,
      bio,
      "image": image{ "url": asset->url, "alt": coalesce(alt, "") }
    },
    "cta": cta{ title, text, label, href },
    seoTitle,
    seoDescription,
    "coverImage": coverImage{
      "url": asset->url,
      "alt": coalesce(alt, ""),
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    },
    "ogImage": ogImage{
      "url": asset->url,
      "alt": coalesce(alt, ""),
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    }
  }
`;

/** Slugs publicados (generateStaticParams). */
export const POST_SLUGS_QUERY = groq`
  *[_type == "post" && defined(slug.current)].slug.current
`;

/** Categorías con recuento de artículos. */
export const CATEGORIES_QUERY = groq`
  *[_type == "category"] | order(title asc) {
    title,
    "slug": slug.current,
    "postCount": count(*[_type == "post" && references(^._id)])
  }
`;
