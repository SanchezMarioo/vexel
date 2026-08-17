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
 * llamada de 20 minutos como acelerador, nunca como obligación ("Prefiero
 * esperar" es una respuesta válida con salida elegante).
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
      className="pf-invert"
    >
      <div className="mx-auto w-full max-w-[44rem] px-6 py-20 md:py-28">
        <m.div initial="hidden" animate="visible" variants={stagger(0.09)}>
          <m.div variants={fadeUp} className="flex items-center gap-3">
            <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-pf-inverse-ink text-pf-inverse-bg">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="h-5 w-5"
              >
                <path d="m5 13 4 4L19 7" />
              </svg>
            </span>
            <p className="text-pf-inverse-ink">
              Hemos recibido tu proyecto. {identity.responseTime.toLowerCase()} a{" "}
              <span className="font-medium">{answers.email}</span>.
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
                className="group flex w-full flex-col gap-1 border-b border-pf-inverse-ink/15 px-1 py-4 text-left"
              >
                <span className="pf-mono text-xs uppercase tracking-wide text-pf-inverse-ink/50">
                  {steps[stepId].record}
                </span>
                <span className="text-lg font-medium leading-snug text-pf-inverse-ink underline-offset-4 group-hover:underline">
                  {answerLabel(stepId, answers)}
                </span>
              </button>
            ))}
          </m.div>

          <m.div variants={fadeUp} className="mt-12">
            <h3 className="pf-display text-pf-inverse-ink" style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.4rem)" }}>
              ¿Quieres acelerar el proceso?
            </h3>
            <p className="mt-4 max-w-prose text-lg leading-relaxed text-pf-inverse-ink/80">
              Puedes reservar una llamada de 20 minutos con {identity.name}. No necesitas
              preparar nada: hablaremos de tu proyecto, tus objetivos y los próximos pasos.
            </p>

            {booked ? (
              <p className="pf-mono mt-8 text-sm uppercase tracking-wide text-pf-inverse-ink">
                Reserva confirmada. Te enviamos los detalles a tu email.
              </p>
            ) : deferred ? (
              <p className="mt-8 max-w-prose text-lg leading-relaxed text-pf-inverse-ink/80">
                Perfecto. Te escribimos a{" "}
                <span className="font-medium">{answers.email}</span> con los siguientes pasos.
              </p>
            ) : (
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
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
                  className="text-pf-inverse-ink/70 underline-offset-4 transition-colors hover:text-pf-inverse-ink hover:underline"
                >
                  Prefiero esperar
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
