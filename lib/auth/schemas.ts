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

export type CredentialsInput = z.infer<typeof credentialsSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;