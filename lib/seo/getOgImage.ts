import "server-only";
import { urlForOgImage } from "@/sanity/image";
import type { SanityImageSource } from "@/sanity/types";
import { toAbsoluteUrl } from "@/lib/site-url";

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const DEFAULT_OG_IMAGE = toAbsoluteUrl("/opengraph-image");

export type OgImageInput =
  | SanityImageSource
  | { src?: string | null }
  | string
  | null
  | undefined;

/**
 * Returns the canonical social image URL for every content type.
 * Sanity assets are resized/cropped by the Image URL Builder; absent assets
 * always use the site's generated 1200x630 fallback.
 */
export function getOgImage(image?: OgImageInput): string {
  if (image && typeof image === "object" && "asset" in image && image.asset?._ref) {
    return urlForOgImage({
      _type: "image",
      asset: image.asset,
      crop: image.crop,
      hotspot: image.hotspot,
    });
  }

  if (typeof image === "string" && image.length > 0) {
    return toAbsoluteUrl(image);
  }

  if (image && typeof image === "object" && "src" in image && image.src) {
    return toAbsoluteUrl(image.src);
  }

  return DEFAULT_OG_IMAGE;
}

export interface OgImageMetadata {
  url: string;
  alt: string;
  width: typeof OG_IMAGE_WIDTH;
  height: typeof OG_IMAGE_HEIGHT;
  type: "image/jpeg" | "image/png";
}

export function getOgImageMetadata(image: OgImageInput, alt = "Xync"): OgImageMetadata {
  const url = getOgImage(image);
  return {
    url,
    alt,
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    type: url.includes("fm=jpg") ? "image/jpeg" : "image/png",
  };
}
