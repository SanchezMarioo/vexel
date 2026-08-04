import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Renderiza texto plano con el mini-formato inline del blog:
 * - enlaces [texto](/ruta) o [texto](https://…)
 * - **negrita** y *cursiva*
 * Solo admite rutas internas y URLs http(s); cualquier otra cosa se imprime
 * literal. Nunca inyecta HTML — el contenido vive como texto puro tanto en
 * lib/content/blog.ts como en Portable Text (serializado por lib/blog).
 */
const INLINE_PATTERN =
  /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;

const linkClasses =
  "font-medium text-pf-ink underline decoration-pf-line-strong underline-offset-4 transition-colors duration-200 hover:decoration-pf-ink";

export default function InlineText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(INLINE_PATTERN)) {
    const [raw, linkLabel, href, strong, em] = match;
    const index = match.index ?? 0;

    if (index > lastIndex) {
      nodes.push(text.slice(lastIndex, index));
    }

    if (linkLabel !== undefined && href !== undefined) {
      nodes.push(
        href.startsWith("/") ? (
          <Link key={index} href={href} className={linkClasses}>
            {linkLabel}
          </Link>
        ) : (
          <a key={index} href={href} target="_blank" rel="noreferrer noopener" className={linkClasses}>
            {linkLabel}
          </a>
        ),
      );
    } else if (strong !== undefined) {
      nodes.push(
        <strong key={index} className="font-medium text-pf-ink">
          {strong}
        </strong>,
      );
    } else if (em !== undefined) {
      nodes.push(<em key={index}>{em}</em>);
    }

    lastIndex = index + raw.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return <>{nodes}</>;
}
