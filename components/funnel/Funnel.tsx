"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useMemo, useReducer, useRef } from "react";
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

interface FunnelState {
  view: View;
  answers: FunnelAnswers;
  activeIndex: number;
  consent: boolean;
  fieldError: string | null;
  consentError: string | null;
  serverError: string | null;
  submitting: boolean;
  honeypot: string;
  direction: 1 | -1;
}

type FunnelAction =
  | { type: "RESTORE_DRAFT"; payload: FunnelDraft }
  | { type: "START_QUESTIONS" }
  | { type: "ANSWER_STEP"; payload: { stepId: StepId; patch: Partial<FunnelAnswers> } }
  | { type: "EDIT_STEP"; payload: { index: number } }
  | { type: "GO_BACK" }
  | { type: "SET_FIELD_ERROR"; payload: string | null }
  | { type: "SET_CONSENT_ERROR"; payload: string | null }
  | { type: "SET_SERVER_ERROR"; payload: string | null }
  | { type: "SET_CONSENT"; payload: boolean }
  | { type: "SET_HONEYPOT"; payload: string }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS"; payload: FunnelAnswers }
  | { type: "SUBMIT_ERROR"; payload: string };

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
  objetivo: "objetivo",
  catalogo: "catalogo",
  "web-actual": "webActual",
  presupuesto: "presupuesto",
  plazo: "plazo",
  descripcion: "descripcion",
  nombre: "nombre",
  empresa: "empresa",
  email: "email",
  telefono: "telefono",
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
    case "objetivo":
      return answers.objetivo;
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
    case "objetivo":
      return { objetivo: optionId };
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

const initialFunnelState: FunnelState = {
  view: "intro",
  answers: {},
  activeIndex: 0,
  consent: false,
  fieldError: null,
  consentError: null,
  serverError: null,
  submitting: false,
  honeypot: "",
  direction: 1,
};

function funnelReducer(state: FunnelState, action: FunnelAction): FunnelState {
  switch (action.type) {
    case "RESTORE_DRAFT":
      return {
        ...state,
        answers: action.payload.answers,
        activeIndex: action.payload.activeIndex,
        consent: action.payload.consent,
        view: "questions",
      };
    case "START_QUESTIONS":
      return {
        ...state,
        view: "questions",
      };
    case "ANSWER_STEP": {
      const { stepId, patch } = action.payload;
      const merged = { ...state.answers, ...patch };
      const seq = stepSequence(merged);
      const index = seq.indexOf(stepId);
      const nextAnswers: FunnelAnswers = { ...merged };

      for (const later of seq.slice(index + 1)) {
        const fieldKey = FIELD_BY_STEP[later];
        if (fieldKey) delete nextAnswers[fieldKey];
      }
      if (stepId === "situacion" && nextAnswers.situacion !== "otra") {
        delete nextAnswers.situacionDetalle;
      }
      if (stepId === "tipo") {
        if (nextAnswers.tipo !== "tienda") delete nextAnswers.catalogo;
        if (nextAnswers.tipo !== "arreglar" && nextAnswers.tipo !== "redisenar") delete nextAnswers.webActual;
      }

      return {
        ...state,
        direction: 1,
        answers: nextAnswers,
        fieldError: null,
        activeIndex: state.activeIndex + 1,
      };
    }
    case "EDIT_STEP": {
      const { index } = action.payload;
      const seq = stepSequence(state.answers);
      const nextAnswers: FunnelAnswers = { ...state.answers };
      for (const later of seq.slice(index + 1)) {
        const fieldKey = FIELD_BY_STEP[later];
        if (fieldKey) delete nextAnswers[fieldKey];
      }
      return {
        ...state,
        direction: -1,
        answers: nextAnswers,
        fieldError: null,
        consentError: null,
        serverError: null,
        activeIndex: index,
        view: "questions",
      };
    }
    case "GO_BACK":
      return {
        ...state,
        direction: -1,
        activeIndex: Math.max(0, state.activeIndex - 1),
        fieldError: null,
        consentError: null,
        serverError: null,
      };
    case "SET_FIELD_ERROR":
      return { ...state, fieldError: action.payload };
    case "SET_CONSENT_ERROR":
      return { ...state, consentError: action.payload };
    case "SET_SERVER_ERROR":
      return { ...state, serverError: action.payload };
    case "SET_CONSENT":
      return { ...state, consent: action.payload, consentError: null };
    case "SET_HONEYPOT":
      return { ...state, honeypot: action.payload };
    case "SUBMIT_START":
      return { ...state, submitting: true, serverError: null };
    case "SUBMIT_SUCCESS":
      return {
        ...state,
        submitting: false,
        answers: action.payload,
        view: "summary",
      };
    case "SUBMIT_ERROR":
      return {
        ...state,
        submitting: false,
        serverError: action.payload,
      };
    default:
      return state;
  }
}

