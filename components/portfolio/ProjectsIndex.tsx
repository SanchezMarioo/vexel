"use client";

import { m } from "framer-motion";
import Link from "next/link";
import type { Project } from "@/lib/portfolio/content";
import { projects } from "@/lib/portfolio/content";
import { fadeUp, heroLcpSafe, pfViewport } from "@/lib/portfolio/motion";
import Button from "./ui/Button";
import ImageSlot from "./ui/ImageSlot";

/** Primera frase del problema — línea escaneable, sin párrafo entero. */
function leadProblem(problem: string): string {
  const [first] = problem.split(/(?<=\.)\s/);
  return first ?? problem;
}

function IndexRow({ project, priority = false }: { project: Project; priority?: boolean }) {
  return (
    <m.li
      initial="hidden"
      whileInView="visible"
      viewport={pfViewport}
      variants={fadeUp}
      className="relative border-t border-pf-line last:border-b"
    >
      <Link
        href={`/proyectos/${project.slug}`}
        className="group block py-7 transition-colors duration-300 ease-[var(--pf-ease-out)] hover:bg-pf-surface/60 md:py-9 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_clamp(11rem,16vw,15rem)] lg:items-center lg:gap-8"
      >
        {/* Nombre + sector */}
        <div className="lg:pr-4">
          <h2 className="pf-display text-pf-ink transition-transform duration-300 ease-[var(--pf-ease-out)] group-hover:translate-x-1 group-hover:text-pf-ink-strong" style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.5rem)" }}>
            {project.title}
          </h2>
          <p className="pf-mono mt-2 text-xs text-pf-muted">{project.sector}</p>
        </div>

        {/* Problema → resultado (el resultado, más prominente) */}
        <div className="mt-4 lg:mt-0">
          <p className="text-sm leading-relaxed text-pf-ink-soft">
            {leadProblem(project.problem)}
          </p>
          <p className="mt-2.5 flex gap-2 text-[0.95rem] font-medium leading-snug text-pf-ink">
            <span aria-hidden="true" className="select-none text-pf-muted">
              →
            </span>
            <span>{project.result}</span>
          </p>
        </div>

        {/* Preview: en línea en móvil (siempre visible), flotante al hover en desktop */}
        <div className="mt-5 lg:pointer-events-none lg:absolute lg:right-0 lg:top-1/2 lg:mt-0 lg:w-[clamp(11rem,16vw,15rem)] lg:-translate-y-1/2">
          <div className="overflow-hidden rounded-[var(--pf-radius)] border border-pf-line lg:translate-x-3 lg:scale-95 lg:border-0 lg:opacity-0 lg:shadow-[0_18px_40px_-22px_oklch(0_0_0/0.45)] lg:transition lg:duration-500 lg:ease-[var(--pf-ease-out)] lg:will-change-transform lg:group-hover:translate-x-0 lg:group-hover:scale-100 lg:group-hover:opacity-100">
            <ImageSlot
              image={project.image}
              priority={priority}
              sizes="(min-width: 1024px) 240px, (min-width: 640px) 50vw, 100vw"
            />
          </div>
        </div>

        {/* Afordancia móvil (en desktop se usa la flecha de esquina) */}
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-pf-ink lg:hidden">
          Ver el caso
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4">
            <path d="M5 12h14m-6-6 6 6-6 6" />
          </svg>
        </span>
      </Link>

      {/* Flecha de esquina (desktop): siempre visible, se desplaza al hover */}
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

export default function ProjectsIndex() {
  return (
    <div className="pf-container py-20 md:py-28">
      {/* Masthead */}
      <m.div
        initial={false}
        animate="visible"
        className="max-w-4xl"
      >
        <m.h1
          variants={heroLcpSafe}
          className="pf-display text-pf-ink-strong"
          style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)" }}
        >
          Casos reales que ya están funcionando
        </m.h1>
        <m.p
          variants={fadeUp}
          className="pf-prose mt-6 text-lg leading-relaxed text-pf-ink-soft"
        >
          Cada proyecto empezó como un problema de negocio concreto. Aquí tienes qué
          construimos y qué cambió después — para que veas de un vistazo si el tuyo se
          parece.
        </m.p>
      </m.div>

      {/* Índice */}
      <ul className="mt-14 md:mt-20">
        {projects.map((project, index) => (
          <IndexRow key={project.slug} project={project} priority={index === 0} />
        ))}
      </ul>

      {/* Cierre */}
      <m.div
        initial="hidden"
        whileInView="visible"
        viewport={pfViewport}
        variants={fadeUp}
        className="mt-16 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="pf-prose text-lg text-pf-ink-soft">
          ¿No ves tu caso aquí? Seguramente ya hemos resuelto algo parecido.
        </p>
        <Button href="/#contacto" variant="primary" size="lg" withArrow>
          Cuéntanos tu proyecto
        </Button>
      </m.div>
    </div>
  );
}
