import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email("Introduce un email valido.")
  .max(320, "El email es demasiado largo.")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "La contrasena debe tener al menos 8 caracteres.")
  .max(72, "La contrasena es demasiado larga.");

const strongPasswordSchema = passwordSchema
  .regex(/[a-z]/, "La contrasena debe incluir al menos una minuscula.")
  .regex(/[A-Z]/, "La contrasena debe incluir al menos una mayuscula.")
  .regex(/[0-9]/, "La contrasena debe incluir al menos un numero.");

const nameSchema = z
  .string()
  .trim()
  .min(2, "El nombre es demasiado corto.")
  .max(80, "El nombre es demasiado largo.")
  .refine((value) => !/[<>]/.test(value), "El nombre contiene caracteres no permitidos.");

export const credentialsSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  email: emailSchema,
  password: strongPasswordSchema,
  name: nameSchema,
});

export const profileSchema = z.object({
  name: nameSchema,
});

export const requestSchema = z.object({
  title: z.string().trim().min(3, "El titulo es demasiado corto.").max(120, "El titulo es demasiado largo."),
  description: z.string().trim().min(10, "La descripcion es demasiado corta.").max(2000, "La descripcion es demasiado larga."),
  projectType: z.enum(["landing_page", "local_campaign", "ecommerce", "other"], {
    error: "Tipo de proyecto no valido.",
  }),
  budget: z.string().trim().max(100, "El presupuesto es demasiado largo.").optional(),
  referenceUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => !v || v === "" || /^https?:\/\/.+/.test(v), "Introduce una URL valida.")
    .optional(),
});

export const messageSchema = z.object({
  content: z.string().trim().min(1, "El mensaje no puede estar vacio.").max(4000, "El mensaje es demasiado largo."),
});

export type CredentialsInput = z.infer<typeof credentialsSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type RequestInput = z.infer<typeof requestSchema>;
export type MessageInput = z.infer<typeof messageSchema>;