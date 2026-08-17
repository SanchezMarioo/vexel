/**
 * Contenido y estructura del funnel de captación (/empezar).
 *
 * Una pregunta cada vez, voz Xync: frases completas en el idioma del cliente,
 * sin jerga. Los IDs de opción son estables (se envían al endpoint y al sheet),
 * las etiquetas pueden reescribirse sin romper nada.
 */

export const SITUACION_IDS = [
  "lenta",
  "no-convierte",
  "nuevo",
  "vender-online",
  "otra",
] as const;

export const TIPO_IDS = ["web-nueva", "arreglar", "redisenar", "tienda"] as const;

export const CATALOGO_IDS = ["menos-50", "50-500", "mas-500", "no-se"] as const;

export const WEB_ACTUAL_IDS = ["wordpress", "a-medida", "builder", "no-se"] as const;

export const PRESUPUESTO_IDS = [
  "menos-1000",
  "1000-3000",
  "3000-6000",
  "mas-6000",
  "no-claro",
] as const;

export const PLAZO_IDS = ["cuanto-antes", "1-3-meses", "mas-adelante", "explorando"] as const;

export interface FunnelOption {
  id: string;
  label: string;
  /** Tras elegir esta opción se pide un detalle en texto libre. */
  needsDetail?: boolean;
}

export interface ChoiceStep {
  id: StepId;
  kind: "choice";
  /** Etiqueta corta para el registro (transcripción y resumen). */
  record: string;
  question: string;
  /** Línea opcional de contexto debajo de la pregunta. */
  why?: string;
  options: FunnelOption[];
}

export interface InputStep {
  id: StepId;
  kind: "input";
  record: string;
  question: string;
  placeholder: string;
  type: "text" | "email";
  autoComplete: string;
  /** El paso lleva el consentimiento RGPD debajo del campo. */
  withConsent?: boolean;
}

export type FunnelStep = ChoiceStep | InputStep;

export type StepId =
  | "situacion"
  | "tipo"
  | "catalogo"
  | "web-actual"
  | "presupuesto"
  | "plazo"
  | "nombre"
  | "email";

export interface FunnelAnswers {
  situacion?: string;
  /** Texto libre cuando la situación elegida es "otra". */
  situacionDetalle?: string;
  tipo?: string;
  catalogo?: string;
  webActual?: string;
  presupuesto?: string;
  plazo?: string;
  nombre?: string;
  email?: string;
}

