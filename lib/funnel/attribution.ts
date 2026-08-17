/**
 * Atribución de entrada para el funnel (/empezar).
 *
 * `captureEntryPoint()` se ejecuta una vez por carga completa de página (está
 * montada en ClientEffects, que vive en el layout raíz): guarda en
 * sessionStorage la PRIMERA página vista de la sesión (ruta + query, donde
 * viajan las UTMs) y el referrer externo. Así, si el usuario navega por la web
 * antes de enviar el formulario, no se pierde su landing original.
 * `getAttribution()` se llama al enviar y adjunta landing original, página del
 * formulario, URL actual, referrer y UTMs. Todo permanece en el navegador
 * hasta el envío; nada viaja a analytics.
 */

const STORAGE_KEY = "xync:funnel:entry";

interface EntryPoint {
  landing: string;
  referrer: string;
}

function readEntryPoint(): EntryPoint | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<EntryPoint>;
    if (typeof parsed.landing !== "string") return null;
    return { landing: parsed.landing, referrer: typeof parsed.referrer === "string" ? parsed.referrer : "" };
  } catch {
    return null;
  }
}

export function captureEntryPoint() {
  try {
    if (readEntryPoint()) return;

    const referrer =
      document.referrer && new URL(document.referrer).origin !== window.location.origin
        ? document.referrer
        : "";

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        landing: `${window.location.pathname}${window.location.search}`,
        referrer,
      }),
    );
  } catch {
    // sessionStorage no disponible (modo privado estricto): seguimos sin atribución.
  }
}

export interface Attribution {
  landing_page: string;
  form_page: string;
  current_url: string;
  referrer: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

function utmsFrom(urlString: string): Partial<Attribution> {
  try {
    const params = new URL(urlString, window.location.origin).searchParams;
    const pick = (key: string) => params.get(key) ?? undefined;
    return {
      utm_source: pick("utm_source"),
      utm_medium: pick("utm_medium"),
      utm_campaign: pick("utm_campaign"),
      utm_content: pick("utm_content"),
      utm_term: pick("utm_term"),
    };
  } catch {
    return {};
  }
}

export function getAttribution(): Attribution {
  const entry = readEntryPoint();

  // UTMs de la landing original; si no hubo sesión previa (entrada directa al
  // funnel), las de la URL actual.
  const utms = entry ? utmsFrom(entry.landing) : utmsFrom(window.location.href);

  return {
    landing_page: entry?.landing ?? `${window.location.pathname}${window.location.search}`,
    form_page: "/empezar",
    current_url: window.location.href,
    referrer: entry?.referrer ?? "",
    ...utms,
  };
}
