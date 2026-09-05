export { DEFAULT_OG_IMAGE, OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH, getOgImage, getOgImageMetadata } from "./getOgImage";

const STOPWORDS = new Set(["en", "de", "del", "a", "al", "para", "por", "con", "y", "o", "el", "la", "los", "las", "un", "una", "unos", "unas", "que"]);

/** Keeps social/search titles within a practical 60-65 character envelope without cutting off key location words or leaving dangling prepositions. */
export function compactSeoTitle(value: string, brand = "Xync", maxLength = 65): string {
  const withoutBrand = value
    .replace(/\s*[|·—–-]\s*(?:Blog\s+)?Xync.*$/i, "")
    .trim();
  const suffix = ` | ${brand}`;
  const terminalPunctuation = /[?!…]$/.exec(withoutBrand)?.[0] ?? "";
  const words = withoutBrand.split(/\s+/).filter(Boolean);

  while (words.length > 1 && `${words.join(" ")}${terminalPunctuation}${suffix}`.length > maxLength) {
    words.pop();
  }

  // Si al recortar queda una preposición o artículo huérfano al final, retíralo
  while (words.length > 1 && STOPWORDS.has(words[words.length - 1].toLowerCase())) {
    words.pop();
  }

  const compact = words.join(" ");
  return `${compact}${terminalPunctuation && !compact.endsWith(terminalPunctuation) ? terminalPunctuation : ""}${suffix}`;
}
