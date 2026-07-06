"use client";

import { m } from "framer-motion";
import { services } from "@/lib/portfolio/content";
import { fadeUp, pfViewport, stagger } from "@/lib/portfolio/motion";

export default function Services() {
  return (
    <section id="servicios" className="scroll-mt-20 border-t border-pf-line py-24 md:py-32">
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
            ¿Qué necesitas desarrollar o mejorar en tu web?
          </h2>
          <p className="pf-prose mt-5 text-lg text-pf-ink-soft">
            Tres formas de quitarte un problema de encima. Sin tecnicismos: esto es lo
            que consigues y para quién es.
          </p>
        </m.div>

        <m.ul
          initial="hidden"
          whileInView="visible"
          viewport={pfViewport}
          variants={stagger(0.1)}
          className="mt-14 border-t border-pf-line"
        >
          {services.map((service) => (
            <m.li
              key={service.id}
              variants={fadeUp}
              className="group grid gap-5 border-b border-pf-line py-9 md:grid-cols-12 md:gap-8"
            >
              <div className="md:col-span-5">
                <h3 className="pf-display text-2xl leading-tight text-pf-ink md:text-[1.7rem]">
                  {service.title}
                </h3>
                <p className="pf-mono mt-3 text-xs uppercase tracking-wide text-pf-muted">
                  {service.audience}
                </p>
              </div>

              <div className="md:col-span-7">
                <p className="text-pf-ink-soft md:max-w-xl">{service.description}</p>
                <p className="mt-5 flex items-start gap-3 text-pf-ink">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 flex-shrink-0 bg-pf-ink"
                  />
                  <span>
                    <span className="pf-mono text-xs uppercase tracking-wide text-pf-muted">
                      Resultado&nbsp;·&nbsp;
                    </span>
                    {service.result}
                  </span>
                </p>
              </div>
            </m.li>
          ))}
        </m.ul>
      </div>
    </section>
  );
}
