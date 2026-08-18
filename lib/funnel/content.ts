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

export const TIPO_IDS = [
  "web-nueva",
  "arreglar",
  "redisenar",
  "tienda",
] as const;

export const OBJETIVO_IDS = [
  "captar-clientes",
  "vender-online",
  "imagen-profesional",
  "automatizar",
  "producto-digital",
  "seo",
  "otro",
] as const;

export const CATALOGO_IDS = ["menos-50", "50-500", "mas-500", "no-se"] as const;

export const WEB_ACTUAL_IDS = [
  "wordpress",
  "a-medida",
  "builder",
  "no-se",
] as const;

export const PRESUPUESTO_IDS = [
  "menos-500",
  "500-1000",
  "1000-2500",
  "2500-5000",
  "mas-5000",
  "no-claro",
  "menos-1000",
  "1000-3000",
  "3000-6000",
  "mas-6000",
] as const;

export const PLAZO_IDS = [
  "cuanto-antes",
  "1-3-meses",
  "mas-adelante",
  "explorando",
] as const;

export interface FunnelOption {
  id: string;
  label: string;
  /** Tras elegir esta opción se pide un detalle en texto libre. */
  needsDetail?: boolean;
}

export interface ChoiceStep {
  id: StepId;
  kind: "choice";
  /** Etiqueta corta para el registro y resumen del lead. */
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
  type: "text" | "email" | "tel" | "textarea";
  autoComplete: string;
  /** Permite mostrar el campo como textarea. */
  multiline?: boolean;
  /** El paso lleva el consentimiento RGPD debajo del campo. */
  withConsent?: boolean;
}

export type FunnelStep = ChoiceStep | InputStep;

export type StepId =
  | "situacion"
  | "tipo"
  | "objetivo"
  | "catalogo"
  | "web-actual"
  | "presupuesto"
  | "plazo"
  | "descripcion"
  | "nombre"
  | "empresa"
  | "email"
  | "telefono";

export interface FunnelAnswers {
  situacion?: string;
  /** Texto libre cuando la situación elegida es "otra". */
  situacionDetalle?: string;

  tipo?: string;
  objetivo?: string;

  catalogo?: string;
  webActual?: string;

  presupuesto?: string;
  plazo?: string;

  descripcion?: string;

  nombre?: string;
  empresa?: string;
  email?: string;
  telefono?: string;
}

