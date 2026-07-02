"use client";

import { motion } from "framer-motion";
import { identity } from "@/lib/portfolio/content";
import { fadeUp, heroLcpSafe, popIn, stagger } from "@/lib/portfolio/motion";
import Button from "./ui/Button";
import ImageSlot from "./ui/ImageSlot";
import Link from "next/link";

export default function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-pf-bg">
      <div className="pf-container relative grid items-center gap-12 pb-20 pt-16 md:pt-20 lg:grid-cols-12 lg:gap-10 lg:pb-28 lg:pt-24">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger(0.12, 0.05)}
          className="lg:col-span-6"
        >
          <motion.h1
            variants={heroLcpSafe}
            className="pf-display text-pf-ink-strong"
            style={{ fontSize: "clamp(2.4rem, 5.2vw, 4.4rem)" }}
          >
            {identity.headline}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="pf-prose mt-6 text-lg leading-relaxed text-pf-ink"
          >
            {identity.subhead}
          </motion.p>

          <motion.p variants={fadeUp} className="mt-4 text-base text-pf-ink-soft">
            Xync es un estudio de desarrollo y diseño web freelance en{" "}
            {identity.location}. Trabajamos para toda España y Latinoamérica en
            remoto.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
            <Button href="#contacto" variant="solid" size="lg" withArrow>
              Cuéntanos tu proyecto
            </Button>
            <Button href="#proyectos" variant="outline" size="lg">
              Ver casos reales
            </Button>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-pf-muted"
          >
            <span className="flex items-center gap-2 text-pf-muted">
              <span className="inline-block h-2 w-2 rounded-full bg-pf-ink-strong" />
              {identity.availability}
            </span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span>{identity.responseTime}</span>
          </motion.p>
        </motion.div>

        {/* Visual: el resultado que entrego, no el código. */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger(0.12, 0.1)}
          className="relative lg:col-span-6"
        >
          <motion.div
            variants={heroLcpSafe}
            className="overflow-hidden rounded-[var(--pf-radius-lg)] border border-pf-line bg-pf-surface"
          >
            <div className="flex items-center gap-2 border-b border-pf-line bg-[oklch(0.93_0_0)] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.75_0_0)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.75_0_0)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.75_0_0)]" />
              <Link href="https://lumen.xync.es/" className="pf-mono ml-3 truncate rounded-[var(--pf-radius-sm)] bg-pf-subtle px-3 py-1 text-xs text-pf-muted">
                lumen.xync.es
              </Link>
            </div>
            <ImageSlot
              priority
              image={{
                src: "/portfolio/hero-images.webp",
                alt: "Tienda online de muebles Lumen, desarrollada por Xync, estudio de desarrollo web en Salamanca",
                width: 1200,
                height: 820,
              }}
            />
          </motion.div>

          <motion.div
            variants={popIn}
            className="absolute -bottom-4 -left-2 flex items-center gap-2.5 rounded-[var(--pf-radius)] border border-pf-line bg-pf-bg px-4 py-3 shadow-[0_8px_24px_-12px_oklch(0_0_0_/_0.35)] sm:-left-5"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-pf-ink text-pf-bg">
              <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg>
            </span>
            <span className="text-sm font-medium text-pf-ink">
              Precio y plazo cerrados antes de empezar
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
