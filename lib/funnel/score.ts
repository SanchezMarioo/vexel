import type { NormalizedLead } from "./lead";

export interface LeadScore {
  value: number;
  /** Temperatura del lead: alta (HOT) / media (WARM) / baja (COLD). */
  tier: "alta" | "media" | "baja";
  reasons: string[];
}

/**
 * Scoring determinista sobre los cuatro ejes de cualificación del funnel
 * (inversión, plazo, tipo de proyecto, situación). Sin ML: pesos manuales,
 * fáciles de ajustar. Máximo teórico: 40 + 30 + 15 + 15 = 100.
 */
export function scoreLead(lead: NormalizedLead): LeadScore {
  let value = 0;
  const reasons: string[] = [];

  switch (lead.presupuesto) {
    case "mas-6000":
      value += 40;
      reasons.push("inversión alta");
      break;
    case "3000-6000":
      value += 30;
      reasons.push("inversión media-alta");
      break;
    case "1000-3000":
      value += 20;
      break;
    default:
      value += 5;
  }

  switch (lead.plazo) {
    case "cuanto-antes":
      value += 30;
      reasons.push("plazo inmediato");
      break;
    case "1-3-meses":
      value += 20;
      reasons.push("plazo próximo");
      break;
    case "mas-adelante":
      value += 10;
      break;
    default:
      value += 5;
  }

  switch (lead.tipo) {
    case "tienda":
      value += 15;
      reasons.push("tienda online");
      break;
    case "web-nueva":
      value += 12;
      reasons.push("proyecto desde cero");
      break;
    case "redisenar":
      value += 8;
      break;
    default:
      value += 5;
  }

  switch (lead.situacion) {
    case "vender-online":
      value += 15;
      reasons.push("quiere vender online");
      break;
    case "no-convierte":
      value += 12;
      reasons.push("web que no convierte");
      break;
    case "nuevo":
      value += 10;
      break;
    case "lenta":
      value += 8;
      break;
    default:
      value += 5;
  }

  return {
    value: Math.min(value, 100),
    tier: value >= 65 ? "alta" : value >= 40 ? "media" : "baja",
    reasons,
  };
}
