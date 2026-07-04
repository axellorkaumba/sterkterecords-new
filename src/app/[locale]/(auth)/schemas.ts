import { z } from "zod";
import { routing } from "@/i18n/routing";

/**
 * Schémas Zod partagés entre les Server Actions (`actions.ts`) et les
 * formulaires Client Components (validation immédiate côté client, via
 * `@hookform/resolvers/zod`). Un fichier `"use server"` ne peut exporter que
 * des fonctions (contrainte Next.js) — ces schémas vivent donc à part.
 */

const localeEnum = z.enum([...routing.locales]);

export const signInSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(8),
  locale: localeEnum,
  // `boolean` (pas `z.literal(true)`) pour que le formulaire puisse
  // initialiser le champ à `false` — la contrainte "doit être coché" est
  // portée par `.refine`, le message est géré manuellement côté formulaire
  // (voir Auth.validation.termsRequired).
  acceptTerms: z.boolean().refine((value) => value === true),
});
export type SignUpFormValues = z.infer<typeof signUpSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
  locale: localeEnum,
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const updatePasswordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "passwordsMismatch",
  });
export type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>;

export const resendSchema = z.object({
  email: z.string().trim().email(),
  locale: localeEnum,
});
export type ResendValues = z.infer<typeof resendSchema>;
