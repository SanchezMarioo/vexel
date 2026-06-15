"use client";

import { motion } from "framer-motion";
import { identity } from "@/lib/portfolio/content";
import { clipUp, fadeUp, popIn, stagger } from "@/lib/portfolio/motion";
import Button from "./ui/Button";
import ImageSlot from "./ui/ImageSlot";

export default function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden">
      <div className="pf-container relative grid items-center gap-12 pb-20 pt-16 md:pt-20 lg:grid-cols-12 lg:gap-10 lg:pb-28 lg:pt-24">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger(0.12, 0.05)}
          className="lg:col-span-6"
        >
          <motion.h1
            variants={clipUp}
            className="pf-display text-pf-ink"
            style={{ fontSize: "clamp(2.4rem, 5.2vw, 4.4rem)" }}
          >
            {identity.headline}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="pf-prose mt-6 text-lg leading-relaxed text-pf-ink-soft"
          >
            {identity.subhead}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
            <Button href="#contacto" variant="primary" size="lg" withArrow>
              Cuéntame tu proyecto
            </Button>
            <Button href="#proyectos" variant="outline" size="lg">
              Ver casos reales
            </Button>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-pf-muted"
          >
            <span className="flex items-center gap-2 text-pf-ink-soft">
              <span className="inline-block h-2 w-2 rounded-full bg-pf-violet-700" />
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
          variants={stagger(0.12, 0.35)}
          className="relative lg:col-span-6"
        >
          <motion.div
            variants={fadeUp}
            className="overflow-hidden rounded-[var(--pf-radius-lg)] border border-pf-line bg-pf-surface shadow-[0_1px_0_var(--color-pf-line)]"
          >
            <div className="flex items-center gap-2 border-b border-pf-line px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-pf-line-strong" />
              <span className="h-2.5 w-2.5 rounded-full bg-pf-line-strong" />
              <span className="h-2.5 w-2.5 rounded-full bg-pf-line-strong" />
              <span className="pf-mono ml-3 truncate rounded-[var(--pf-radius-sm)] bg-pf-subtle px-3 py-1 text-xs text-pf-muted">
                grieta.com
              </span>
            </div>
            <ImageSlot
              image={{
                src: "/portfolio/hero-image.webp",
                alt: "Vista de un producto entregado",
                width: 1200,
                height: 820,
              }}
            />
          </motion.div>

          <motion.div
            variants={popIn}
            className="absolute -bottom-4 -left-2 flex items-center gap-2.5 rounded-[var(--pf-radius)] border border-pf-line bg-pf-surface px-4 py-3 shadow-[0_8px_24px_-12px_oklch(0.17_0.013_285_/_0.25)] sm:-left-5"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-pf-violet text-white">
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