export const steps: Record<StepId, FunnelStep> = {
  situacion: {
    id: "situacion",
    kind: "choice",
    record: "Situación",
    question: "¿Qué te trae por aquí?",
    options: [
      { id: "lenta", label: "Mi web va lenta, falla o se quedó corta" },
      { id: "no-convierte", label: "Mi web no vende ni convierte lo que debería" },
      { id: "nuevo", label: "Quiero lanzar una web o un producto desde cero" },
      { id: "vender-online", label: "Quiero vender online sin depender de terceros" },
      { id: "otra", label: "Otra cosa — te la cuento", needsDetail: true },
    ],
  },
  tipo: {
    id: "tipo",
    kind: "choice",
    record: "Proyecto",
    question: "¿Qué necesitamos construir?",
    options: [
      { id: "web-nueva", label: "Una web o landing nueva, desde cero" },
      { id: "arreglar", label: "Arreglar y poner a punto mi web actual" },
      { id: "redisenar", label: "Rediseñar mi web para que esté a la altura" },
      { id: "tienda", label: "Una tienda online propia" },
    ],
  },
  catalogo: {
    id: "catalogo",
    kind: "choice",
    record: "Catálogo",
    question: "¿Cuántos productos tendría la tienda?",
    options: [
      { id: "menos-50", label: "Menos de 50" },
      { id: "50-500", label: "Entre 50 y 500" },
      { id: "mas-500", label: "Más de 500" },
      { id: "no-se", label: "Todavía no lo sé" },
    ],
  },
  "web-actual": {
    id: "web-actual",
    kind: "choice",
    record: "Web actual",
    question: "¿Sobre qué trabajamos hoy?",
    options: [
      { id: "wordpress", label: "Una web en WordPress o similar" },
      { id: "a-medida", label: "Algo hecho a medida" },
      { id: "builder", label: "Un constructor tipo Wix o Squarespace" },
      { id: "no-se", label: "Ni idea — y es normal" },
    ],
  },
  presupuesto: {
    id: "presupuesto",
    kind: "choice",
    record: "Inversión",
    question: "¿Qué inversión tienes en mente?",
    why: "Nos ayuda a proponerte algo realista desde el minuto uno. El precio definitivo sale del plan que acordemos, no de esta respuesta.",
    options: [
      { id: "menos-1000", label: "Menos de 1.000 €" },
      { id: "1000-3000", label: "Entre 1.000 y 3.000 €" },
      { id: "3000-6000", label: "Entre 3.000 y 6.000 €" },
      { id: "mas-6000", label: "Más de 6.000 €" },
      { id: "no-claro", label: "Aún no lo tengo claro" },
    ],
  },
  plazo: {
    id: "plazo",
    kind: "choice",
    record: "Plazo",
    question: "¿Cuándo te gustaría empezar?",
    options: [
      { id: "cuanto-antes", label: "Cuanto antes" },
      { id: "1-3-meses", label: "En uno a tres meses" },
      { id: "mas-adelante", label: "Más adelante" },
      { id: "explorando", label: "Estoy explorando" },
    ],
  },
  nombre: {
    id: "nombre",
    kind: "input",
    record: "Nombre",
    question: "¿Cómo te llamas?",
    placeholder: "Tu nombre",
    type: "text",
    autoComplete: "name",
  },
  email: {
    id: "email",
    kind: "input",
    record: "Email",
    question: "¿A qué email te escribimos?",
    placeholder: "tu@email.com",
    type: "email",
    autoComplete: "email",
    withConsent: true,
  },
};

/**
 * Secuencia de pasos según lo respondido: tienda añade catálogo;
 * arreglar/rediseñar añaden la pregunta por la web actual. El resto, fijo.
 */
export function stepSequence(answers: FunnelAnswers): StepId[] {
  const sequence: StepId[] = ["situacion", "tipo"];

  if (answers.tipo === "tienda") sequence.push("catalogo");
  if (answers.tipo === "arreglar" || answers.tipo === "redisenar") {
    sequence.push("web-actual");
  }

  sequence.push("presupuesto", "plazo", "nombre", "email");
  return sequence;
}

/** Frase de tramo para el contador: orientación honesta, no una barra. */
export function phaseFor(index: number, total: number): string {
  if (index < 2) return "Primero, tu caso.";
  if (index < total - 2) return "Ahora, lo práctico.";
  return "Para terminar.";
}

/** Etiqueta legible de una respuesta para el registro y el resumen. */
export function answerLabel(stepId: StepId, answers: FunnelAnswers): string {
  const step = steps[stepId];

  if (step.kind === "input") {
    return stepId === "nombre" ? (answers.nombre ?? "") : (answers.email ?? "");
  }

  const value =
    stepId === "situacion"
      ? answers.situacion
      : stepId === "tipo"
        ? answers.tipo
        : stepId === "catalogo"
          ? answers.catalogo
          : stepId === "web-actual"
            ? answers.webActual
            : stepId === "presupuesto"
              ? answers.presupuesto
              : answers.plazo;

  const option = step.options.find((candidate) => candidate.id === value);
  if (!option) return "";
  if (option.needsDetail && answers.situacionDetalle) {
    return `${option.label}: ${answers.situacionDetalle}`;
  }
  return option.label;
}

/** Texto de la respuesta para el payload (sheet): etiqueta + detalle libre. */
export function answerValue(stepId: StepId, answers: FunnelAnswers): string {
  return answerLabel(stepId, answers);
}
