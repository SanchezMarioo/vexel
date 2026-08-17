import { track } from "@vercel/analytics";

/**
 * Eventos del funnel sobre la analítica ya presente en el sitio (Vercel
 * Analytics, sin cookies). Solo propiedades no identificables: ids de paso y
 * contadores, nunca nombre/email/teléfono.
 */
export type FunnelEvent =
  | "lead_form_view"
  | "lead_form_start"
  | "lead_form_step_completed"
  | "lead_form_submit"
  | "lead_form_success"
  | "calendly_click"
  | "meeting_booked";

export function trackFunnelEvent(
  name: FunnelEvent,
  data?: Record<string, string | number | boolean>,
) {
  try {
    track(name, data);
  } catch {
    // Un fallo de analytics nunca debe interferir con el funnel.
  }
}
