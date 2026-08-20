import "server-only";

import { steps, type FunnelAnswers } from "./content";
import type { FunnelInput } from "./schema";
import { sanitizeTextForStorage } from "@/lib/security/sanitize";

/**
 * Lead normalizado en servidor: texto recortado y acotado, email en minúsculas
 * y URLs de atribución reducidas a ruta (las UTMs viajan en sus propias
 * columnas; no se conservan query strings arbitrarios que puedan contener
 * datos personales). `labels` lleva las respuestas en el idioma del cliente
 * para el sheet y los emails internos.
 */
export interface NormalizedLead {
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  descripcion: string;
  situacion: string;
  situacionDetalle: string;
  tipo: string;
  objetivo: string;
  catalogo: string;
  webActual: string;
  presupuesto: string;
  plazo: string;
  landing_page: string;
  form_page: string;
  current_url: string;
  referrer: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  actualizacion: boolean;
  labels: {
    situacion: string;
    tipo: string;
    objetivo: string;
    catalogo: string;
    webActual: string;
    presupuesto: string;
    plazo: string;
  };
}

function normalizeText(value: string | undefined) {
  const cleaned = (value ?? "").replace(/\s+/g, " ").trim();
  return sanitizeTextForStorage(cleaned);
}

function normalizePage(value: string | undefined) {
  const normalized = normalizeText(value);
  if (!normalized) return "";

  try {
    const url = new URL(normalized);
    return url.pathname.slice(0, 500);
  } catch {
    return normalized.replace(/[\u0000-\u001f\u007f#]/g, "").slice(0, 500);
  }
}

function normalizeReferrer(value: string | undefined) {
  const normalized = normalizeText(value);
  if (!normalized) return "";

  try {
    const url = new URL(normalized);
    return `${url.origin}${url.pathname}`.slice(0, 1000);
  } catch {
    return normalized.replace(/[\u0000-\u001f\u007f#?]/g, "").slice(0, 1000);
  }
}

function optionLabel(stepId: keyof typeof steps, value: string | undefined) {
  if (!value) return "";
  const step = steps[stepId];
  if (step.kind !== "choice") return "";
  return step.options.find((option) => option.id === value)?.label ?? "";
}

export function buildLead(data: FunnelInput): NormalizedLead {
  const answers: FunnelAnswers = {
    situacion: data.situacion,
    tipo: data.tipo,
    objetivo: data.objetivo,
    catalogo: data.catalogo,
    webActual: data.webActual,
    presupuesto: data.presupuesto,
    plazo: data.plazo,
    descripcion: data.descripcion,
    nombre: data.nombre,
    empresa: data.empresa,
    email: data.email,
    telefono: data.telefono,
  };

  return {
    nombre: normalizeText(data.nombre),
    empresa: normalizeText(data.empresa),
    email: data.email.trim().toLowerCase(),
    telefono: normalizeText(data.telefono),
    descripcion: normalizeText(data.descripcion),
    situacion: data.situacion,
    situacionDetalle: (data.situacionDetalle ?? "").trim().replace(/\s+/g, " ").slice(0, 500),
    tipo: data.tipo,
    objetivo: data.objetivo ?? "",
    catalogo: data.catalogo ?? "",
    webActual: data.webActual ?? "",
    presupuesto: data.presupuesto,
    plazo: data.plazo,
    landing_page: normalizePage(data.landing_page),
    form_page: normalizePage(data.form_page),
    current_url: normalizePage(data.current_url),
    referrer: normalizeReferrer(data.referrer),
    utm_source: normalizeText(data.utm_source).slice(0, 100),
    utm_medium: normalizeText(data.utm_medium).slice(0, 100),
    utm_campaign: normalizeText(data.utm_campaign).slice(0, 150),
    utm_content: normalizeText(data.utm_content).slice(0, 150),
    utm_term: normalizeText(data.utm_term).slice(0, 150),
    actualizacion: data.actualizacion ?? false,
    labels: {
      situacion: optionLabel("situacion", answers.situacion),
      tipo: optionLabel("tipo", answers.tipo),
      objetivo: optionLabel("objetivo", answers.objetivo),
      catalogo: optionLabel("catalogo", answers.catalogo),
      webActual: optionLabel("web-actual", answers.webActual),
      presupuesto: optionLabel("presupuesto", answers.presupuesto),
      plazo: optionLabel("plazo", answers.plazo),
    },
  };
}
