"use client";

import { m } from "framer-motion";
import Link from "next/link";
import type { BlogPost } from "@/lib/content/blog";
import { formatPostDate, getReadingTime } from "@/lib/content/blog";
import { fadeUp, pfViewport } from "@/lib/portfolio/motion";

/**
 * Fila del índice tipográfico del blog. La misma para el listado principal y
 * para los artículos relacionados: sin imagen ni badges — la categoría, la
 * fecha y la lectura van en una columna mono discreta y el peso lo lleva el
 * título. En móvil la metadata pasa a una sola línea sobre el título.
 */
export default function BlogRow({ post }: { post: BlogPost }) {
  const meta = [
    post.category,
    formatPostDate(post.publishedAt),
    getReadingTime(post),
  ];

  return (
    <m.li
      initial="hidden"
      whileInView="visible"
      viewport={pfViewport}
      variants={fadeUp}
      className="relative border-t border-pf-line last:border-b"
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group block py-7 transition-colors duration-300 ease-[var(--pf-ease-out)] hover:bg-pf-surface/60 md:py-9 lg:grid lg:grid-cols-[clamp(10rem,14vw,13rem)_minmax(0,1fr)] lg:gap-10"
      >
        {/* Metadata: línea única en móvil, columna apilada en desktop */}
        <p className="pf-mono flex flex-wrap items-center gap-x-2 text-xs text-pf-muted lg:flex-col lg:items-start lg:gap-1.5 lg:pt-2">
          {meta.map((item, index) => (
            <span key={item} className="flex items-center gap-2">
              {index > 0 ? (
                <span aria-hidden="true" className="text-pf-line-strong lg:hidden">
                  ·
                </span>
              ) : null}
              <span>{item}</span>
            </span>
          ))}
        </p>

        <div className="mt-3 lg:mt-0">
          <h3 className="pf-display text-pf-ink transition-transform duration-300 ease-[var(--pf-ease-out)] group-hover:translate-x-1 group-hover:text-pf-ink-strong" style={{ fontSize: "clamp(1.35rem, 2.6vw, 2rem)" }}>
            {post.title}
          </h3>
          <p className="mt-2.5 text-sm leading-relaxed text-pf-ink-soft sm:truncate">
            {post.excerpt}
          </p>
        </div>

        {/* Afordancia móvil (en desktop se usa la flecha de esquina) */}
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-pf-ink lg:hidden">
          Leer el artículo
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4">
            <path d="M5 12h14m-6-6 6 6-6 6" />
          </svg>
        </span>
      </Link>

      {/* Flecha de esquina (desktop): siempre visible, gana tinta al hover */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-9 hidden h-5 w-5 text-pf-muted transition-colors duration-300 ease-[var(--pf-ease-out)] group-hover:text-pf-ink lg:block"
      >
        <path d="M7 17 17 7M8 7h9v9" />
      </svg>
    </m.li>
  );
}
