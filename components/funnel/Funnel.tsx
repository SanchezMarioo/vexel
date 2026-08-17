"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/portfolio/ui/Button";
import { getAttribution } from "@/lib/funnel/attribution";
import {
  phaseFor,
  stepSequence,
  steps,
  type FunnelAnswers,
  type StepId,
} from "@/lib/funnel/content";
import { funnelSchema } from "@/lib/funnel/schema";
import { trackFunnelEvent } from "@/lib/funnel/tracking";
import { identity } from "@/lib/portfolio/content";
import { fadeUp, heroLcpSafe, pfEaseOut, stagger } from "@/lib/portfolio/motion";
import StepChoice from "./StepChoice";
import StepInput from "./StepInput";
import Summary from "./Summary";
import Transcript from "./Transcript";

type View = "intro" | "questions" | "summary";

const DRAFT_KEY = "xync:funnel:draft";

interface FunnelDraft {
  answers: FunnelAnswers;
  activeIndex: number;
  consent: boolean;
}

function readDraft(): FunnelDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as Partial<FunnelDraft>;
    if (!draft.answers || Object.keys(draft.answers).length === 0) return null;
    return {
      answers: draft.answers,
      activeIndex: typeof draft.activeIndex === "number" ? draft.activeIndex : 0,
      consent: Boolean(draft.consent),
    };
  } catch {
    return null;
  }
}

function saveDraft(draft: FunnelDraft) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Sin sessionStorage disponible: el borrador simplemente no persiste.
  }
}

function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // Nada que limpiar.
  }
}

const FIELD_BY_STEP: Record<StepId, keyof FunnelAnswers> = {
  situacion: "situacion",
  tipo: "tipo",
  catalogo: "catalogo",
  "web-actual": "webActual",
  presupuesto: "presupuesto",
  plazo: "plazo",
  nombre: "nombre",
  email: "email",
};

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-3.5 w-3.5"
    >
      <path d="M19 12H5m6 6-6-6 6-6" />
    </svg>
  );
}

function choiceValue(answers: FunnelAnswers, stepId: StepId): string | undefined {
  switch (stepId) {
    case "situacion":
      return answers.situacion;
    case "tipo":
      return answers.tipo;
    case "catalogo":
      return answers.catalogo;
    case "web-actual":
      return answers.webActual;
    case "presupuesto":
      return answers.presupuesto;
    case "plazo":
      return answers.plazo;
    default:
      return undefined;
  }
}

function choicePatch(
  stepId: StepId,
  optionId: string,
  detail?: string,
): Partial<FunnelAnswers> {
  switch (stepId) {
    case "situacion":
      return detail !== undefined
        ? { situacion: optionId, situacionDetalle: detail }
        : { situacion: optionId };
    case "tipo":
      return { tipo: optionId };
    case "catalogo":
      return { catalogo: optionId };
    case "web-actual":
      return { webActual: optionId };
    case "presupuesto":
      return { presupuesto: optionId };
    case "plazo":
      return { plazo: optionId };
    default:
      return {};
  }
}

/**
 * Funnel de captación de Xync: una transcripción acumulada. Una pregunta
 * activa cada vez; lo respondido se pliega hacia arriba como registro visible
 * y editable (el registro ES el progreso). Termina en la pantalla invertida
 * con el resumen, la cualificación y la reserva en Cal.com.
 */
