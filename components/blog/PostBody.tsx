import Image from "next/image";
import type { BlogBlock } from "@/lib/content/blog";
import InlineText from "./InlineText";

/**
 * Renderer de los bloques del cuerpo del artículo (lib/content/blog.ts).
 * Tipografía pura sobre hairlines: las citas van entre reglas horizontales a
 * tamaño display y la evidencia de proyecto es un bloque con etiqueta mono y
 * enlace al caso — sin cards, sin stripes laterales, sin cajas de color.
 * Componente de servidor: el cuerpo no se anima por bloques (la lectura
 * manda; solo la cabecera del artículo tiene reveal).
 */
function Block({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="pf-prose mt-6 text-base leading-relaxed text-pf-ink-soft md:text-[1.0625rem]">
          <InlineText text={block.text} />
        </p>
      );

    case "heading":
      if (block.level === 3) {
        return (
          <h3 className="pf-display mt-12 text-xl text-pf-ink md:text-2xl">
            <InlineText text={block.text} />
          </h3>
        );
      }
      return (
        <h2 className="pf-display mt-16 text-2xl text-pf-ink md:text-3xl">
          <InlineText text={block.text} />
        </h2>
      );

    case "list":
      if (block.style === "number") {
        return (
          <ol className="pf-prose mt-6 flex flex-col gap-3">
            {block.items.map((item, index) => (
              <li key={index} className="flex gap-3.5 text-base leading-relaxed text-pf-ink-soft md:text-[1.0625rem]">
                <span aria-hidden="true" className="pf-mono pt-0.5 text-sm text-pf-muted">
                  {index + 1}.
                </span>
                <span>
                  <InlineText text={item} />
                </span>
              </li>
            ))}
          </ol>
        );
      }
      return (
        <ul className="pf-prose mt-6 flex flex-col gap-3">
          {block.items.map((item, index) => (
            <li key={index} className="flex gap-3.5 text-base leading-relaxed text-pf-ink-soft md:text-[1.0625rem]">
              <span aria-hidden="true" className="text-pf-muted">
                —
              </span>
              <span>
                <InlineText text={item} />
              </span>
            </li>
          ))}
        </ul>
      );

    case "quote":
      return (
        <blockquote className="mt-14 border-y border-pf-line py-8 md:py-10">
          <p className="pf-display max-w-[58ch] text-xl text-pf-ink md:text-2xl" style={{ textWrap: "pretty" }}>
            «<InlineText text={block.text} />»
          </p>
          {block.source ? (
            <cite className="pf-mono mt-4 block text-xs not-italic text-pf-muted">
              — {block.source}
            </cite>
          ) : null}
        </blockquote>
      );

    case "evidence":
      return (
        <aside className="mt-14 border-t border-pf-line pt-6">
          <p className="pf-mono text-xs text-pf-muted">
            Caso real · {block.projectName}
          </p>
          <p className="pf-prose mt-3 text-base leading-relaxed text-pf-ink-soft md:text-[1.0625rem]">
            <InlineText text={block.text} />
          </p>
          <a
            href={`/proyectos/${block.projectSlug}`}
            className="group mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-pf-ink underline-offset-4 hover:underline"
          >
            Ver el caso {block.projectName}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4 transition-transform duration-300 ease-[var(--pf-ease-out)] group-hover:translate-x-1">
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </a>
        </aside>
      );

    case "image":
      return (
        <figure className="mt-10">
          <div className="overflow-hidden rounded-[var(--pf-radius-lg)] border border-pf-line">
            <Image
              src={block.src}
              alt={block.alt}
              width={block.width}
              height={block.height}
              sizes="(min-width: 896px) 56rem, 100vw"
              className="h-auto w-full object-cover"
              {...(block.blurDataURL
                ? { placeholder: "blur" as const, blurDataURL: block.blurDataURL }
                : {})}
            />
          </div>
          {block.caption ? (
            <figcaption className="pf-mono mt-3 text-xs text-pf-muted">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );

    case "code":
      return (
        <div className="mt-10 overflow-hidden rounded-[var(--pf-radius-lg)] bg-pf-inverse-bg">
          <p className="pf-mono border-b border-pf-inverse-ink/15 px-5 py-2.5 text-xs text-pf-inverse-ink/50">
            {block.language}
          </p>
          <pre className="overflow-x-auto p-5">
            <code className="pf-mono text-sm leading-relaxed text-pf-inverse-ink">
              {block.code}
            </code>
          </pre>
        </div>
      );
  }
}

export default function PostBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div>
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}
