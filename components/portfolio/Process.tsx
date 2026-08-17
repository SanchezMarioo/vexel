"use client";

import { m } from "framer-motion";
import { processSteps } from "@/lib/portfolio/content";
import { fadeUp, pfDurations, pfEaseOut, pfViewport, stagger } from "@/lib/portfolio/motion";

export default function Process() {
  return (
    <section id="proceso" className="scroll-mt-20 border-t border-pf-line py-24 md:py-32">
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
            Cómo trabajamos juntos
          </h2>
          <p className="pf-prose mt-5 text-lg text-pf-ink-soft">
            Un proceso sin sorpresas: en todo momento sabes qué tienes que hacer tú, de
            qué me encargo yo y cuándo ves resultados.
          </p>
        </m.div>

        <m.ol
          initial="hidden"
          whileInView="visible"
          viewport={pfViewport}
          variants={stagger(0.14)}
          className="relative mt-16 grid gap-x-8 gap-y-12 md:grid-cols-4"
        >
          <m.span
            aria-hidden="true"
            className="absolute left-0 right-0 top-5 hidden h-px origin-left bg-pf-line-strong md:block"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={pfViewport}
            transition={{ duration: pfDurations.slow, ease: pfEaseOut }}
          />

          {processSteps.map((step, index) => (
            <m.li key={step.title} variants={fadeUp} className="group relative">
              <span className="pf-mono relative z-10 grid h-10 w-10 place-items-center rounded-full bg-pf-ink text-sm font-medium text-pf-bg shadow-[0_4px_12px_-2px_oklch(0_0_0/0.25)] transition-transform duration-200 ease-[var(--pf-ease-quart)] group-hover:scale-110 motion-reduce:group-hover:scale-100">
                {index + 1}
              </span>
              <h3 className="pf-display mt-5 text-xl text-pf-ink transition-colors group-hover:text-pf-ink-strong">{step.title}</h3>

              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="pf-mono text-xs uppercase tracking-wide text-pf-ink">Tú</dt>
                  <dd className="mt-1 text-pf-ink-soft leading-relaxed">{step.you}</dd>
                </div>
                <div>
                  <dt className="pf-mono text-xs uppercase tracking-wide text-pf-muted">Yo</dt>
                  <dd className="mt-1 text-pf-ink-soft leading-relaxed">{step.me}</dd>
                </div>
                <div>
                  <dt className="pf-mono text-xs uppercase tracking-wide text-pf-muted">Cuándo</dt>
                  <dd className="mt-1 text-pf-ink font-medium">{step.when}</dd>
                </div>
              </dl>
            </m.li>
          ))}
        </m.ol>
      </div>
    </section>
  );
}
