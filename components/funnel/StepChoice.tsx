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
    <m.span
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, ease: pfEaseOut }}
      className="grid h-6 w-6 place-items-center rounded-full bg-pf-bg text-pf-ink"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-3.5 w-3.5"
      >
        <path d="m5 13 4 4L19 7" />
      </svg>
    </m.span>
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
    }, 140);
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
              className={`group flex w-full cursor-pointer items-center justify-between gap-4 border-b border-pf-line px-3 py-5 text-left text-lg font-medium leading-snug transition-all duration-200 ease-[var(--pf-ease-quart)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pf-ink focus-visible:ring-offset-2 motion-reduce:transition-none ${
                isSelected
                  ? "bg-pf-ink text-pf-bg shadow-[0_2px_10px_-2px_oklch(0_0_0/0.2)]"
                  : "text-pf-ink hover:bg-pf-surface hover:pl-4"
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={`inline-block h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                    isSelected ? "bg-pf-bg scale-125" : "bg-pf-line-strong group-hover:bg-pf-ink"
                  }`}
                />
                <span>{option.label}</span>
              </span>
              {isSelected ? (
                <CheckIcon />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-4 w-4 opacity-0 transition-all duration-200 ease-[var(--pf-ease-out)] group-hover:translate-x-0.5 group-hover:opacity-60"
                >
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              )}
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
