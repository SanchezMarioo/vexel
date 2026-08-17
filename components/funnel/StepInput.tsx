"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/portfolio/ui/Button";
import type { InputStep } from "@/lib/funnel/content";

interface StepInputProps {
  step: InputStep;
  initialValue: string;
  error: string | null;
  consent: boolean;
  consentError: string | null;
  serverError: string | null;
  submitting: boolean;
  honeypot: string;
  onClearError: () => void;
  onConsentChange: (value: boolean) => void;
  onHoneypotChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

/**
 * Paso de texto libre (nombre, email): la pregunta es el label, el campo es
 * tipografía grande sobre una sola hairline — sin caja, sin borde, sin gris.
 * El paso de email lleva el consentimiento RGPD y envía el lead. El draft es
 * local: el componente se remonta en cada paso (key del padre).
 */
export default function StepInput({
  step,
  initialValue,
  error,
  consent,
  consentError,
  serverError,
  submitting,
  honeypot,
  onClearError,
  onConsentChange,
  onHoneypotChange,
  onSubmit,
}: StepInputProps) {
  const [value, setValue] = useState(initialValue);
  const headingId = `funnel-question-${step.id}`;
  const inputId = `funnel-${step.id}`;
  const errorId = `${inputId}-error`;

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

      {serverError ? (
        <div
          role="alert"
          className="mt-6 rounded-[var(--pf-radius)] border border-pf-danger px-4 py-3 text-sm text-pf-danger"
        >
          <p>{serverError}</p>
          <p className="mt-1">
            Si sigue fallando, escríbenos directamente a{" "}
            <a href="mailto:contacto@xync.es" className="underline underline-offset-4">
              contacto@xync.es
            </a>
            .
          </p>
        </div>
      ) : null}

      <input
        id={inputId}
        type={step.type}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          onClearError();
        }}
        placeholder={step.placeholder}
        autoComplete={step.autoComplete}
        aria-labelledby={headingId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="mt-9 w-full border-b border-pf-line-strong bg-transparent py-3 text-2xl font-medium text-pf-ink outline-none transition-colors placeholder:text-pf-muted focus:border-pf-ink md:text-3xl"
      />

      {error ? (
        <p id={errorId} role="alert" className="mt-3 text-sm text-pf-danger">
          {error}
        </p>
      ) : null}

      {step.withConsent ? (
        <div className="mt-8">
          <label
            htmlFor="funnel-consent"
            className="flex items-start gap-3 text-sm text-pf-ink-soft"
          >
            <input
              id="funnel-consent"
              type="checkbox"
              checked={consent}
              onChange={(event) => onConsentChange(event.target.checked)}
              aria-invalid={consentError ? true : undefined}
              className="mt-0.5 h-4 w-4 flex-shrink-0 accent-pf-ink"
            />
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
            <p role="alert" className="mt-2 text-sm text-pf-danger">
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
        <Button type="submit" variant="primary" size="lg" disabled={submitting} withArrow>
          {submitting ? "Enviando…" : "Continuar"}
        </Button>
      </div>
    </form>
  );
}
