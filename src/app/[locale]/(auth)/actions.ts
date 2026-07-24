"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapSupabaseErrorCode, type AuthErrorCode } from "@/lib/supabase/auth-errors";
import { fetchUserRole, homeForRole } from "@/lib/supabase/profile";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { authCallbackUrl } from "@/lib/supabase/callback-url";
import { isSafeRedirectPath } from "@/lib/supabase/safe-redirect";
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
import { OAUTH_PROVIDER_IDS, type OAuthProviderId } from "./oauth-providers";

type ActionResult = { error: AuthErrorCode | null };

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
  redirect(isSafeRedirectPath(next) ? next : homeForRole(role));
}

/**
 * Inscription self-service (§10.1) — rôle `artist` par défaut, ou `manager`
 * si `accountType === "label"` (ADR 0029, comptes Label Phase 1) : voir le
 * trigger `handle_new_user`, migration 20260722120000_label_accounts.sql,
 * qui lit `account_type` dans les métadonnées posées ici. Ne redirige pas :
 * la page affiche un état "vérifie ta boîte mail" sur place (§11.2 —
 * vérification email obligatoire avant paiement).
 */
export async function signUp(values: SignUpFormValues): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(values);
  if (!parsed.success) return { error: "unknown" };
  const { fullName, email, password, locale, accountType } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, locale, account_type: accountType },
      emailRedirectTo: authCallbackUrl({ type: "signup", locale }),
    },
  });

  if (error) return { error: mapSupabaseErrorCode(error) };
  return { error: null };
}

/**
 * Démarre un flux OAuth (§11.2 — Google `[MVP]`, Apple `[V1]` différé, voir
 * `oauth-providers.ts`). Générique par construction : activer un nouveau
 * provider ne demande pas de nouvelle Server Action, seulement une entrée
 * dans `OAUTH_PROVIDER_IDS` + les identifiants correspondants. Appelée comme
 * `action` de formulaire (`<form action={signInWithOAuth}>`) : ne retourne
 * jamais en cas de succès, redirige le navigateur vers le provider puis, via
 * `/api/auth/callback`, vers `/app`/`/admin`.
 */
export async function signInWithOAuth(formData: FormData): Promise<void> {
  const locale = (formData.get("locale") as AppLocale | null) ?? routing.defaultLocale;
  const next = formData.get("next") as string | null;
  const providerInput = formData.get("provider") as OAuthProviderId | null;

  if (!providerInput || !OAUTH_PROVIDER_IDS.includes(providerInput)) {
    const loginPath = getPathname({ href: "/connexion", locale });
    redirect(`${loginPath}?error=oauth_failed`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: providerInput,
    options: { redirectTo: authCallbackUrl({ locale, next: next ?? undefined }) },
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
    redirectTo: authCallbackUrl({ type: "recovery", locale }),
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
    options: { emailRedirectTo: authCallbackUrl({ type: "signup", locale }) },
  });

  if (error) return { error: mapSupabaseErrorCode(error) };
  return { error: null };
}
