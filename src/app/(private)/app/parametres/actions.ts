"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { UserIdentity } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapSupabaseErrorCode, type AuthErrorCode } from "@/lib/supabase/auth-errors";
import { authCallbackUrl } from "@/lib/supabase/callback-url";
import { LOCALE_COOKIE_NAME, type AppLocale } from "@/i18n/routing";
import {
  OAUTH_PROVIDER_IDS,
  getEnabledOAuthProviders,
  type OAuthProviderId,
} from "@/app/[locale]/(auth)/oauth-providers";
import {
  updateProfileSchema,
  changePasswordSchema,
  verifyMfaSchema,
  updateLocaleCurrencySchema,
  updateNotificationsSchema,
  deleteAccountSchema,
  type UpdateProfileValues,
  type ChangePasswordValues,
  type VerifyMfaValues,
  type UpdateLocaleCurrencyValues,
  type UpdateNotificationsValues,
  type DeleteAccountValues,
} from "./schemas";

type ActionResult = { error: AuthErrorCode | null };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("[parametres] Action appelée sans session active.");
  }
  return { supabase, user };
}

/** Écrit dans audit_log via le client service_role — jamais depuis le client (§17). */
async function logAudit(
  actorId: string,
  action: string,
  entity: string,
  entityId?: string,
): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from("audit_log")
    .insert({ actor_id: actorId, action, entity, entity_id: entityId ?? null });
}

export async function updateProfile(values: UpdateProfileValues): Promise<ActionResult> {
  const parsed = updateProfileSchema.safeParse(values);
  if (!parsed.success) return { error: "unknown" };
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      country: parsed.data.country || null,
    })
    .eq("id", user.id);

  if (error) return { error: "unknown" };
  revalidatePath("/app/parametres");
  return { error: null };
}

export async function changePassword(values: ChangePasswordValues): Promise<ActionResult> {
  const parsed = changePasswordSchema.safeParse(values);
  if (!parsed.success) return { error: "unknown" };
  const { supabase, user } = await requireUser();

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: mapSupabaseErrorCode(error) };

  await logAudit(user.id, "password_changed", "profile", user.id);
  return { error: null };
}

/** Démarre l'enrôlement TOTP — retourne le QR code (SVG data URI) + secret manuel. */
export async function enrollMfa(): Promise<{
  error: AuthErrorCode | null;
  factorId?: string;
  qrCode?: string;
  secret?: string;
}> {
  const { supabase } = await requireUser();

  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
  if (error) return { error: mapSupabaseErrorCode(error) };

  return {
    error: null,
    factorId: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
  };
}

export async function verifyMfaEnrollment(values: VerifyMfaValues): Promise<ActionResult> {
  const parsed = verifyMfaSchema.safeParse(values);
  if (!parsed.success) return { error: "unknown" };
  const { supabase, user } = await requireUser();

  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: parsed.data.factorId,
    code: parsed.data.code,
  });
  if (error) return { error: mapSupabaseErrorCode(error) };

  await logAudit(user.id, "mfa_enabled", "profile", user.id);
  revalidatePath("/app/parametres");
  return { error: null };
}

export async function disableMfa(factorId: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) return { error: mapSupabaseErrorCode(error) };

  await logAudit(user.id, "mfa_disabled", "profile", user.id);
  revalidatePath("/app/parametres");
  return { error: null };
}

/** Déconnexion de tous les appareils (§11.2) — pas de table de sessions dédiée, voir ADR 0007. */
export async function signOutEverywhere(): Promise<void> {
  const { supabase } = await requireUser();
  await supabase.auth.signOut({ scope: "global" });
  redirect("/");
}

export async function updateLocaleAndCurrency(
  values: UpdateLocaleCurrencyValues,
): Promise<ActionResult> {
  const parsed = updateLocaleCurrencySchema.safeParse(values);
  if (!parsed.success) return { error: "unknown" };
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("profiles")
    .update({ locale: parsed.data.locale, currency: parsed.data.currency })
    .eq("id", user.id);
  if (error) return { error: "unknown" };

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, parsed.data.locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/app/parametres");
  return { error: null };
}

export async function updateNotifications(
  values: UpdateNotificationsValues,
): Promise<ActionResult> {
  const parsed = updateNotificationsSchema.safeParse(values);
  if (!parsed.success) return { error: "unknown" };
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("profiles")
    .update({ notify_email: parsed.data.notifyEmail, notify_whatsapp: parsed.data.notifyWhatsapp })
    .eq("id", user.id);
  if (error) return { error: "unknown" };

  revalidatePath("/app/parametres");
  return { error: null };
}

/**
 * Suppression de compte (RGPD, §11.2/§17) — revérifie le mot de passe avant
 * toute suppression, puis supprime `auth.users` via le client service_role
 * (cascade vers `profiles` par FK `on delete cascade`, voir migration
 * 20260704140000). Journalisée avant suppression (l'acteur n'existera plus
 * après).
 */
export async function deleteAccount(values: DeleteAccountValues): Promise<ActionResult> {
  const parsed = deleteAccountSchema.safeParse(values);
  if (!parsed.success) return { error: "unknown" };
  const { supabase, user } = await requireUser();

  if (!user.email) return { error: "unknown" };

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.password,
  });
  if (reauthError) return { error: mapSupabaseErrorCode(reauthError) };

  await logAudit(user.id, "account_deleted", "profile", user.id);

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { error: "unknown" };

  await supabase.auth.signOut({ scope: "global" });
  redirect("/");
}

/**
 * Comptes liés (§11.2) — architecture prête pour Apple dès que le provider
 * sera activé (voir docs/adr/0007-auth-architecture.md) : ces deux actions
 * fonctionnent déjà pour n'importe quel provider de `OAUTH_PROVIDER_IDS`,
 * sans changement de code à l'activation.
 */
export async function linkOAuthIdentity(
  provider: OAuthProviderId,
  locale: AppLocale,
): Promise<void> {
  if (!OAUTH_PROVIDER_IDS.includes(provider) || !getEnabledOAuthProviders().includes(provider)) {
    return;
  }

  const { supabase } = await requireUser();
  const { data, error } = await supabase.auth.linkIdentity({
    provider,
    options: { redirectTo: authCallbackUrl({ locale, next: "/app/parametres" }) },
  });

  if (!error && data.url) {
    redirect(data.url);
  }
}

export async function unlinkOAuthIdentity(identity: UserIdentity): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const { error } = await supabase.auth.unlinkIdentity(identity);
  if (error) return { error: mapSupabaseErrorCode(error) };

  await logAudit(user.id, "oauth_identity_unlinked", "profile", user.id);
  revalidatePath("/app/parametres");
  return { error: null };
}