export default function Funnel() {
  const [view, setView] = useState<View>("intro");
  const [answers, setAnswers] = useState<FunnelAnswers>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [consent, setConsent] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sentOnce, setSentOnce] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const activeRef = useRef<HTMLDivElement>(null);

  const sequence = useMemo(() => stepSequence(answers), [answers]);
  const activeStepId = sequence[Math.min(activeIndex, sequence.length - 1)];
  const step = steps[activeStepId];
  const total = sequence.length;

  // Vista del funnel + restauración del borrador tras un refresh (después del
  // mount para no desincronizar la hidratación) + guardado continuo.
  useEffect(() => {
    trackFunnelEvent("lead_form_view");
    const draft = readDraft();
    if (draft) {
      // Restauración única de estado persistido tras montaje para evitar hydration mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnswers(draft.answers);
      setActiveIndex(draft.activeIndex);
      setConsent(draft.consent);
      setView("questions");
    }
  }, []);

  useEffect(() => {
    if (view !== "questions") return;
    saveDraft({ answers, activeIndex, consent });
  }, [view, answers, activeIndex, consent]);

  // Focus + scroll al paso activo: el encabezado recibe el foco para que un
  // lector de pantalla anuncie la pregunta; desde ahí se tabula a las opciones.
  useEffect(() => {
    if (view !== "questions") return;
    const timer = window.setTimeout(() => {
      const container = activeRef.current;
      if (!container) return;
      container
        .querySelector<HTMLElement>("[data-autofocus]")
        ?.focus({ preventScroll: true });
      container.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start",
      });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [view, activeStepId]);

  /** Responder: aplica el patch y limpia todo lo que cuelga río abajo. */
  function answerStep(stepId: StepId, patch: Partial<FunnelAnswers>) {
    trackFunnelEvent("lead_form_step_completed", { step: stepId });
    setAnswers((prev) => {
      const merged = { ...prev, ...patch };
      const seq = stepSequence(merged);
      const index = seq.indexOf(stepId);
      const next: FunnelAnswers = { ...merged };

      for (const later of seq.slice(index + 1)) {
        delete next[FIELD_BY_STEP[later]];
      }
      if (stepId === "situacion" && next.situacion !== "otra") {
        delete next.situacionDetalle;
      }
      if (stepId === "tipo") {
        if (next.tipo !== "tienda") delete next.catalogo;
        if (next.tipo !== "arreglar" && next.tipo !== "redisenar") delete next.webActual;
      }
      return next;
    });
    setFieldError(null);
    setActiveIndex((index) => index + 1);
  }

  /** Volver desde el registro o el resumen: conserva el valor, limpia lo posterior. */
  function editStep(stepId: StepId) {
    const index = sequence.indexOf(stepId);
    if (index === -1) return;

    setAnswers((prev) => {
      const seq = stepSequence(prev);
      const next: FunnelAnswers = { ...prev };
      for (const later of seq.slice(index + 1)) {
        delete next[FIELD_BY_STEP[later]];
      }
      return next;
    });
    setFieldError(null);
    setConsentError(null);
    setServerError(null);
    setActiveIndex(index);
    setView("questions");
    scrollToTop();
  }

  function goBack() {
    setActiveIndex((index) => Math.max(0, index - 1));
    setFieldError(null);
    setConsentError(null);
    setServerError(null);
  }

  function submitNombre(value: string) {
    const nombre = value.trim();
    if (nombre.length < 2) {
      setFieldError("Dime tu nombre.");
      return;
    }
    if (nombre.length > 80) {
      setFieldError("Ese nombre es demasiado largo.");
      return;
    }
    if (/[<>]/.test(nombre)) {
      setFieldError("El nombre contiene caracteres no permitidos.");
      return;
    }
    answerStep("nombre", { nombre });
  }

  async function submitEmail(emailValue: string) {
    setConsentError(null);
    if (!consent) {
      setConsentError("Debes aceptar la política de privacidad para enviar.");
      return;
    }

    const payload = {
      situacion: answers.situacion,
      situacionDetalle: answers.situacionDetalle,
      tipo: answers.tipo,
      catalogo: answers.catalogo,
      webActual: answers.webActual,
      presupuesto: answers.presupuesto,
      plazo: answers.plazo,
      nombre: answers.nombre,
      email: emailValue.trim(),
      consent,
      actualizacion: sentOnce,
      company: honeypot,
      ...getAttribution(),
    };

    const parsed = funnelSchema.safeParse(payload);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const message = issue?.message ?? "Revisa tus respuestas.";
      if (issue?.path[0] === "email") setFieldError(message);
      else if (issue?.path[0] === "consent") setConsentError(message);
      else setServerError(message);
      return;
    }

    setSubmitting(true);
    setServerError(null);
    trackFunnelEvent("lead_form_submit");
    try {
      const res = await fetch("/api/funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };

      if (!res.ok || !data.ok) {
        setServerError(data.message ?? "No pudimos enviar tus respuestas. Inténtalo de nuevo.");
        return;
      }

      setAnswers((prev) => ({ ...prev, email: emailValue.trim() }));
      setSentOnce(true);
      setView("summary");
      clearDraft();
      trackFunnelEvent("lead_form_success");
      scrollToTop();
    } catch {
      setServerError("Error de conexión. Revisa tu red e inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (view === "summary") {
    return <Summary answers={answers} stepIds={sequence} onEdit={editStep} />;
  }

  if (view === "intro") {
    return (
      <section className="mx-auto flex w-full max-w-[44rem] flex-1 flex-col justify-center px-6 py-24 md:py-32">
        <m.div initial="hidden" animate="visible" variants={stagger(0.12, 0.05)}>
          <m.h1
            variants={heroLcpSafe}
            className="pf-display text-pf-ink-strong"
            style={{ fontSize: "clamp(2.4rem, 5.4vw, 4.4rem)" }}
          >
            Ya has visto lo que hacemos. Ahora cuéntanos qué necesitas.
          </m.h1>
          <m.p variants={fadeUp} className="mt-6 max-w-prose text-lg leading-relaxed text-pf-ink-soft">
            Un par de minutos, una pregunta cada vez. Sin compromiso: al terminar decides si
            reservamos una llamada.
          </m.p>
          <m.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button
              type="button"
              variant="solid"
              size="lg"
              withArrow
              onClick={() => {
                trackFunnelEvent("lead_form_start");
                setView("questions");
                scrollToTop();
              }}
            >
              Empezar
            </Button>
            <p className="text-sm text-pf-muted">
              ¿Prefieres el email directo?{" "}
              <a
                href={`mailto:${identity.email}`}
                className="text-pf-ink underline-offset-4 hover:underline"
              >
                {identity.email}
              </a>
            </p>
          </m.div>
          <noscript>
            <div className="mt-10 border border-pf-line-strong p-6 text-pf-ink">
              <p className="leading-relaxed">
                Este proceso necesita JavaScript. Si prefieres no activarlo, escríbenos a{" "}
                <a href={`mailto:${identity.email}`} className="underline underline-offset-4">
                  {identity.email}
                </a>{" "}
                o reserva una llamada directamente en{" "}
                <a
                  href={`https://cal.com/${identity.calUrl}`}
                  className="underline underline-offset-4"
                >
                  cal.com/{identity.calUrl}
                </a>
                .
              </p>
            </div>
          </noscript>
        </m.div>
      </section>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[44rem] flex-1 px-6 pb-32 pt-10 md:pt-14">
      <div className="pf-mono flex items-center justify-between text-xs text-pf-muted">
        {activeIndex > 0 ? (
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 transition-colors duration-150 hover:text-pf-ink"
          >
            <ArrowLeftIcon />
            Anterior
          </button>
        ) : (
          <span aria-hidden="true" />
        )}
        <span>
          {String(activeIndex + 1).padStart(2, "0")}/{String(total).padStart(2, "0")} · {phaseFor(activeIndex, total)}
        </span>
      </div>

      <div className="mt-8">
        <Transcript
          stepIds={sequence.slice(0, activeIndex)}
          answers={answers}
          onEdit={editStep}
        />
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        <m.div
          key={activeStepId}
          ref={activeRef}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.4, ease: pfEaseOut }}
          className="mt-10 scroll-mt-10"
        >
          {step.kind === "choice" ? (
            <StepChoice
              step={step}
              selected={choiceValue(answers, activeStepId)}
              detail={answers.situacionDetalle}
              onAnswer={(optionId, detail) =>
                answerStep(activeStepId, choicePatch(activeStepId, optionId, detail))
              }
            />
          ) : (
            <StepInput
              step={step}
              initialValue={
                (answers[FIELD_BY_STEP[activeStepId]] as string | undefined) ?? ""
              }
              error={fieldError}
              consent={consent}
              consentError={consentError}
              serverError={serverError}
              submitting={submitting}
              honeypot={honeypot}
              onClearError={() => setFieldError(null)}
              onConsentChange={(value) => {
                setConsent(value);
                setConsentError(null);
              }}
              onHoneypotChange={setHoneypot}
              onSubmit={activeStepId === "nombre" ? submitNombre : submitEmail}
            />
          )}
        </m.div>
      </AnimatePresence>
    </div>
  );
}
