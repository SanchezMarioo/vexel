import "server-only";
import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { sanityDataset, sanityProjectId } from "./env";

/**
 * Fuente de imagen aceptada por el builder: objeto de asset de Sanity
 * (proyección GROQ) o una URL string.
 */
export type { SanityImageSource } from "@sanity/image-url";

/**
 * Helper único para URLs de imagen de Sanity CDN: recorte inteligente,
 * formato automático (webp/avif según navegador) y tamaños bajo demanda.
 * Siempre combinado con next/image en el render.
 */

const builder = createImageUrlBuilder({
  projectId: sanityProjectId || "placeholder",
  dataset: sanityDataset,
});

/** URL optimizada a un ancho concreto (next/image pide el tamaño exacto). */
export function urlForImage(source: SanityImageSource, width: number): string {
  return builder.image(source).width(width).auto("format").quality(80).url();
}

/**
 * URL social estable y verificable: JPEG, HTTPS, 1200x630 y sin negociación
 * de formato por User-Agent. Los crawlers sociales no siempre anuncian bien
 * los formatos que aceptan; para OG es más fiable forzar image/jpeg.
 */
export function urlForOgImage(source: SanityImageSource): string {
  return builder
    .image(source)
    .width(1200)
    .height(630)
    .fit("crop")
    .auto("format")
    .format("jpg")
    .dpr(1)
    .url();
}

/** Loader personalizado de next/image para imágenes de Sanity CDN. */
export function sanityImageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // src ya es una URL de cdn.sanity.io: pedimos el ancho exacto a la CDN.
  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}w=${width}&auto=format&q=80`;
}
