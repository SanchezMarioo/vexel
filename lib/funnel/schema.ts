import { z } from "zod";
import {
  CATALOGO_IDS,
  OBJETIVO_IDS,
  PLAZO_IDS,
  PRESUPUESTO_IDS,
  SITUACION_IDS,
  TIPO_IDS,
  WEB_ACTUAL_IDS,
} from "./content";

const optionalText = (max: number) => z.string().trim().max(max).optional();
const pageField = optionalText(500);
const utmField = optionalText(150);

/**
 * Contrato completo del funnel: preguntas + consentimiento + honeypot +
 * atribución de marketing (primera landing, página del formulario, referrer
 * externo y UTMs). Se comparte entre el cliente (validación por paso y envío)
 * y /api/funnel, que siempre vuelve a ejecutarlo. Las reglas de ramificación
 * se validan aquí una sola vez: catálogo solo para tienda, web actual solo
 * para arreglar/rediseñar y detalle libre obligatorio cuando la situación
 * es "otra".
 */
export const funnelSchema = z
  .object({
    situacion: z.enum(SITUACION_IDS, {
      message: "Selecciona una opción sobre tu situación actual.",
    }),
    situacionDetalle: z.string().trim().max(500, "Con una línea nos vale.").optional(),
    tipo: z.enum(TIPO_IDS, {
      message: "Selecciona qué tipo de proyecto necesitas.",
    }),
    objetivo: z
      .enum(OBJETIVO_IDS, {
        message: "Selecciona el objetivo de tu web.",
      })
      .optional(),
    catalogo: z
      .enum(CATALOGO_IDS, {
        message: "Selecciona el tamaño aproximado de tu catálogo.",
      })
      .optional(),
    webActual: z
      .enum(WEB_ACTUAL_IDS, {
        message: "Selecciona el estado de tu web actual.",
      })
      .optional(),
    presupuesto: z.enum(PRESUPUESTO_IDS, {
      message: "Selecciona un rango de presupuesto orientativo.",
    }),
    plazo: z.enum(PLAZO_IDS, {
      message: "Selecciona el plazo estimado para tu proyecto.",
    }),
    descripcion: z.string().trim().max(2000, "El texto es demasiado largo.").optional(),
    nombre: z
      .string()
      .trim()
      .min(2, "Dime tu nombre.")
      .max(80, "Ese nombre es demasiado largo.")
      .refine((value) => !/[<>]/.test(value), "El nombre contiene caracteres no permitidos."),
    empresa: z.string().trim().max(120, "El nombre de la empresa es demasiado largo.").optional(),
    email: z
      .string()
      .trim()
      .email("Introduce un email válido.")
      .max(320, "El email es demasiado largo."),
    telefono: z
      .string()
      .trim()
      .max(40, "El número de teléfono o móvil es demasiado largo.")
      .optional(),
    // RGPD: consentimiento explícito obligatorio para tratar los datos del lead.
    consent: z
      .boolean()
      .refine((value) => value === true, "Debes aceptar la política de privacidad para enviar."),
    // Segunda entrega tras editar respuestas en el resumen.
    actualizacion: z.boolean().optional(),
    // Honeypot: los humanos lo dejan vacío; los bots suelen rellenarlo todo.
    company: z.string().max(200).optional(),
    // ── Atribución (se rellena desde el navegador al enviar) ──
    landing_page: pageField,
    form_page: pageField,
    current_url: pageField,
    referrer: optionalText(1000),
    utm_source: utmField,
    utm_medium: utmField,
    utm_campaign: optionalText(150),
    utm_content: utmField,
    utm_term: utmField,
  })
  .superRefine((data, ctx) => {
    if (data.situacion === "otra" && (!data.situacionDetalle || data.situacionDetalle.length < 2)) {
      ctx.addIssue({
        code: "custom",
        path: ["situacionDetalle"],
        message: "Cuéntanoslo en una línea.",
      });
    }

    if (data.tipo === "tienda" && !data.catalogo) {
      ctx.addIssue({ code: "custom", path: ["catalogo"], message: "Elige una opción." });
    }

    if ((data.tipo === "arreglar" || data.tipo === "redisenar") && !data.webActual) {
      ctx.addIssue({ code: "custom", path: ["webActual"], message: "Elige una opción." });
    }
  });

export type FunnelInput = z.infer<typeof funnelSchema>;
