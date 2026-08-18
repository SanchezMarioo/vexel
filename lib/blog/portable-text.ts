import "server-only";
import type { BlogBlock } from "@/lib/content/blog";
import type {
  SanityPortableText,
  SanityPtBlock,
  SanityPtImage,
  SanitySpan,
} from "@/sanity/types";
import { urlForImage } from "@/sanity/image";

/**
 * Mapea Portable Text (Sanity) al modelo de bloques del sitio (BlogBlock),
 * que es lo que la UI sabe renderizar. Los componentes no saben si el
 * contenido vino de content.ts o de Sanity.
 *
 * Los spans con marcas se serializan al mini-formato inline que InlineText
 * ya entiende: enlaces [texto](url), **negrita** y *cursiva*.
 */

function serializeSpan(span: SanitySpan, linkDefsMap: Map<string, string>): string {
  const marks = span.marks ? new Set(span.marks) : null;
  let text = span.text;
  if (!marks || marks.size === 0) return text;

  if (marks.has("strong")) text = `**${text}**`;
  if (marks.has("em")) text = `*${text}*`;
  for (const mark of marks) {
    const href = linkDefsMap.get(mark);
    if (href) {
      text = `[${text}](${href})`;
      break;
    }
  }
  return text;
}

function serializeBlockText(block: SanityPtBlock): string {
  const linkDefsMap = new Map<string, string>();
  if (block.markDefs) {
    for (const def of block.markDefs) {
      if (def._type === "link" && def._key && def.href) {
        linkDefsMap.set(def._key, def.href);
      }
    }
  }
  return (block.children ?? []).map((span) => serializeSpan(span, linkDefsMap)).join("");
}

function mapImage(block: SanityPtImage): BlogBlock | null {
  // Imagen sin asset o sin dimensiones: se omite con elegancia (no rompe el render).
  if (!block.url || !block.width || !block.height) return null;
  return {
    type: "image",
    src: urlForImage(block.asset ?? block.url, 1600),
    alt: block.alt ?? "",
    width: block.width,
    height: block.height,
    ...(block.caption ? { caption: block.caption } : {}),
    ...(block.lqip ? { blurDataURL: block.lqip } : {}),
  };
}

/**
 * Convierte el array Portable Text en BlogBlock[]. Los listItems consecutivos
 * del mismo estilo se agrupan en un solo bloque `list` (la UI los pinta como
 * una única lista).
 */
export function mapPortableTextToBlocks(value: SanityPortableText | null): BlogBlock[] {
  if (!value) return [];

  const blocks: BlogBlock[] = [];

  for (const item of value) {
    if (item._type === "block") {
      const text = serializeBlockText(item).trim();

      if (item.listItem === "bullet" || item.listItem === "number") {
        if (!text) continue;
        const style = item.listItem;
        const last = blocks[blocks.length - 1];
        if (last?.type === "list" && last.style === style) {
          last.items.push(text);
        } else {
          blocks.push({ type: "list", style, items: [text] });
        }
        continue;
      }

      if (!text) continue;

      switch (item.style) {
        case "h2":
          blocks.push({ type: "heading", level: 2, text });
          break;
        case "h3":
          blocks.push({ type: "heading", level: 3, text });
          break;
        case "blockquote":
          blocks.push({ type: "quote", text });
          break;
        default:
          blocks.push({ type: "paragraph", text });
      }
      continue;
    }

    if (item._type === "image") {
      const image = mapImage(item);
      if (image) blocks.push(image);
      continue;
    }

    if (item._type === "code") {
      if (!item.code?.trim()) continue;
      blocks.push({ type: "code", language: item.language ?? "text", code: item.code });
      continue;
    }

    if (item._type === "evidence") {
      if (!item.text?.trim() || !item.projectSlug || !item.projectName) continue;
      blocks.push({
        type: "evidence",
        text: item.text.trim(),
        projectSlug: item.projectSlug,
        projectName: item.projectName,
      });
    }
  }

  return blocks;
}
