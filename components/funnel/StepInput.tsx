"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import Button from "@/components/portfolio/ui/Button";
import type { InputStep } from "@/lib/funnel/content";
import { pfEaseOut } from "@/lib/portfolio/motion";

interface StepInputProps {
  step: InputStep;
  initialValue: string;
  error: string | null;
  consent: boolean;
  consentError: string | null;
  serverError: string | null;
  submitting: boolean;
  isLastStep?: boolean;
  honeypot: string;
  onClearError: () => void;
  onConsentChange: (value: boolean) => void;
  onHoneypotChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

/**
 * Paso de texto libre (nombre, empresa, email, teléfono, descripción):
 * la pregunta es el label, el campo es tipografía grande sobre una sola
 * hairline animada (o textarea expansible para descripción).
 * El paso de email lleva el consentimiento RGPD.
 */
export default function StepInput({
  step,
  initialValue,
  error,
  consent,
  consentError,
  serverError,
  submitting,
  isLastStep = false,
  honeypot,
  onClearError,
  onConsentChange,
  onHoneypotChange,
  onSubmit,
}: StepInputProps) {
  const [value, setValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const headingId = `funnel-question-${step.id}`;
  const inputId = `funnel-${step.id}`;
  const errorId = `${inputId}-error`;

  const isMultiline = step.multiline || step.type === "textarea";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(value);
      }}
      noValidate
    >
      <h2
        id={headingId}
        data-autofocus
        tabIndex={-1}
        className="pf-display text-pf-ink-strong outline-none"
        style={{ fontSize: "clamp(1.9rem, 3.8vw, 3rem)" }}
      >
        {step.question}
      </h2>

      <AnimatePresence>
        {serverError ? (
          <m.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            role="alert"
            className="mt-6 rounded-[var(--pf-radius)] border border-pf-danger bg-pf-danger/5 px-4 py-3 text-sm text-pf-danger"
          >
            <p>{serverError}</p>
            <p className="mt-1">
              Si sigue fallando, escríbenos directamente a{" "}
              <a href="mailto:contacto@xync.es" className="underline underline-offset-4">
                contacto@xync.es
              </a>
              .
            </p>
          </m.div>
        ) : null}
      </AnimatePresence>

      <div className="relative mt-9">
        <label htmlFor={inputId} className="sr-only">
          {step.question}
        </label>
        {isMultiline ? (
          <textarea
            id={inputId}
            rows={3}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              onClearError();
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={step.placeholder}
            aria-labelledby={headingId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className="w-full resize-y border-b border-pf-line-strong bg-transparent py-3 text-xl font-medium text-pf-ink outline-none placeholder:text-pf-muted md:text-2xl"
          />
        ) : (
          <input
            id={inputId}
            type={step.type}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              onClearError();
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={step.placeholder}
            autoComplete={step.autoComplete}
            aria-labelledby={headingId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className="w-full border-b border-pf-line-strong bg-transparent py-3 text-2xl font-medium text-pf-ink outline-none placeholder:text-pf-muted md:text-3xl"
          />
        )}
        {/* Animated active focus hairline */}
        <m.span
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-pf-ink"
          initial={false}
          animate={{ scaleX: isFocused ? 1 : 0 }}
          transition={{ duration: 0.25, ease: pfEaseOut }}
        />
      </div>

      <AnimatePresence>
        {error ? (
          <m.p
            id={errorId}
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: pfEaseOut }}
            className="mt-3 text-sm font-medium text-pf-danger"
          >
            {error}
          </m.p>
        ) : null}
      </AnimatePresence>

      {step.withConsent ? (
        <div className="mt-8">
          <label
            htmlFor="funnel-consent"
            className="group flex cursor-pointer items-start gap-3 text-sm text-pf-ink-soft select-none"
          >
            <span className="relative mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[2px] border border-pf-line-strong bg-pf-bg transition-colors group-hover:border-pf-ink">
              <input
                id="funnel-consent"
                type="checkbox"
                checked={consent}
                onChange={(event) => onConsentChange(event.target.checked)}
                aria-invalid={consentError ? true : undefined}
                className="sr-only"
              />
              {consent ? (
                <m.svg
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3 text-pf-ink"
                  aria-hidden="true"
                >
                  <path d="m5 13 4 4L19 7" />
                </m.svg>
              ) : null}
            </span>
            <span>
              He leído y acepto la{" "}
              <Link
                href="/privacidad"
                target="_blank"
                rel="noreferrer"
                className="text-pf-ink underline underline-offset-4 hover:no-underline"
              >
                política de privacidad
              </Link>
              .
            </span>
          </label>
          {consentError ? (
            <p
              role="alert"
              className="mt-2 text-sm font-medium text-pf-danger"
            >
              {consentError}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Honeypot — off-screen, never shown to humans. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="funnel-company">No rellenar</label>
        <input
          id="funnel-company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => onHoneypotChange(event.target.value)}
        />
      </div>

      <div className="mt-9">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={submitting}
          loading={submitting}
          withArrow
        >
          {submitting ? "Enviando…" : isLastStep ? "Enviar proyecto" : "Continuar"}
        </Button>
      </div>
    </form>
  );
}
