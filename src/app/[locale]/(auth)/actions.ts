"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapSupabaseErrorCode, type AuthErrorCode } from "@/lib/supabase/auth-errors";
import { fetchUserRole, homeForRole } from "@/lib/supabase/profile";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { clientEnv } from "@/lib/env";
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  updatePasswordSchema,
  resendSchema,
  type SignInValues,
  type SignUpFormValues,
  type ForgotPasswordValues,
  type UpdatePasswordValues,
  type ResendValues,
} from "./schemas";

type ActionResult = { error: AuthErrorCode | null };

function callbackUrl(params: Record<string, string | undefined>): string {
  const url = new URL("/api/auth/callback", clientEnv.NEXT_PUBLIC_SITE_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

/**
 * Connexion email + mot de passe (§11.2, MVP). En cas de succès, redirige
 * directement (ne retourne jamais) vers `/app` ou `/admin` selon le rôle —
 * `src/proxy.ts` fera de toute façon respecter cette même règle pour toute
 * visite ultérieure, cette redirection immédiate évite juste un aller-retour.
 */
export async function signIn(values: SignInValues, next?: string): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(values);
  if (!parsed.success) return { error: "unknown" };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: mapSupabaseErrorCode(error) };
  }

  const role = await fetchUserRole(supabase, data.user.id);
  redirect(next && next.startsWith("/") ? next : homeForRole(role));
}

/**
 * Inscription self-service (§10.1) — toujours rôle `artist` par défaut (voir
 * le trigger `handle_new_user`, migration 20260704140000). Ne redirige pas :
 * la page affiche un état "vérifie ta boîte mail" sur place (§11.2 —
 * vérification email obligatoire avant paiement).
 */
export async function signUp(values: SignUpFormValues): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(values);
  if (!parsed.success) return { error: "unknown" };
  const { fullName, email, password, locale } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, locale },
      emailRedirectTo: callbackUrl({ type: "signup", locale }),
    },
  });

  if (error) return { error: mapSupabaseErrorCode(error) };
  return { error: null };
}

/**
 * Démarre le flux OAuth Google (§3.1, MVP). Appelée comme `action` de
 * formulaire (`<form action={signInWithGoogle}>`) : ne retourne jamais en cas
 * de succès, redirige le navigateur vers Google puis, via
 * `/api/auth/callback`, vers `/app`/`/admin`.
 */
export async function signInWithGoogle(formData: FormData): Promise<void> {
  const locale = (formData.get("locale") as AppLocale | null) ?? routing.defaultLocale;
  const next = formData.get("next") as string | null;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl({ locale, next: next ?? undefined }) },
  });

  if (error || !data.url) {
    const loginPath = getPathname({ href: "/connexion", locale });
    redirect(`${loginPath}?error=oauth_failed`);
  }

  redirect(data.url);
}

/**
 * Demande de réinitialisation (§11.2). Retourne toujours `{ error: null }`
 * pour une adresse au format valide, même si le compte n'existe pas — c'est
 * aussi le comportement natif de Supabase, qui évite l'énumération de
 * comptes (§17).
 */
export async function requestPasswordReset(values: ForgotPasswordValues): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) return { error: "unknown" };
  const { email, locale } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callbackUrl({ type: "recovery", locale }),
  });

  if (error) return { error: mapSupabaseErrorCode(error) };
  return { error: null };
}

/**
 * Définit un nouveau mot de passe — appelée depuis
 * `/reinitialiser-mot-de-passe`, uniquement accessible avec la session de
 * récupération temporaire créée par `/api/auth/callback?type=recovery`.
 */
export async function updatePasswordAfterRecovery(
  values: UpdatePasswordValues,
): Promise<ActionResult> {
  const parsed = updatePasswordSchema.safeParse(values);
  if (!parsed.success) return { error: "unknown" };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) return { error: mapSupabaseErrorCode(error) };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = user ? await fetchUserRole(supabase, user.id) : null;
  redirect(homeForRole(role));
}

export async function resendVerificationEmail(values: ResendValues): Promise<ActionResult> {
  const parsed = resendSchema.safeParse(values);
  if (!parsed.success) return { error: "unknown" };
  const { email, locale } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: callbackUrl({ type: "signup", locale }) },
  });

  if (error) return { error: mapSupabaseErrorCode(error) };
  return { error: null };
}
