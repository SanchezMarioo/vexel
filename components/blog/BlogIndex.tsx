"use client";

import { m } from "framer-motion";
import Link from "next/link";
import type { BlogPost } from "@/lib/content/blog";
import { formatPostDate, getReadingTime } from "@/lib/content/blog";
import { fadeUp, heroLcpSafe, pfViewport } from "@/lib/portfolio/motion";
import BlogRow from "./BlogRow";

/**
 * Índice del blog: masthead tipográfico + el artículo más reciente a mayor
 * tamaño con su párrafo-respuesta completo (el texto que un buscador de IA
 * citaría, visible ya en el listado) + el resto en una lista compacta con
 * hairlines. Sin imágenes ni cards: la imagen vive dentro del artículo.
 */
export default function BlogIndex({ posts }: { posts: BlogPost[] }) {
  const [featured, ...rest] = posts;

  return (
    <div className="pf-container py-20 md:py-28">
      {/* Masthead */}
      <m.div initial={false} animate="visible" className="max-w-4xl">
        <m.h1
          variants={heroLcpSafe}
          className="pf-display text-pf-ink-strong"
          style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)" }}
        >
          SEO, rendimiento y conversión, sin humo
        </m.h1>
        <m.p
          variants={heroLcpSafe}
          className="pf-prose mt-6 text-lg leading-relaxed text-pf-ink-soft"
        >
          Cada artículo responde una pregunta que nos hacen los clientes, con lo
          que hemos aprendido construyendo proyectos reales. Nada de teoría de
          manual.
        </m.p>
      </m.div>

      {featured ? (
        <>
          {/* Artículo destacado: la respuesta entera, no un teaser. Reveal sin
              gate de opacidad — es contenido citable, visible desde el inicio. */}
          <m.article
            initial={false}
            animate="visible"
            variants={heroLcpSafe}
            className="mt-14 border-t-2 border-pf-ink pt-10 md:mt-20 md:pt-12"
          >
            <p className="pf-mono flex flex-wrap items-center gap-x-2 text-xs text-pf-muted">
              <span>{featured.category}</span>
              <span aria-hidden="true" className="text-pf-line-strong">·</span>
              <span>{formatPostDate(featured.publishedAt)}</span>
              <span aria-hidden="true" className="text-pf-line-strong">·</span>
              <span>{getReadingTime(featured)}</span>
            </p>
            <h2
              className="pf-display mt-4 max-w-4xl text-pf-ink-strong"
              style={{ fontSize: "clamp(1.8rem, 4vw, 3.25rem)" }}
            >
              <Link
                href={`/blog/${featured.slug}`}
                className="transition-colors duration-200 hover:text-pf-ink"
              >
                {featured.title}
              </Link>
            </h2>
            <p className="pf-prose mt-6 text-base leading-relaxed text-pf-ink-soft md:text-lg">
              {featured.intro}
            </p>
            <Link
              href={`/blog/${featured.slug}`}
              aria-label={`Leer el artículo completo: ${featured.title}`}
              className="group mt-7 inline-flex items-center gap-2 text-base font-medium text-pf-ink underline-offset-4 hover:underline"
            >
              Leer el artículo completo
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4 transition-transform duration-300 ease-[var(--pf-ease-out)] group-hover:translate-x-1">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </Link>
          </m.article>

          {/* Resto del archivo */}
          {rest.length > 0 ? (
            <div className="mt-16 md:mt-24">
              <m.h2
                initial="hidden"
                whileInView="visible"
                viewport={pfViewport}
                variants={fadeUp}
                className="pf-display text-2xl text-pf-ink md:text-3xl"
              >
                Más artículos
              </m.h2>
              <ul className="mt-8">
                {rest.map((post) => (
                  <BlogRow key={post.slug} post={post} />
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
