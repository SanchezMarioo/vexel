"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Project, ProjectImage } from "@/lib/portfolio/content";
import { isRealUrl } from "@/lib/portfolio/content";
import {
  fadeUp,
  heroLcpSafe,
  maskReveal,
  pfViewport,
  stagger,
} from "@/lib/portfolio/motion";
import Button from "./ui/Button";
import ImageSlot from "./ui/ImageSlot";

interface ProjectDetailProps {
  project: Project;
  prev: Project;
  next: Project;
}

/** Construye la imagen de una captura con alt cargado de keywords del sector. */
function captureImage(project: Project, src: string, index: number): ProjectImage {
  return {
    src,
    alt: `${project.title} — ${project.sector} en Salamanca por Xync, captura ${index + 1}`,
    width: 1600,
    height: 1000,
  };
}

export default function ProjectDetail({ project, prev, next }: ProjectDetailProps) {
  const hasLive = isRealUrl(project.liveUrl);

  return (
    <div className="pf-container pb-24 pt-10 md:pb-32 md:pt-14">
      {/* Migas */}
      <motion.nav
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
        <Link href="/proyectos" className="transition-colors hover:text-pf-ink">
          Proyectos
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-pf-ink-soft">{project.sector}</span>
      </motion.nav>

      {/* 1 · HERO */}
      <motion.header
        initial="hidden"
        animate="visible"
        variants={stagger(0.1, 0.03)}
        className="mt-6"
      >
        <motion.h1
          variants={heroLcpSafe}
          className="pf-display text-pf-ink-strong"
          style={{ fontSize: "clamp(2.4rem, 6vw, 4.75rem)" }}
        >
          {project.title}
        </motion.h1>
        <motion.div
          variants={fadeUp}
          className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2"
        >
          <p className="text-lg text-pf-ink-soft">{project.sector}</p>
          {hasLive ? (
            <>
              <span aria-hidden="true" className="text-pf-line-strong">·</span>
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="group inline-flex items-center gap-1.5 text-lg font-medium text-pf-ink underline-offset-4 hover:underline"
              >
                Ver en vivo
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4 transition-transform duration-300 ease-[var(--pf-ease-out)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </a>
            </>
          ) : null}
        </motion.div>

        <motion.div
          variants={heroLcpSafe}
          className="mt-10 overflow-hidden rounded-[var(--pf-radius-lg)] border border-pf-line md:mt-12"
        >
          <ImageSlot image={project.image} priority />
        </motion.div>
      </motion.header>

      {/* 2 · RESUMEN — El problema · Lo que construimos · El resultado.
          Tres columnas en fila (desktop) / apiladas (móvil). El resultado no es
          una card aparte: comparte patrón pero se destaca por peso, tamaño y una
          tinta más fuerte, porque es el dato que más le importa al cliente. */}
      <section aria-label="Resumen del proyecto" className="mt-20 md:mt-28">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={pfViewport}
          variants={stagger(0.12)}
          className="grid gap-x-12 gap-y-10 md:grid-cols-3"
        >
          <motion.div variants={fadeUp}>
            <p className="pf-mono text-xs text-pf-muted">El problema</p>
            <p className="mt-3 text-base leading-relaxed text-pf-ink-soft">
              {project.problem}
            </p>
          </motion.div>
          <motion.div variants={fadeUp}>
            <p className="pf-mono text-xs text-pf-muted">Lo que construimos</p>
            <p className="mt-3 text-base leading-relaxed text-pf-ink-soft">
              {project.built}
            </p>
          </motion.div>
          <motion.div variants={fadeUp}>
            <p className="pf-mono text-xs text-pf-ink">El resultado</p>
            <p className="mt-3 text-base leading-relaxed text-pf-ink-soft">
              {project.result}
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* 3 · CAPTURAS */}
      {project.images.length > 0 ? (
        <section aria-label="Capturas del proyecto" className="mt-24 md:mt-32">
          <h2 className="pf-display text-2xl text-pf-ink md:text-3xl">Por dentro</h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={pfViewport}
            variants={stagger(0.12)}
            className="mt-8 grid gap-4 sm:grid-cols-2"
          >
            {project.images.map((src, index) => (
              <motion.div
                key={src}
                variants={maskReveal}
                className="overflow-hidden rounded-[var(--pf-radius-lg)] border border-pf-line"
              >
                <ImageSlot image={captureImage(project, src, index)} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      ) : null}

      {/* 4 · STACK — tratamiento tipográfico, sin fila de logos */}
      <section aria-label="Tecnologías utilizadas" className="mt-20 md:mt-28">
        <h2 className="pf-display text-2xl text-pf-ink md:text-3xl">
          Con qué está construido
        </h2>
        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={pfViewport}
          variants={fadeUp}
          className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3"
        >
          {project.stack.map((tech, index) => (
            <li key={tech} className="flex items-center gap-5">
              {index > 0 ? (
                <span aria-hidden="true" className="text-pf-line-strong">·</span>
              ) : null}
              <span className="text-xl font-medium text-pf-ink md:text-2xl">{tech}</span>
            </li>
          ))}
        </motion.ul>
      </section>

      {/* 5 · CTA */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={pfViewport}
        variants={fadeUp}
        aria-label="Contacto"
        className="mt-24 border-t border-pf-line pt-14 md:mt-32"
      >
        <h2 className="pf-display text-3xl text-pf-ink-strong md:text-4xl" style={{ textWrap: "balance" }}>
          ¿Tienes un proyecto similar?
        </h2>
        <p className="pf-prose mt-4 text-lg text-pf-ink-soft">
          Cuéntanos qué necesitas y te decimos con franqueza si podemos ayudarte, con
          precio y plazo cerrados antes de empezar.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button href="/#contacto" variant="primary" size="lg" withArrow>
            Cuéntanos tu proyecto
          </Button>
          <Button href="/proyectos" variant="outline" size="lg">
            Ver todos los proyectos
          </Button>
        </div>
      </motion.section>

      {/* 6 · NAVEGACIÓN anterior / siguiente */}
      <nav
        aria-label="Más proyectos"
        className="mt-20 grid grid-cols-1 gap-px overflow-hidden rounded-[var(--pf-radius-lg)] border border-pf-line sm:grid-cols-2"
      >
        <Link
          href={`/proyectos/${prev.slug}`}
          className="group bg-pf-bg p-6 transition-colors duration-300 hover:bg-pf-surface md:p-8"
        >
          <span className="pf-mono flex items-center gap-2 text-xs text-pf-muted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4 transition-transform duration-300 ease-[var(--pf-ease-out)] group-hover:-translate-x-1">
              <path d="M19 12H5m6 6-6-6 6-6" />
            </svg>
            Anterior
          </span>
          <span className="pf-display mt-2 block text-lg text-pf-ink md:text-xl">
            {prev.title}
          </span>
        </Link>
        <Link
          href={`/proyectos/${next.slug}`}
          className="group bg-pf-bg p-6 text-right transition-colors duration-300 hover:bg-pf-surface sm:border-l sm:border-pf-line md:p-8"
        >
          <span className="pf-mono flex items-center justify-end gap-2 text-xs text-pf-muted">
            Siguiente
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4 transition-transform duration-300 ease-[var(--pf-ease-out)] group-hover:translate-x-1">
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </span>
          <span className="pf-display mt-2 block text-lg text-pf-ink md:text-xl">
            {next.title}
          </span>
        </Link>
      </nav>
    </div>
  );
}
