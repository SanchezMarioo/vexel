"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, m } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { type ContactInput, contactSchema } from "@/lib/portfolio/contact-schema";
import { pfEaseOut } from "@/lib/portfolio/motion";
import Button from "./ui/Button";
import Field from "./ui/Field";

/**
 * Formulario corto de contacto (nombre, email, mensaje). Vive en un chunk
 * propio y se carga de forma diferida (ver ContactFormLazy): react-hook-form +
 * zod solo entran en la ventana de carga si el visitante llega a la sección.
 */
export default function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "", company: "", consent: false },
  });

  const consent = useWatch({ control, name: "consent" });

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  async function onSubmit(values: ContactInput) {
    setServerError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };

      if (!res.ok || !data.ok) {
        setServerError(data.message ?? "No se pudo enviar el mensaje. Inténtalo de nuevo.");
        setStatus("error");
        return;
      }

      reset();
      setStatus("success");
    } catch {
      setServerError("Error de conexión. Revisa tu red e inténtalo de nuevo.");
      setStatus("error");
    }
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === "success" ? (
        <m.div
          key="contact-success"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: pfEaseOut }}
          role="status"
          className="flex h-full min-h-[20rem] flex-col items-start justify-center rounded-[var(--pf-radius-lg)] border border-pf-line bg-pf-surface p-8"
        >
          <span className="grid h-12 w-12 place-items-center rounded-full bg-pf-ink text-pf-bg shadow-[0_4px_16px_-4px_oklch(0_0_0/0.3)]">
            <span className="t-success-check" data-state="in" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="m5 13 4 4L19 7" />
              </svg>
            </span>
          </span>
          <h3 className="pf-display mt-5 text-2xl text-pf-ink">Mensaje recibido</h3>
          <p className="pf-prose mt-2 text-pf-ink-soft">
            Gracias por escribir. Te respondemos lo antes posible al email que nos has dejado.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-6 text-sm font-medium text-pf-ink underline-offset-4 hover:underline"
          >
            Enviar otro mensaje
          </button>
        </m.div>
      ) : (
        <m.form
          key="contact-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.35, ease: pfEaseOut } }}
          exit={{ opacity: 0, y: -8, transition: { duration: 0.22, ease: pfEaseOut } }}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="rounded-[var(--pf-radius-lg)] border border-pf-line bg-pf-surface p-6 md:p-8"
        >
          {serverError ? (
            <m.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: pfEaseOut }}
              role="alert"
              className="mb-6 rounded-[var(--pf-radius)] border border-pf-danger bg-pf-surface px-4 py-3 text-sm text-pf-danger"
            >
              {serverError}
            </m.p>
          ) : null}

          <div className="flex flex-col gap-5">
            <Field
              id="contact-name"
              label="Nombre"
              required
              autoComplete="name"
              placeholder="Cómo te llamas"
              field={register("name")}
              error={errors.name?.message}
            />
            <Field
              id="contact-email"
              label="Email"
              type="email"
              required
              autoComplete="email"
              placeholder="tu@email.com"
              field={register("email")}
              error={errors.email?.message}
            />
            <Field
              id="contact-message"
              label="¿Qué quieres construir o mejorar?"
              required
              multiline
              placeholder="Cuéntanos tu proyecto en un par de líneas y el plazo que manejas."
              field={register("message")}
              error={errors.message?.message}
            />

            {/* Honeypot — off-screen, never shown to humans. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor="contact-company">No rellenar</label>
              <input
                id="contact-company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                {...register("company")}
              />
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="contact-consent"
              className="group flex cursor-pointer items-start gap-3 text-sm text-pf-ink-soft select-none"
            >
              <span
                className={`relative mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[2px] border bg-pf-surface transition-colors group-hover:border-pf-ink has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-pf-ink has-[:focus-visible]:ring-offset-2 ${
                  consent ? "border-pf-ink" : "border-pf-line-strong"
                }`}
              >
                <input
                  id="contact-consent"
                  type="checkbox"
                  aria-invalid={errors.consent ? true : undefined}
                  className="sr-only"
                  {...register("consent")}
                />
                {/* Visual checked indicator */}
                {consent ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="pointer-events-none h-3 w-3 text-pf-ink"
                    aria-hidden="true"
                  >
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                ) : null}
              </span>
              <span>
                He leído y acepto la{" "}
                <Link
                  href="/privacidad"
                  className="text-pf-ink underline underline-offset-4 hover:no-underline"
                >
                  política de privacidad
                </Link>
                .
              </span>
            </label>
            {errors.consent ? (
              <p role="alert" className="mt-2 text-sm font-medium text-pf-danger">
                {errors.consent.message}
              </p>
            ) : null}
          </div>

          <div className="mt-7">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              loading={isSubmitting}
              withArrow
            >
              {isSubmitting ? "Enviando…" : "Enviar mensaje"}
            </Button>
          </div>
        </m.form>
      )}
    </AnimatePresence>
  );
}
