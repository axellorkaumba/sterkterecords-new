import { z } from "zod";
import { routing } from "@/i18n/routing";

const localeEnum = z.enum([...routing.locales]);

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  country: z.string().length(2).optional().or(z.literal("")),
});
export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "passwordsMismatch",
  });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const verifyMfaSchema = z.object({
  factorId: z.string().min(1),
  code: z.string().length(6),
});
export type VerifyMfaValues = z.infer<typeof verifyMfaSchema>;

export const updateLocaleCurrencySchema = z.object({
  locale: localeEnum,
  currency: z.string().length(3),
});
export type UpdateLocaleCurrencyValues = z.infer<typeof updateLocaleCurrencySchema>;

export const updateNotificationsSchema = z.object({
  notifyEmail: z.boolean(),
  notifyWhatsapp: z.boolean(),
});
export type UpdateNotificationsValues = z.infer<typeof updateNotificationsSchema>;

export const deleteAccountSchema = z.object({
  password: z.string().min(1),
});
export type DeleteAccountValues = z.infer<typeof deleteAccountSchema>;
