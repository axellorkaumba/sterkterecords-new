"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { UserIdentity } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapSupabaseErrorCode, type AuthErrorCode } from "@/lib/supabase/auth-errors";
import { authCallbackUrl } from "@/lib/supabase/callback-url";
import { sendSecurityAlertEmail } from "@/lib/email/send";
import type { SecurityEventType } from "@/lib/email/templates/security-alert";
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
  payoutMethodSchema,
  type UpdateProfileValues,
  type ChangePasswordValues,
  type VerifyMfaValues,
  type UpdateLocaleCurrencyValues,
  type UpdateNotificationsValues,
  type DeleteAccountValues,
  type PayoutMethodValues,
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

/**
 * Alerte de sécurité (§14, §17) — envoyée directement depuis l'action, en
 * plus du Send Email Hook Supabase qui gère potentiellement les mêmes
 * événements via ses types `*_notification` (documentation ambiguë sur le
 * déclenchement automatique, voir ADR 0011) : redondance volontaire plutôt
 * que de risquer de ne jamais alerter l'utilisateur.
 */
async function sendSecurityAlert(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  email: string | undefined,
  eventType: SecurityEventType,
): Promise<void> {
  if (!email) return;
  const { data } = await supabase.from("profiles").select("locale").eq("id", userId).single();
  const locale = (data?.locale as AppLocale | undefined) ?? "fr";
  await sendSecurityAlertEmail({
    to: email,
    locale,
    eventType,
    occurredAt: new Date().toLocaleDateString(locale),
  });
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
  await sendSecurityAlert(supabase, user.id, user.email, "password_changed");
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
  await sendSecurityAlert(supabase, user.id, user.email, "mfa_enrolled");
  revalidatePath("/app/parametres");
  return { error: null };
}

export async function disableMfa(factorId: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) return { error: mapSupabaseErrorCode(error) };

  await logAudit(user.id, "mfa_disabled", "profile", user.id);
  await sendSecurityAlert(supabase, user.id, user.email, "mfa_disabled");
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
  await sendSecurityAlert(supabase, user.id, user.email, "identity_unlinked");
  revalidatePath("/app/parametres");
  return { error: null };
}

/**
 * Moyen de retrait (§11.5, module Royalties) — `upsert` sur `user_id`
 * (contrainte unique, un seul moyen actif par compte). `details` stocke
 * tout ce qui n'est pas `method` (téléphone, email, coordonnées bancaires
 * selon le cas), validé par l'union discriminée `payoutMethodSchema`.
 */
export async function savePayoutMethod(values: PayoutMethodValues): Promise<ActionResult> {
  const parsed = payoutMethodSchema.safeParse(values);
  if (!parsed.success) return { error: "unknown" };
  const { supabase, user } = await requireUser();

  const { method, ...details } = parsed.data;

  const { error } = await supabase
    .from("payout_methods")
    .upsert({ user_id: user.id, method, details }, { onConflict: "user_id" });

  if (error) return { error: "unknown" };
  revalidatePath("/app/parametres");
  revalidatePath("/app/revenus");
  return { error: null };
}

/**
 * Résiliation de l'abonnement SOLO (§5, §15). Pour Stripe, on résilie
 * réellement l'abonnement côté PSP (le webhook `customer.subscription.deleted`
 * confirmera l'état en base, mais on marque aussi la ligne localement tout de
 * suite pour un retour immédiat). Pour Flutterwave, il n'existe pas
 * d'abonnement récurrent réel à résilier côté PSP (chaque échéance est un
 * paiement à l'acte, §11.5/ADR 0010) : on marque simplement l'intention de
 * ne pas renouveler, ce qui suffit à désactiver l'accès à l'échéance.
 */
export async function cancelSubscriptionAction(): Promise<{ error: string | null }> {
  const { supabase, user } = await requireUser();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, provider, external_id, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription || subscription.status !== "active") {
    return { error: "no_active_subscription" };
  }

  if (subscription.provider === "stripe" && subscription.external_id) {
    const { getStripeClient } = await import("@/lib/payments/stripe/client");
    await getStripeClient().subscriptions.cancel(subscription.external_id);
  }

  const admin = createAdminClient();
  await admin.from("subscriptions").update({ status: "canceled" }).eq("id", subscription.id);

  await logAudit(user.id, "subscription_canceled", "subscription", subscription.id);
  revalidatePath("/app/parametres");
  return { error: null };
}
