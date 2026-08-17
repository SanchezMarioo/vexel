"use client";

import { m } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import CalButton from "@/components/portfolio/ui/CalButton";
import { answerLabel, steps, type FunnelAnswers, type StepId } from "@/lib/funnel/content";
import { trackFunnelEvent } from "@/lib/funnel/tracking";
import { identity } from "@/lib/portfolio/content";
import { fadeUp, pfEaseOut, stagger } from "@/lib/portfolio/motion";

interface SummaryProps {
  answers: FunnelAnswers;
  stepIds: StepId[];
  onEdit: (stepId: StepId) => void;
}

/**
 * Cierre del funnel: pantalla invertida (negro) — el único evento de color de
 * todo el flujo marca el cambio de estado: la conversación terminó, ahora toca
 * decidir. Confirma la recepción, muestra el resumen editable y ofrece la
 * llamada de 20 minutos como acelerador, nunca como obligación.
 */
export default function Summary({ answers, stepIds, onEdit }: SummaryProps) {
  const [deferred, setDeferred] = useState(false);
  const [booked, setBooked] = useState(false);

  // Reserva REAL confirmada en Cal.com (evento del embed, no un simple clic).
  useEffect(() => {
    const onBooked = () => {
      setBooked(true);
      trackFunnelEvent("meeting_booked");
    };
    window.addEventListener("cal:booking-successful", onBooked);
    return () => window.removeEventListener("cal:booking-successful", onBooked);
  }, []);

  return (
    <m.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: pfEaseOut }}
      className="pf-invert flex-1"
    >
      <div className="mx-auto w-full max-w-[44rem] px-6 py-20 md:py-28">
        <m.div initial="hidden" animate="visible" variants={stagger(0.09)}>
          {/* Badge de confirmación con check dibujado animado */}
          <m.div variants={fadeUp} className="flex items-center gap-3.5">
            <m.span
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: pfEaseOut }}
              className="relative grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-pf-inverse-ink text-pf-inverse-bg shadow-[0_0_20px_rgba(255,255,255,0.25)]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="h-5 w-5"
              >
                <m.path
                  d="m5 13 4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.45, ease: pfEaseOut, delay: 0.15 }}
                />
              </svg>
            </m.span>
            <p className="text-base text-pf-inverse-ink/90 sm:text-lg">
              Hemos recibido tu proyecto. {identity.responseTime.toLowerCase()} a{" "}
              <span className="font-semibold text-pf-inverse-ink underline decoration-pf-inverse-ink/30 underline-offset-4">
                {answers.email}
              </span>
              .
            </p>
          </m.div>

          <m.h2
            variants={fadeUp}
            className="pf-display mt-10 text-pf-inverse-ink"
            style={{ fontSize: "clamp(2rem, 4.6vw, 3.4rem)" }}
          >
            Esto es lo que nos has contado.
          </m.h2>

          <m.p
            variants={fadeUp}
            className="pf-mono mt-4 text-xs uppercase tracking-wide text-pf-inverse-ink/50"
          >
            Toca cualquier respuesta para cambiarla
          </m.p>

          <m.div variants={fadeUp} className="mt-7 border-t border-pf-inverse-ink/15">
            {stepIds.map((stepId) => (
              <button
                key={stepId}
                type="button"
                onClick={() => onEdit(stepId)}
                aria-label={`Editar respuesta: ${steps[stepId].record}`}
                className="group flex w-full cursor-pointer items-center justify-between border-b border-pf-inverse-ink/15 px-2 py-4 text-left transition-all duration-200 hover:bg-pf-inverse-ink/5 hover:pl-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pf-inverse-ink"
              >
                <div className="flex flex-col gap-1 pr-4">
                  <span className="pf-mono text-xs uppercase tracking-wide text-pf-inverse-ink/50">
                    {steps[stepId].record}
                  </span>
                  <span className="text-lg font-medium leading-snug text-pf-inverse-ink underline-offset-4 group-hover:underline">
                    {answerLabel(stepId, answers)}
                  </span>
                </div>
                <span className="pf-mono text-xs text-pf-inverse-ink/40 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                  Editar →
                </span>
              </button>
            ))}
          </m.div>

          <m.div
            variants={fadeUp}
            className="mt-14 rounded-[var(--pf-radius-lg)] border border-pf-inverse-ink/20 bg-pf-inverse-ink/[0.03] p-6 sm:p-8"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-pf-inverse-ink/60 pf-mono">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Paso opcional
            </div>
            <h3
              className="pf-display mt-3 text-pf-inverse-ink"
              style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.4rem)" }}
            >
              ¿Quieres acelerar el proceso?
            </h3>
            <p className="mt-4 max-w-prose text-lg leading-relaxed text-pf-inverse-ink/80">
              Puedes reservar una llamada de 20 minutos con {identity.name}. No necesitas
              preparar nada: hablaremos de tu proyecto, tus objetivos y los próximos pasos.
            </p>

            {booked ? (
              <div className="mt-8 flex items-center gap-3 rounded-[var(--pf-radius)] border border-pf-inverse-ink/30 bg-pf-inverse-ink/10 p-4">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="h-5 w-5 text-emerald-400"
                  aria-hidden="true"
                >
                  <path d="m5 13 4 4L19 7" />
                </svg>
                <p className="pf-mono text-sm uppercase tracking-wide text-pf-inverse-ink">
                  Reserva confirmada. Te enviamos los detalles a tu email.
                </p>
              </div>
            ) : deferred ? (
              <p className="mt-8 max-w-prose text-lg leading-relaxed text-pf-inverse-ink/80">
                Perfecto. Te escribimos a{" "}
                <span className="font-medium text-pf-inverse-ink">{answers.email}</span> con los siguientes pasos.
              </p>
            ) : (
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <CalButton
                  calLink={identity.calUrl}
                  variant="inverse-primary"
                  size="lg"
                  withArrow
                  prefill={{ name: answers.nombre, email: answers.email }}
                  onOpen={() => trackFunnelEvent("calendly_click")}
                >
                  Reservar una llamada de 20 minutos
                </CalButton>
                <button
                  type="button"
                  onClick={() => setDeferred(true)}
                  className="cursor-pointer text-sm text-pf-inverse-ink/70 underline-offset-4 transition-colors hover:text-pf-inverse-ink hover:underline"
                >
                  Prefiero esperar al email
                </button>
              </div>
            )}
          </m.div>

          <m.p variants={fadeUp} className="mt-12 text-sm text-pf-inverse-ink/45">
            Tus datos solo se usan para responderte.{" "}
            <Link
              href="/privacidad"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-pf-inverse-ink"
            >
              Política de privacidad
            </Link>
            .
          </m.p>
        </m.div>
      </div>
    </m.section>
  );
}
