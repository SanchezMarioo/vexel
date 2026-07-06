"use client";

import { m } from "framer-motion";
import Link from "next/link";
import type { Project } from "@/lib/portfolio/content";
import { isRealUrl, projects } from "@/lib/portfolio/content";
import { fadeUp, maskReveal, pfViewport, stagger } from "@/lib/portfolio/motion";
import ImageSlot from "./ui/ImageSlot";
import Tag from "./ui/Tag";

const [featured, ...rest] = projects;

function Narrative({ project, dense = false }: { project: Project; dense?: boolean }) {
  return (
    <dl className={dense ? "mt-4 space-y-3" : "mt-5 space-y-4"}>
      <div>
        <dt className="pf-mono text-xs uppercase tracking-wide text-pf-muted">Problema</dt>
        <dd className="mt-1 text-pf-ink-soft">{project.problem}</dd>
      </div>
      <div>
        <dt className="pf-mono text-xs uppercase tracking-wide text-pf-muted">Qué construí</dt>
        <dd className="mt-1 text-pf-ink-soft">{project.built}</dd>
      </div>
      <div>
        <dt className="pf-mono text-xs uppercase tracking-wide text-pf-ink">Resultado</dt>
        <dd className="mt-1 font-medium text-pf-ink">{project.result}</dd>
      </div>
    </dl>
  );
}

function ProjectLinks({ project }: { project: Project }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
      <Link
        href={`/proyectos/${project.slug}`}
        className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-pf-ink underline-offset-4 hover:underline"
      >
        Ver el caso
        <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" aria-hidden="true" className="h-4 w-4 transition-transform duration-300 ease-[var(--pf-ease-out)] group-hover/link:translate-x-1" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>
      </Link>
      {isRealUrl(project.liveUrl) ? (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="group/live inline-flex items-center gap-1.5 text-sm text-pf-ink-soft underline-offset-4 transition-colors hover:text-pf-ink hover:underline"
        >
          Ver en vivo
          <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" aria-hidden="true" className="h-4 w-4 transition-transform duration-300 ease-[var(--pf-ease-out)] group-hover/live:translate-x-0.5 group-hover/live:-translate-y-0.5" viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg>
        </a>
      ) : null}
    </div>
  );
}

export default function Projects() {
  return (
    <section id="proyectos" className="scroll-mt-20 border-t border-pf-line py-24 md:py-32">
      <div className="pf-container">
        <m.div
          initial="hidden"
          whileInView="visible"
          viewport={pfViewport}
          variants={fadeUp}
          className="max-w-3xl"
        >
          <h2
            className="pf-display text-pf-ink-strong"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)" }}
          >
            Casos reales de webs y tiendas online que ya venden
          </h2>
          <p className="pf-prose mt-5 text-lg text-pf-ink-soft">
            Qué problema tenía cada negocio, qué construí y qué cambió después. Eso es lo
            que de verdad importa.
          </p>
        </m.div>

        {featured ? (
          <m.article
            initial="hidden"
            whileInView="visible"
            viewport={pfViewport}
            variants={stagger(0.12)}
            className="mt-14 grid gap-8 lg:grid-cols-12 lg:items-center"
          >
            <m.div variants={maskReveal} className="lg:col-span-7">
              <Link
                href={`/proyectos/${featured.slug}`}
                aria-label={`Ver el caso: ${featured.title}`}
                className="group relative block overflow-hidden rounded-[var(--pf-radius-lg)] border border-pf-line"
              >
                <ImageSlot image={featured.image} />
                <span className="absolute inset-0 bg-pf-ink/0 transition-colors duration-300 group-hover:bg-pf-ink/5" />
              </Link>
            </m.div>

            <m.div variants={fadeUp} className="lg:col-span-5">
              <Tag variant="solid">{featured.sector}</Tag>
              <h3 className="pf-display mt-4 text-3xl leading-tight text-pf-ink md:text-4xl">
                <Link
                  href={`/proyectos/${featured.slug}`}
                  className="underline-offset-4 hover:underline"
                >
                  {featured.title}
                </Link>
              </h3>
              <Narrative project={featured} />
              <ProjectLinks project={featured} />
            </m.div>
          </m.article>
        ) : null}

        {rest.length > 0 ? (
          <m.div
            initial="hidden"
            whileInView="visible"
            viewport={pfViewport}
            variants={stagger(0.12)}
            className="mt-12 grid gap-8 md:grid-cols-2"
          >
            {rest.map((project) => (
              <m.article key={project.id} variants={fadeUp} className="flex flex-col">
                <Link
                  href={`/proyectos/${project.slug}`}
                  aria-label={`Ver el caso: ${project.title}`}
                  className="group relative block overflow-hidden rounded-[var(--pf-radius-lg)] border border-pf-line"
                >
                  <ImageSlot image={project.image} />
                  <span className="absolute inset-0 bg-pf-ink/0 transition-colors duration-300 group-hover:bg-pf-ink/5" />
                </Link>
                <div className="mt-5">
                  <Tag variant="line">{project.sector}</Tag>
                  <h3 className="pf-display mt-3 text-2xl leading-tight text-pf-ink">
                    <Link
                      href={`/proyectos/${project.slug}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {project.title}
                    </Link>
                  </h3>
                  <Narrative project={project} dense />
                  <ProjectLinks project={project} />
                </div>
              </m.article>
            ))}
          </m.div>
        ) : null}

        <m.div
          initial="hidden"
          whileInView="visible"
          viewport={pfViewport}
          variants={fadeUp}
          className="mt-12 border-t border-pf-line pt-8"
        >
          <Link
            href="/proyectos"
            className="group inline-flex items-center gap-2 text-base font-medium text-pf-ink underline-offset-4 hover:underline"
          >
            Ver todos los proyectos
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-300 ease-[var(--pf-ease-out)] group-hover:translate-x-1"
            >
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </Link>
        </m.div>
      </div>
    </section>
  );
}
