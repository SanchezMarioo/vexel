import "server-only";
import imageUrlBuilder from "@sanity/image-url";
import { sanityDataset, sanityProjectId } from "./env";

/**
 * Fuente de imagen aceptada por el builder: objeto de asset de Sanity
 * (proyección GROQ) o una URL string. @sanity/image-url no re-exporta
 * su tipo SanityImageSource desde el paquete.
 */
export type SanityImageSource =
  | string
  | { _ref?: string; _type?: string }
  | {
      _type: "image";
      asset?: { _ref?: string; _id?: string; url?: string };
      crop?: unknown;
      hotspot?: unknown;
    };

/**
 * Helper único para URLs de imagen de Sanity CDN: recorte inteligente,
 * formato automático (webp/avif según navegador) y tamaños bajo demanda.
 * Siempre combinado con next/image en el render.
 */

const builder = imageUrlBuilder({
  projectId: sanityProjectId || "placeholder",
  dataset: sanityDataset,
});

/** URL optimizada a un ancho concreto (next/image pide el tamaño exacto). */
export function urlForImage(source: SanityImageSource, width: number): string {
  return builder.image(source).width(width).auto("format").quality(80).url();
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