export const steps: Record<StepId, FunnelStep> = {
  situacion: {
    id: "situacion",
    kind: "choice",
    record: "Situación",
    question: "¿Qué te trae por aquí?",
    options: [
      {
        id: "lenta",
        label: "Mi web va lenta, falla o se quedó corta",
      },
      {
        id: "no-convierte",
        label: "Mi web no vende ni convierte lo que debería",
      },
      {
        id: "nuevo",
        label: "Quiero lanzar una web o un producto desde cero",
      },
      {
        id: "vender-online",
        label: "Quiero vender online sin depender de terceros",
      },
      {
        id: "otra",
        label: "Otra cosa — te la cuento",
        needsDetail: true,
      },
    ],
  },

  tipo: {
    id: "tipo",
    kind: "choice",
    record: "Proyecto",
    question: "¿Qué quieres construir o mejorar?",
    options: [
      {
        id: "web-nueva",
        label: "Una web o landing nueva",
      },
      {
        id: "arreglar",
        label: "Arreglar y mejorar mi web actual",
      },
      {
        id: "redisenar",
        label: "Rediseñar mi web por completo",
      },
      {
        id: "tienda",
        label: "Una tienda online propia",
      },
    ],
  },

  objetivo: {
    id: "objetivo",
    kind: "choice",
    record: "Objetivo",
    question: "¿Qué quieres conseguir con el proyecto?",
    options: [
      {
        id: "captar-clientes",
        label: "Conseguir más clientes",
      },
      {
        id: "vender-online",
        label: "Vender más online",
      },
      {
        id: "imagen-profesional",
        label: "Dar una imagen más profesional",
      },
      {
        id: "automatizar",
        label: "Automatizar procesos de mi negocio",
      },
      {
        id: "producto-digital",
        label: "Crear un producto digital",
      },
      {
        id: "seo",
        label: "Conseguir más visibilidad en Google",
      },
      {
        id: "otro",
        label: "Otro objetivo",
      },
    ],
  },

  catalogo: {
    id: "catalogo",
    kind: "choice",
    record: "Catálogo",
    question: "¿Cuántos productos tendría la tienda?",
    options: [
      {
        id: "menos-50",
        label: "Menos de 50",
      },
      {
        id: "50-500",
        label: "Entre 50 y 500",
      },
      {
        id: "mas-500",
        label: "Más de 500",
      },
      {
        id: "no-se",
        label: "Todavía no lo sé",
      },
    ],
  },

  "web-actual": {
    id: "web-actual",
    kind: "choice",
    record: "Web actual",
    question: "¿Sobre qué trabajamos hoy?",
    options: [
      {
        id: "wordpress",
        label: "WordPress o una plataforma similar",
      },
      {
        id: "a-medida",
        label: "Una web hecha a medida",
      },
      {
        id: "builder",
        label: "Un constructor como Wix o Squarespace",
      },
      {
        id: "no-se",
        label: "No lo sé",
      },
    ],
  },

  presupuesto: {
    id: "presupuesto",
    kind: "choice",
    record: "Inversión",
    question: "¿Qué inversión tienes en mente?",
    why: "Nos ayuda a proponerte algo realista desde el principio. El precio definitivo dependerá del proyecto.",
    options: [
      {
        id: "menos-500",
        label: "Menos de 500 €",
      },
      {
        id: "500-1000",
        label: "Entre 500 y 1.000 €",
      },
      {
        id: "1000-2500",
        label: "Entre 1.000 y 2.500 €",
      },
      {
        id: "2500-5000",
        label: "Entre 2.500 y 5.000 €",
      },
      {
        id: "mas-5000",
        label: "Más de 5.000 €",
      },
      {
        id: "no-claro",
        label: "Aún no lo tengo claro",
      },
    ],
  },

  plazo: {
    id: "plazo",
    kind: "choice",
    record: "Plazo",
    question: "¿Cuándo te gustaría empezar?",
    options: [
      {
        id: "cuanto-antes",
        label: "Cuanto antes",
      },
      {
        id: "1-3-meses",
        label: "En uno a tres meses",
      },
      {
        id: "mas-adelante",
        label: "Más adelante",
      },
      {
        id: "explorando",
        label: "Estoy explorando opciones",
      },
    ],
  },

  descripcion: {
    id: "descripcion",
    kind: "input",
    record: "Proyecto",
    question: "Cuéntanos un poco más sobre tu proyecto",
    placeholder:
      "Qué necesitas, qué tienes actualmente y qué te gustaría conseguir...",
    type: "textarea",
    autoComplete: "off",
    multiline: true,
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

  empresa: {
    id: "empresa",
    kind: "input",
    record: "Empresa",
    question: "¿Cómo se llama tu empresa?",
    placeholder: "Nombre de tu empresa",
    type: "text",
    autoComplete: "organization",
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

  telefono: {
    id: "telefono",
    kind: "input",
    record: "Teléfono",
    question: "¿Quieres dejarnos un teléfono?",
    placeholder: "+34 600 000 000",
    type: "tel",
    autoComplete: "tel",
  },
};

/**
 * Secuencia de pasos según lo respondido.
 *
 * - Tienda añade catálogo.
 * - Arreglar/rediseñar añaden la plataforma actual.
 * - Todos pasan por objetivo, presupuesto, plazo y descripción.
 * - El teléfono es opcional y queda al final.
 */
export function stepSequence(answers: FunnelAnswers): StepId[] {
  const sequence: StepId[] = ["situacion", "tipo", "objetivo"];

  if (answers.tipo === "tienda") {
    sequence.push("catalogo");
  }

  if (answers.tipo === "arreglar" || answers.tipo === "redisenar") {
    sequence.push("web-actual");
  }

  sequence.push(
    "presupuesto",
    "plazo",
    "descripcion",
    "nombre",
    "empresa",
    "email",
    "telefono",
  );

  return sequence;
}

/**
 * Frase de tramo para el contador.
 * No mostramos una barra de progreso tradicional:
 * la experiencia se divide en pequeños bloques para reducir
 * la sensación de formulario largo.
 */
export function phaseFor(index: number, total: number): string {
  if (index < 2) return "Primero, tu proyecto.";
  if (index < total - 4) return "Ahora, lo importante.";
  return "Ya casi está.";
}

/**
 * Etiqueta legible de una respuesta para el registro
 * y el resumen del lead.
 */
export function answerLabel(stepId: StepId, answers: FunnelAnswers): string {
  const step = steps[stepId];

  if (step.kind === "input") {
    switch (stepId) {
      case "nombre":
        return answers.nombre ?? "";
      case "empresa":
        return answers.empresa ?? "";
      case "email":
        return answers.email ?? "";
      case "telefono":
        return answers.telefono ?? "";
      case "descripcion":
        return answers.descripcion ?? "";
      default:
        return "";
    }
  }

  const value =
    stepId === "situacion"
      ? answers.situacion
      : stepId === "tipo"
        ? answers.tipo
        : stepId === "objetivo"
          ? answers.objetivo
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
