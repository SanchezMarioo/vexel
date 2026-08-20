"use client";

import { m } from "framer-motion";
import { answerLabel, steps, type FunnelAnswers, type StepId } from "@/lib/funnel/content";
import { pfEaseOut } from "@/lib/portfolio/motion";

interface TranscriptProps {
  stepIds: StepId[];
  answers: FunnelAnswers;
  onEdit: (stepId: StepId) => void;
}

/**
 * El registro: lo ya respondido queda visible y editable. Es la memoria de la
 * conversación y la única señal de progreso (no hay barra). Cada fila se
 * pliega hacia arriba al responder (layout) y toca volver a ese punto.
 */
export default function Transcript({ stepIds, answers, onEdit }: TranscriptProps) {
  const visibleStepIds = stepIds.filter((stepId) =>
    Boolean(answerLabel(stepId, answers).trim()),
  );
  if (visibleStepIds.length === 0) return null;

  return (
    <div className="border-t border-pf-line">
      {visibleStepIds.map((stepId) => (
        <m.div
          key={stepId}
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: pfEaseOut }}
        >
          <button
            type="button"
            onClick={() => onEdit(stepId)}
            aria-label={`Editar respuesta: ${steps[stepId].record}`}
            className="group flex w-full cursor-pointer items-center justify-between border-b border-pf-line px-2 py-4 text-left transition-[background-color,padding] duration-200 hover:bg-pf-surface hover:pl-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pf-ink"
          >
            <div className="flex flex-col gap-1 pr-4">
              <span className="pf-mono text-xs uppercase tracking-wide text-pf-muted">
                {steps[stepId].record}
              </span>
              <span className="text-lg font-medium leading-snug text-pf-ink underline-offset-4 group-hover:underline">
                {answerLabel(stepId, answers)}
              </span>
            </div>
            <span className="pf-mono text-xs text-pf-muted opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100">
              Editar →
            </span>
          </button>
        </m.div>
      ))}
    </div>
  );
}
