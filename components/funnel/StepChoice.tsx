"use client";

import { useEffect, useRef, useState } from "react";
import { m } from "framer-motion";
import Button from "@/components/portfolio/ui/Button";
import type { ChoiceStep, FunnelOption } from "@/lib/funnel/content";
import { pfEaseOut } from "@/lib/portfolio/motion";

interface StepChoiceProps {
  step: ChoiceStep;
  selected?: string;
  detail?: string;
  onAnswer: (optionId: string, detail?: string) => void;
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5 flex-shrink-0"
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

/**
 * Pregunta de opciones: líneas tipográficas completas separadas por hairlines
 * (sin cards). Elegir avanza; la opción con `needsDetail` despliega un campo
 * de texto antes de avanzar. La opción ya elegida se muestra invertida.
 */
export default function StepChoice({ step, selected, detail, onAnswer }: StepChoiceProps) {
  const detailOption = step.options.find((option) => option.needsDetail);
  const [showDetail, setShowDetail] = useState(
    Boolean(detailOption && selected === detailOption.id),
  );
  const [draft, setDraft] = useState(detail ?? "");
  const [detailError, setDetailError] = useState<string | null>(null);
  const [pendingOption, setPendingOption] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const advanceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (showDetail) textareaRef.current?.focus({ preventScroll: true });
  }, [showDetail]);

  useEffect(() => () => {
    if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
  }, []);

  function choose(option: FunnelOption) {
    if (option.needsDetail) {
      setDetailError(null);
      setShowDetail(true);
      return;
    }
    setShowDetail(false);
    setPendingOption(option.id);
    advanceTimerRef.current = window.setTimeout(() => {
      setPendingOption(null);
      onAnswer(option.id);
    }, 120);
  }

  function confirmDetail() {
    const value = draft.trim();
    if (value.length < 2) {
      setDetailError("Cuéntanoslo en una línea.");
      textareaRef.current?.focus();
      return;
    }
    if (detailOption) onAnswer(detailOption.id, value);
  }

  return (
    <div>
      <h2
        data-autofocus
        tabIndex={-1}
        className="pf-display text-pf-ink-strong outline-none"
        style={{ fontSize: "clamp(1.9rem, 3.8vw, 3rem)" }}
      >
        {step.question}
      </h2>

      {step.why ? (
        <p className="mt-3 max-w-prose text-base leading-relaxed text-pf-ink-soft">{step.why}</p>
      ) : null}

      <div className="mt-8 border-t border-pf-line" role="group" aria-label={step.question}>
        {step.options.map((option) => {
          const isSelected =
            (selected === option.id || pendingOption === option.id) &&
            (!option.needsDetail || !showDetail);
            return (
            <button
              key={option.id}
              type="button"
              onClick={() => choose(option)}
              disabled={pendingOption !== null}
              aria-pressed={isSelected}
              className={`flex w-full items-center justify-between gap-4 border-b border-pf-line px-2 py-5 text-left text-lg font-medium leading-snug transition-colors duration-150 ease-[var(--pf-ease-quart)] ${
                isSelected
                  ? "bg-pf-ink text-pf-bg"
                  : "text-pf-ink hover:bg-pf-ink hover:text-pf-bg"
              }`}
            >
              <span>{option.label}</span>
              {isSelected ? <CheckIcon /> : null}
            </button>
          );
        })}
      </div>

      {showDetail && detailOption ? (
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: pfEaseOut }}
          className="mt-7"
        >
          <label htmlFor={`funnel-${step.id}-detalle`} className="sr-only">
            Cuéntanoslo en una línea
          </label>
          <textarea
            id={`funnel-${step.id}-detalle`}
            ref={textareaRef}
            rows={3}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                confirmDetail();
              }
            }}
            placeholder="Cuéntanoslo en una línea."
            aria-invalid={detailError ? true : undefined}
            aria-describedby={detailError ? `funnel-${step.id}-detalle-error` : undefined}
            className="w-full resize-none border-b border-pf-line-strong bg-transparent py-3 text-lg text-pf-ink outline-none transition-colors placeholder:text-pf-muted focus:border-pf-ink"
          />
          {detailError ? (
            <p
              id={`funnel-${step.id}-detalle-error`}
              role="alert"
              className="mt-2 text-sm text-pf-danger"
            >
              {detailError}
            </p>
          ) : null}
          <div className="mt-5">
            <Button type="button" variant="primary" onClick={confirmDetail} withArrow>
              Continuar
            </Button>
          </div>
        </m.div>
      ) : null}
    </div>
  );
}
