"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { m } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { identity } from "@/lib/portfolio/content";
import { type ContactInput, contactSchema } from "@/lib/portfolio/contact-schema";
import { fadeUp, pfViewport, stagger } from "@/lib/portfolio/motion";
import Button from "./ui/Button";
import CalButton from "./ui/CalButton";
import Field from "./ui/Field";

export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "", company: "", consent: false },
  });

  const consent = watch("consent");

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

        {/* Right: formulario corto */}
        <m.div
          initial="hidden"
          whileInView="visible"
          viewport={pfViewport}
          variants={fadeUp}
          className="lg:col-span-6 lg:col-start-7"
        >
          {status === "success" ? (
            <div
              role="status"
              className="flex h-full min-h-[20rem] flex-col items-start justify-center rounded-[var(--pf-radius-lg)] border border-pf-line bg-pf-surface p-8"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-pf-ink text-pf-bg">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-6 w-6"
                >
                  <path d="m5 13 4 4L19 7" />
                </svg>
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
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="rounded-[var(--pf-radius-lg)] border border-pf-line bg-pf-surface p-6 md:p-8"
            >
              {serverError ? (
                <p
                  role="alert"
                  className="mb-6 rounded-[var(--pf-radius)] border border-pf-danger bg-pf-surface px-4 py-3 text-sm text-pf-danger"
                >
                  {serverError}
                </p>
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
            </form>
          )}
        </m.div>
      </div>
    </section>
  );
}
