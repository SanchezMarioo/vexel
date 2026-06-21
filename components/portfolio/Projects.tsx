"use client";

import { motion } from "framer-motion";
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

function LiveLink({ project }: { project: Project }) {
  if (!isRealUrl(project.liveUrl)) return null;
  return (
    <a
      href={project.liveUrl}
      target="_blank"
      rel="noreferrer noopener"
      className="group/link mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-pf-ink underline-offset-4 hover:underline"
    >
      Ver en vivo
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-4 w-4 transition-transform duration-300 ease-[var(--pf-ease-out)] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
      >
        <path d="M7 17 17 7M8 7h9v9" />
      </svg>
    </a>
  );
}

export default function Projects() {
  return (
    <section id="proyectos" className="scroll-mt-20 border-t border-pf-line py-24 md:py-32">
      <div className="pf-container">
        <motion.div
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
        </motion.div>

        {featured ? (
          <motion.article
            initial="hidden"
            whileInView="visible"
            viewport={pfViewport}
            variants={stagger(0.12)}
            className="mt-14 grid gap-8 lg:grid-cols-12 lg:items-center"
          >
            <motion.a
              variants={maskReveal}
              href={isRealUrl(featured.liveUrl) ? featured.liveUrl : "#proyectos"}
              target={isRealUrl(featured.liveUrl) ? "_blank" : undefined}
              rel={isRealUrl(featured.liveUrl) ? "noreferrer noopener" : undefined}
              className="group relative block overflow-hidden rounded-[var(--pf-radius-lg)] border border-pf-line lg:col-span-7"
            >
              <ImageSlot image={featured.image} />
              <span className="absolute inset-0 bg-pf-ink/0 transition-colors duration-300 group-hover:bg-pf-ink/5" />
            </motion.a>

            <motion.div variants={fadeUp} className="lg:col-span-5">
              <Tag variant="solid">{featured.sector}</Tag>
              <h3 className="pf-display mt-4 text-3xl leading-tight text-pf-ink md:text-4xl">
                {featured.title}
              </h3>
              <Narrative project={featured} />
              <LiveLink project={featured} />
            </motion.div>
          </motion.article>
        ) : null}

        {rest.length > 0 ? (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={pfViewport}
            variants={stagger(0.12)}
            className="mt-12 grid gap-8 md:grid-cols-2"
          >
            {rest.map((project) => (
              <motion.article key={project.id} variants={fadeUp} className="flex flex-col">
                <a
                  href={isRealUrl(project.liveUrl) ? project.liveUrl : "#proyectos"}
                  target={isRealUrl(project.liveUrl) ? "_blank" : undefined}
                  rel={isRealUrl(project.liveUrl) ? "noreferrer noopener" : undefined}
                  className="group relative block overflow-hidden rounded-[var(--pf-radius-lg)] border border-pf-line"
                >
                  <ImageSlot image={project.image} />
                  <span className="absolute inset-0 bg-pf-ink/0 transition-colors duration-300 group-hover:bg-pf-ink/5" />
                </a>
                <div className="mt-5">
                  <Tag variant="line">{project.sector}</Tag>
                  <h3 className="pf-display mt-3 text-2xl leading-tight text-pf-ink">
                    {project.title}
                  </h3>
                  <Narrative project={project} dense />
                  <LiveLink project={project} />
                </div>
              </motion.article>
            ))}
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
