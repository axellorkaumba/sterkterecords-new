import { NextResponse, type NextRequest } from "next/server";
import { Webhook } from "standardwebhooks";
import { requireEnv, clientEnv } from "@/lib/env";
import { routing, type AppLocale } from "@/i18n/routing";
import { sendConfirmEmail, sendPasswordResetEmail, sendSecurityAlertEmail } from "@/lib/email/send";
import type { ConfirmEmailActionType } from "@/lib/email/templates/confirm-email";
import type { SecurityEventType } from "@/lib/email/templates/security-alert";

interface SendEmailHookPayload {
  user: {
    id: string;
    email: string;
    user_metadata?: { locale?: string };
  };
  email_data: {
    token_hash: string;
    token_hash_new?: string;
    redirect_to: string;
    email_action_type: string;
  };
}

const CONFIRM_ACTION_TYPES: Record<string, ConfirmEmailActionType> = {
  signup: "signup",
  invite: "invite",
  magiclink: "magiclink",
  email_change: "email_change",
  reauthentication: "reauthentication",
};

const SECURITY_EVENT_TYPES: Record<string, SecurityEventType> = {
  password_changed_notification: "password_changed",
  email_changed_notification: "email_changed",
  identity_linked_notification: "identity_linked",
  identity_unlinked_notification: "identity_unlinked",
  mfa_factor_enrolled_notification: "mfa_enrolled",
  mfa_factor_unenrolled_notification: "mfa_disabled",
};

function normalizeLocale(locale: string | undefined): AppLocale {
  return (routing.locales as readonly string[]).includes(locale ?? "")
    ? (locale as AppLocale)
    : routing.defaultLocale;
}

function buildVerifyUrl(tokenHash: string, actionType: string, redirectTo: string): string {
  const supabaseUrl = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error(
      "[email-hook] NEXT_PUBLIC_SUPABASE_URL doit être défini dans .env.local (voir .env.example).",
    );
  }
  const url = new URL(`${supabaseUrl}/auth/v1/verify`);
  // GoTrue attend le paramètre `token` sur le endpoint GET /verify (celui
  // cliqué depuis l'email) — `token_hash` est le nom du champ côté payload
  // du webhook et côté `supabase.auth.verifyOtp()`, mais PAS celui attendu
  // ici. Avec le mauvais nom, GoTrue ne reçoit aucun token exploitable : le
  // lien ne confirme jamais le compte (repéré en prod, retour Axel).
  url.searchParams.set("token", tokenHash);
  url.searchParams.set("type", actionType);
  url.searchParams.set("redirect_to", redirectTo);
  return url.toString();
}

/**
 * Supabase Auth "Send Email Hook" (§14) — remplace le template email par
 * défaut de Supabase par nos gabarits React Email/Resend, sur tous les
 * flux d'authentification (inscription, lien magique, invitation,
 * changement d'email, réauthentification, réinitialisation) ainsi que les
 * notifications de sécurité (mot de passe changé, 2FA activée/désactivée,
 * comptes liés/déliés) — si Supabase les déclenche automatiquement
 * (documentation ambiguë sur ce point précis, voir ADR 0011 ; ces mêmes
 * alertes sont aussi envoyées directement depuis les Server Actions
 * concernées, en redondance volontaire).
 *
 * **Prérequis externe non automatisable depuis ce repo** : ce hook doit être
 * activé dans Authentication > Hooks du dashboard Supabase (URL de ce
 * endpoint + secret `SUPABASE_AUTH_SEND_EMAIL_HOOK_SECRET`), une fois qu'un
 * projet réel existe.
 *
 * Répond toujours 200 (même si l'envoi Resend échoue, voir
 * `src/lib/email/send.tsx`) : un email transactionnel qui échoue ne doit
 * jamais bloquer une inscription/connexion/réinitialisation.
 */
export async function POST(request: NextRequest) {
  const hookSecret = requireEnv(
    "SUPABASE_AUTH_SEND_EMAIL_HOOK_SECRET",
    "le hook d'envoi d'email Supabase",
  );
  const webhook = new Webhook(hookSecret.replace("v1,whsec_", ""));

  const rawBody = await request.text();
  const headers = Object.fromEntries(request.headers);

  let payload: SendEmailHookPayload;
  try {
    payload = webhook.verify(rawBody, headers) as SendEmailHookPayload;
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  const { user, email_data: emailData } = payload;
  const locale = normalizeLocale(user.user_metadata?.locale);
  const actionType = emailData.email_action_type;

  const confirmType = CONFIRM_ACTION_TYPES[actionType];
  const securityEventType = SECURITY_EVENT_TYPES[actionType];

  if (confirmType) {
    const confirmUrl = buildVerifyUrl(
      emailData.token_hash_new ?? emailData.token_hash,
      actionType,
      emailData.redirect_to,
    );
    await sendConfirmEmail({ to: user.email, locale, actionType: confirmType, confirmUrl });
  } else if (actionType === "recovery") {
    const resetUrl = buildVerifyUrl(emailData.token_hash, actionType, emailData.redirect_to);
    await sendPasswordResetEmail({ to: user.email, locale, resetUrl });
  } else if (securityEventType) {
    await sendSecurityAlertEmail({
      to: user.email,
      locale,
      eventType: securityEventType,
      occurredAt: new Date().toLocaleDateString(locale),
    });
  }

  return NextResponse.json({});
}