function FunnelIntro({ onStart }: { onStart: () => void }) {
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
            onClick={onStart}
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

/**
 * Funnel de captación de Xync: una transcripción acumulada. Una pregunta
 * activa cada vez; lo respondido se pliega hacia arriba como registro visible
 * y editable (el registro ES el progreso). Termina en la pantalla invertida
 * con el resumen, la cualificación y la reserva en Cal.com.
 */
export default function Funnel() {
  const [state, dispatch] = useReducer(funnelReducer, initialFunnelState);
  const {
    view,
    answers,
    activeIndex,
    consent,
    fieldError,
    consentError,
    serverError,
    submitting,
    honeypot,
    direction,
  } = state;

  const sentOnceRef = useRef(false);
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
      dispatch({ type: "RESTORE_DRAFT", payload: draft });
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
    dispatch({ type: "ANSWER_STEP", payload: { stepId, patch } });
  }

  /** Volver desde el registro o el resumen: conserva el valor, limpia lo posterior. */
  function editStep(stepId: StepId) {
    const index = sequence.indexOf(stepId);
    if (index === -1) return;

    dispatch({ type: "EDIT_STEP", payload: { index } });
    scrollToTop();
  }

  function goBack() {
    dispatch({ type: "GO_BACK" });
  }

  async function handleFinalSubmit(finalAnswers: FunnelAnswers) {
    dispatch({ type: "SET_CONSENT_ERROR", payload: null });
    if (!consent) {
      dispatch({
        type: "SET_CONSENT_ERROR",
        payload: "Debes aceptar la política de privacidad para enviar.",
      });
      return;
    }

    const payload = {
      situacion: finalAnswers.situacion,
      situacionDetalle: finalAnswers.situacionDetalle,
      tipo: finalAnswers.tipo,
      objetivo: finalAnswers.objetivo,
      catalogo: finalAnswers.catalogo,
      webActual: finalAnswers.webActual,
      presupuesto: finalAnswers.presupuesto,
      plazo: finalAnswers.plazo,
      descripcion: finalAnswers.descripcion,
      nombre: finalAnswers.nombre,
      empresa: finalAnswers.empresa,
      email: finalAnswers.email,
      telefono: finalAnswers.telefono,
      consent,
      actualizacion: sentOnceRef.current,
      company: honeypot,
      ...getAttribution(),
    };

    const parsed = funnelSchema.safeParse(payload);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path[0] as string | undefined;
      const message = issue?.message ?? "Revisa tus respuestas antes de enviar.";
      if (field === "email") dispatch({ type: "SET_FIELD_ERROR", payload: message });
      else if (field === "nombre") dispatch({ type: "SET_FIELD_ERROR", payload: message });
      else if (field === "telefono") dispatch({ type: "SET_FIELD_ERROR", payload: message });
      else if (field === "consent") dispatch({ type: "SET_CONSENT_ERROR", payload: message });
      else {
        const stepIndex = sequence.findIndex((stepId) => FIELD_BY_STEP[stepId] === field);
        if (stepIndex !== -1) {
          dispatch({ type: "EDIT_STEP", payload: { index: stepIndex } });
          dispatch({ type: "SET_FIELD_ERROR", payload: message });
        } else {
          dispatch({ type: "SET_SERVER_ERROR", payload: message });
        }
      }
      return;
    }

    dispatch({ type: "SUBMIT_START" });
    trackFunnelEvent("lead_form_submit");
    try {
      const res = await fetch("/api/funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };

      if (!res.ok || !data.ok) {
        dispatch({
          type: "SUBMIT_ERROR",
          payload: data.message ?? "No pudimos enviar tus respuestas. Inténtalo de nuevo.",
        });
        return;
      }

      sentOnceRef.current = true;
      dispatch({ type: "SUBMIT_SUCCESS", payload: finalAnswers });
      clearDraft();
      trackFunnelEvent("lead_form_success");
      scrollToTop();
    } catch {
      dispatch({
        type: "SUBMIT_ERROR",
        payload: "Error de conexión. Revisa tu red e inténtalo de nuevo.",
      });
    }
  }

  function handleInputStep(value: string) {
    const trimmed = value.trim();

    if (activeStepId === "nombre") {
      if (trimmed.length < 2) {
        dispatch({ type: "SET_FIELD_ERROR", payload: "Dime tu nombre." });
        return;
      }
      if (trimmed.length > 80) {
        dispatch({ type: "SET_FIELD_ERROR", payload: "Ese nombre es demasiado largo." });
        return;
      }
      if (/[<>]/.test(trimmed)) {
        dispatch({ type: "SET_FIELD_ERROR", payload: "El nombre contiene caracteres no permitidos." });
        return;
      }
    } else if (activeStepId === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        dispatch({ type: "SET_FIELD_ERROR", payload: "Introduce un email válido." });
        return;
      }
      if (!consent) {
        dispatch({
          type: "SET_CONSENT_ERROR",
          payload: "Debes aceptar la política de privacidad para enviar.",
        });
        return;
      }
    } else if (activeStepId === "descripcion") {
      if (trimmed.length > 2000) {
        dispatch({ type: "SET_FIELD_ERROR", payload: "El texto es demasiado largo." });
        return;
      }
    } else if (activeStepId === "empresa") {
      if (trimmed.length > 120) {
        dispatch({ type: "SET_FIELD_ERROR", payload: "El nombre de la empresa es demasiado largo." });
        return;
      }
    } else if (activeStepId === "telefono") {
      if (trimmed.length > 0 && !/^[+0-9\s().-]{6,30}$/.test(trimmed)) {
        dispatch({ type: "SET_FIELD_ERROR", payload: "Introduce un número de teléfono válido o déjalo en blanco." });
        return;
      }
      if (trimmed.length > 40) {
        dispatch({ type: "SET_FIELD_ERROR", payload: "El número de teléfono es demasiado largo." });
        return;
      }
    }

    const fieldKey = FIELD_BY_STEP[activeStepId];
    const nextAnswers: FunnelAnswers = { ...answers, [fieldKey]: trimmed };

    const isLastStep = activeIndex === sequence.length - 1;
    if (isLastStep) {
      handleFinalSubmit(nextAnswers);
    } else {
      answerStep(activeStepId, { [fieldKey]: trimmed });
    }
  }

  if (view === "summary") {
    return <Summary answers={answers} stepIds={sequence} onEdit={editStep} />;
  }

  if (view === "intro") {
    return (
      <FunnelIntro
        onStart={() => {
          trackFunnelEvent("lead_form_start");
          dispatch({ type: "START_QUESTIONS" });
          scrollToTop();
        }}
      />
    );
  }

  const progressRatio = Math.min(1, Math.max(0, (activeIndex + 1) / total));

  return (
    <div className="mx-auto w-full max-w-[44rem] flex-1 px-6 pb-32 pt-8 md:pt-12">
      {/* Barra de progreso sutil y fluida */}
      <div
        role="progressbar"
        aria-valuenow={activeIndex + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Progreso: paso ${activeIndex + 1} de ${total}`}
        className="relative h-[2px] w-full overflow-hidden rounded-full bg-pf-line"
      >
        <m.div
          className="h-full w-full origin-left bg-pf-ink"
          initial={false}
          animate={{ scaleX: progressRatio }}
          transition={{ duration: 0.35, ease: pfEaseOut }}
        />
      </div>

      <div className="pf-mono mt-4 flex items-center justify-between text-xs text-pf-muted">
        {activeIndex > 0 ? (
          <button
            type="button"
            onClick={goBack}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--pf-radius-sm)] py-1 pr-2 transition-colors duration-150 hover:text-pf-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pf-ink"
          >
            <ArrowLeftIcon />
            Anterior
          </button>
        ) : (
          <span aria-hidden="true" />
        )}
        <span className="font-medium tabular-nums">
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

      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <m.div
          key={activeStepId}
          ref={activeRef}
          custom={direction}
          variants={{
            enter: (dir: number) => ({
              opacity: 0,
              x: dir > 0 ? 18 : -18,
            }),
            center: {
              opacity: 1,
              x: 0,
              transition: { duration: 0.32, ease: pfEaseOut },
            },
            exit: (dir: number) => ({
              opacity: 0,
              x: dir > 0 ? -18 : 18,
              transition: { duration: 0.2, ease: pfEaseOut },
            }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
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
              isLastStep={activeIndex === sequence.length - 1}
              honeypot={honeypot}
              onClearError={() => dispatch({ type: "SET_FIELD_ERROR", payload: null })}
              onConsentChange={(value) => {
                dispatch({ type: "SET_CONSENT", payload: value });
              }}
              onHoneypotChange={(val) => dispatch({ type: "SET_HONEYPOT", payload: val })}
              onSubmit={handleInputStep}
            />
          )}
        </m.div>
      </AnimatePresence>
    </div>
  );
}
