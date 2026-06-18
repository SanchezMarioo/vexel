import { z } from "zod";

/**
 * Shared between the client form (zodResolver) and the /api/contact route,
 * so validation rules live in exactly one place. No "server-only" here.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Dime tu nombre.")
    .max(80, "Ese nombre es demasiado largo.")
    .refine((v) => !/[<>]/.test(v), "El nombre contiene caracteres no permitidos."),
  email: z
    .string()
    .trim()
    .email("Introduce un email válido.")
    .max(320, "El email es demasiado largo."),
  message: z
    .string()
    .trim()
    .min(10, "Cuéntame algo más (mínimo 10 caracteres).")
    .max(2000, "El mensaje es demasiado largo."),
  // RGPD: consentimiento explícito obligatorio para tratar los datos del lead.
  consent: z
    .boolean()
    .refine((v) => v === true, "Debes aceptar la política de privacidad para enviar."),
  // Honeypot: humans leave it empty; bots tend to fill every field. It is
  // validated leniently here and inspected in the route so a filled value can
  // be dropped silently instead of surfacing a confusing error.
  company: z.string().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
