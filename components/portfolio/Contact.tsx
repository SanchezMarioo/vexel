"use client";

import { m } from "framer-motion";
import { identity } from "@/lib/portfolio/content";
import { fadeUp, pfViewport, stagger } from "@/lib/portfolio/motion";
import Button from "./ui/Button";
import CalButton from "./ui/CalButton";
import ContactFormLazy from "./ContactFormLazy";

export default function Contact() {
  return (
    <section id="contacto" className="scroll-mt-20 border-t border-pf-line py-24 md:py-32">
      <div className="pf-container grid gap-12 lg:grid-cols-12 lg:gap-8">
        {/* Left: invitación + alternativas directas */}
        <m.div
          initial="hidden"
          whileInView="visible"
          viewport={pfViewport}
          variants={stagger(0.1)}
          className="lg:col-span-5"
        >
          <m.h2
            variants={fadeUp}
            className="pf-display text-pf-ink-strong"
            style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)" }}
          >
            Cuéntanos qué quieres construir.
          </m.h2>
          <m.p variants={fadeUp} className="pf-prose mt-5 text-lg text-pf-ink-soft">
            Escríbenos en dos líneas qué necesitas. {identity.responseTime.toLowerCase()},
            sin compromiso y sin tecnicismos.
          </m.p>

          <m.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <Button
              href="/empezar"
              variant="solid"
              withArrow
              aria-label="Cuéntanos tu proyecto para empezar"
            >
              Cuéntanos tu proyecto
            </Button>
            <CalButton calLink={identity.calUrl} variant="outline">
              Agendar una llamada
            </CalButton>
          </m.div>

          <m.p variants={fadeUp} className="mt-4 text-sm text-pf-muted">
            Dos minutos, una pregunta cada vez. O usa el formulario si ya lo tienes claro.
          </m.p>

          <m.p variants={fadeUp} className="mt-6 text-sm text-pf-muted">
            ¿Prefieres el correo directo?{" "}
            <a
              href={`mailto:${identity.email}`}
              className="text-pf-ink underline-offset-4 hover:underline"
            >
              {identity.email}
            </a>
          </m.p>
        </m.div>

        {/* Right: formulario corto — chunk diferido (ver ContactFormLazy). */}
        <m.div
          initial="hidden"
          whileInView="visible"
          viewport={pfViewport}
          variants={fadeUp}
          className="lg:col-span-6 lg:col-start-7"
        >
          <ContactFormLazy />
        </m.div>
      </div>
    </section>
  );
}
