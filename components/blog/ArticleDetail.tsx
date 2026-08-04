"use client";

import { m } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import type { BlogPost } from "@/lib/content/blog";
import { formatPostDate, getReadingTime } from "@/lib/content/blog";
import { legalEntity } from "@/lib/portfolio/content";
import { fadeUp, heroLcpSafe, pfViewport, stagger } from "@/lib/portfolio/motion";
import Button from "@/components/portfolio/ui/Button";
import BlogRow from "./BlogRow";

interface ArticleDetailProps {
  post: BlogPost;
  related: BlogPost[];
  /** Cuerpo del artículo (PostBody, server component) — llega como children. */
  children: ReactNode;
}

/**
 * Artículo completo: migas, cabecera con categoría + metadatos + intro
 * citable como lede, cuerpo (children), CTA contextual del propio artículo y
 * relacionados con el mismo tratamiento tipográfico del índice. La cabecera
 * entra con reveal LCP-safe; el cuerpo largo queda estático a propósito.
 */
export default function ArticleDetail({ post, related, children }: ArticleDetailProps) {
  return (
    <div className="pf-container pb-24 pt-10 md:pb-32 md:pt-14">
      {/* Migas */}
      <m.nav
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        aria-label="Ruta de navegación"
        className="pf-mono flex flex-wrap items-center gap-2 text-xs text-pf-muted"
      >
        <Link href="/" className="transition-colors hover:text-pf-ink">
          Inicio
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/blog" className="transition-colors hover:text-pf-ink">
          Blog
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-pf-ink-soft">{post.category}</span>
      </m.nav>

      {/* Cabecera: categoría, titular, metadatos y la respuesta citable.
          Todo con heroLcpSafe (sin gate de opacidad): la intro es el texto
          citable del artículo y debe estar visible desde el primer paint. */}
      <m.header
        initial="hidden"
        animate="visible"
        variants={stagger(0.1, 0.03)}
        className="mt-6 max-w-4xl"
      >
        <m.p variants={heroLcpSafe} className="pf-mono text-xs text-pf-muted">
          {post.category}
        </m.p>
        <m.h1
          variants={heroLcpSafe}
          className="pf-display mt-3 text-pf-ink-strong"
          style={{ fontSize: "clamp(2.2rem, 5.5vw, 4rem)" }}
        >
          {post.title}
        </m.h1>
        <m.p
          variants={heroLcpSafe}
          className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-pf-muted"
        >
          <span>{post.authorName ?? legalEntity.legalName}</span>
          <span aria-hidden="true" className="text-pf-line-strong">·</span>
          <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
          <span aria-hidden="true" className="text-pf-line-strong">·</span>
          <span>{getReadingTime(post)}</span>
        </m.p>
        <m.p
          variants={heroLcpSafe}
          className="pf-prose mt-8 text-lg leading-relaxed text-pf-ink-soft md:text-xl"
        >
          {post.intro}
        </m.p>
      </m.header>

      {/* Cuerpo */}
      <div className="mt-4 max-w-4xl md:mt-6">{children}</div>

      {/* CTA contextual (copy propio de cada artículo, no un banner repetido) */}
      <m.section
        initial="hidden"
        whileInView="visible"
        viewport={pfViewport}
        variants={fadeUp}
        aria-label="Contacto"
        className="mt-20 max-w-4xl border-t border-pf-line pt-14 md:mt-28"
      >
        <h2 className="pf-display text-3xl text-pf-ink-strong md:text-4xl" style={{ textWrap: "balance" }}>
          {post.cta.title}
        </h2>
        <p className="pf-prose mt-4 text-lg text-pf-ink-soft">{post.cta.text}</p>
        <div className="mt-8">
          <Button href={post.cta.href} variant="primary" size="lg" withArrow>
            {post.cta.label}
          </Button>
        </div>
      </m.section>

      {/* Relacionados */}
      {related.length > 0 ? (
        <section aria-label="Artículos relacionados" className="mt-20 md:mt-28">
          <m.h2
            initial="hidden"
            whileInView="visible"
            viewport={pfViewport}
            variants={fadeUp}
            className="pf-display text-2xl text-pf-ink md:text-3xl"
          >
            Seguir leyendo
          </m.h2>
          <ul className="mt-8">
            {related.map((rel) => (
              <BlogRow key={rel.slug} post={rel} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
