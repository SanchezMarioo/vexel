import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email("Introduce un email valido.")
  .max(320, "El email es demasiado largo.")
  .transform((value) => value.toLowerCase());

export const credentialsSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, "La contrasena debe tener al menos 8 caracteres.")
    .max(72, "La contrasena es demasiado larga."),
});

export const registerSchema = credentialsSchema.extend({
  name: z
    .string()
    .trim()
    .min(2, "El nombre es demasiado corto.")
    .max(80, "El nombre es demasiado largo."),
});

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre es demasiado corto.")
    .max(80, "El nombre es demasiado largo."),
});

export type CredentialsInput = z.infer<typeof credentialsSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;