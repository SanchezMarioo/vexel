import { toAbsoluteUrl } from "@/lib/site-url";

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const DEFAULT_OG_IMAGE = toAbsoluteUrl("/opengraph-image");

export interface SocialImage {
  url: string;
  alt: string;
  width: number;
  height: number;
  type: "image/jpeg" | "image/png";
}

export function socialImage(url = DEFAULT_OG_IMAGE, alt = "Xync"): SocialImage {
  return {
    url: toAbsoluteUrl(url),
    alt,
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    type: url.endsWith(".jpg") || url.includes("fm=jpg") ? "image/jpeg" : "image/png",
  };
}
