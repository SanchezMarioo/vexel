export { DEFAULT_OG_IMAGE, OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH, getOgImage, getOgImageMetadata } from "./getOgImage";

/** Keeps social/search titles within a practical 60-character envelope. */
export function compactSeoTitle(value: string, brand = "Xync"): string {
  const withoutBrand = value
    .replace(/\s*[|·—–-]\s*(?:Blog\s+)?Xync.*$/i, "")
    .trim();
  const suffix = ` | ${brand}`;
  const terminalPunctuation = /[?!…]$/.exec(withoutBrand)?.[0] ?? "";
  const words = withoutBrand.split(/\s+/).filter(Boolean);

  while (words.length > 1 && `${words.join(" ")}${terminalPunctuation}${suffix}`.length > 60) {
    words.pop();
  }

  const compact = words.join(" ");
  return `${compact}${terminalPunctuation && !compact.endsWith(terminalPunctuation) ? terminalPunctuation : ""}${suffix}`;
}
