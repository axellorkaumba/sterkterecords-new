import "server-only";

import type { ReactElement } from "react";
import { createTranslator } from "next-intl";
import { getResendClient } from "./resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";
import { routing, type AppLocale } from "@/i18n/routing";
import { ConfirmEmail, type ConfirmEmailActionType } from "./templates/confirm-email";
import { PasswordResetEmail } from "./templates/password-reset";
import { SecurityAlertEmail, type SecurityEventType } from "./templates/security-alert";
import { PaymentReceiptEmail } from "./templates/payment-receipt";
import { ReleaseSubmittedEmail } from "./templates/release-submitted";
import { ReleaseStatusUpdateEmail } from "./templates/release-status-update";
import { ReleaseCorrectionNeededEmail } from "./templates/release-correction-needed";
import { TakedownConfirmedEmail } from "./templates/takedown-confirmed";
import { CollaboratorInviteEmail } from "./templates/collaborator-invite";
import type { EmailTranslator } from "./templates/types";

/**
 * Emails transactionnels (§14) — un gabarit React Email par type, rendu via
 * `resend.emails.send({ react: ... })` (pas de rendu HTML manuel). Le
 * "sujet" réutilise le texte `preview` de chaque gabarit (résumé en une
 * ligne, cohérent avec ce que Resend/les clients mail affichent déjà en
 * aperçu) plutôt que dupliquer une clé i18n dédiée.
 */

function normalizeLocale(locale: string | null | undefined): AppLocale {
  return (routing.locales as readonly string[]).includes(locale ?? "")
    ? (locale as AppLocale)
    : routing.defaultLocale;
}

/** Langue du destinataire — via le client `service_role` : ces fonctions sont appelées depuis des webhooks/hooks sans session utilisateur. */
export async function resolveUserLocale(userId: string): Promise<AppLocale> {
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("locale").eq("id", userId).maybeSingle();
  return normalizeLocale(data?.locale);
}

async function createEmailTranslator(locale: AppLocale): Promise<EmailTranslator> {
  const messages = (await import(`@/i18n/messages/${locale}.json`)).default;
  const translator = createTranslator({ locale, messages, namespace: "Emails" });
  return translator as unknown as EmailTranslator;
}

/**
 * L'échec d'un envoi transactionnel ne doit jamais faire échouer l'action
 * métier qui le déclenche (soumission de sortie, paiement, etc.) — erreur
 * journalisée, jamais propagée. Le SDK Resend ne lève pas d'exception pour
 * une erreur API (`{ data, error }`), donc on vérifie `error` explicitement.
 */
async function send(params: { to: string; subject: string; react: ReactElement }) {
  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: serverEnv.RESEND_FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      react: params.react,
    });

    if (error) {
      console.error(`[email] Échec d'envoi à ${params.to} ("${params.subject}") :`, error);
    }
  } catch (error) {
    // `getResendClient()` lève si RESEND_API_KEY n'est pas configuré (voir
    // src/lib/email/resend.ts) — ne doit jamais faire échouer l'action
    // métier appelante (soumission de sortie, paiement confirmé...).
    console.error(`[email] Envoi impossible à ${params.to} ("${params.subject}") :`, error);
  }
}

export async function sendConfirmEmail(params: {
  to: string;
  locale: AppLocale;
  actionType: ConfirmEmailActionType;
  confirmUrl: string;
}): Promise<void> {
  const t = await createEmailTranslator(params.locale);
  await send({
    to: params.to,
    subject: t(`confirmEmail.${params.actionType}.preview`),
    react: (
      <ConfirmEmail
        locale={params.locale}
        t={t}
        actionType={params.actionType}
        confirmUrl={params.confirmUrl}
      />
    ),
  });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  locale: AppLocale;
  resetUrl: string;
}): Promise<void> {
  const t = await createEmailTranslator(params.locale);
  await send({
    to: params.to,
    subject: t("passwordReset.preview"),
    react: <PasswordResetEmail locale={params.locale} t={t} resetUrl={params.resetUrl} />,
  });
}

export async function sendSecurityAlertEmail(params: {
  to: string;
  locale: AppLocale;
  eventType: SecurityEventType;
  occurredAt: string;
}): Promise<void> {
  const t = await createEmailTranslator(params.locale);
  await send({
    to: params.to,
    subject: t("securityAlert.preview"),
    react: (
      <SecurityAlertEmail
        locale={params.locale}
        t={t}
        eventType={params.eventType}
        occurredAt={params.occurredAt}
      />
    ),
  });
}

export type PaymentReceiptDescriptionKey =
  "soloMonthly" | "soloAnnual" | "soloRenewal" | "appleMusicArtwork";

export async function sendPaymentReceiptEmail(params: {
  to: string;
  locale: AppLocale;
  kind: "subscription" | "addon";
  descriptionKey: PaymentReceiptDescriptionKey;
  amountLabel: string;
  dateLabel: string;
}): Promise<void> {
  const t = await createEmailTranslator(params.locale);
  const description = t(`paymentReceipt.descriptions.${params.descriptionKey}`);
  await send({
    to: params.to,
    subject: t("paymentReceipt.preview"),
    react: (
      <PaymentReceiptEmail
        locale={params.locale}
        t={t}
        kind={params.kind}
        description={description}
        amountLabel={params.amountLabel}
        dateLabel={params.dateLabel}
      />
    ),
  });
}

export async function sendReleaseSubmittedEmail(params: {
  to: string;
  locale: AppLocale;
  releaseTitle: string;
  dashboardUrl: string;
}): Promise<void> {
  const t = await createEmailTranslator(params.locale);
  await send({
    to: params.to,
    subject: t("releaseSubmitted.preview", { title: params.releaseTitle }),
    react: (
      <ReleaseSubmittedEmail
        locale={params.locale}
        t={t}
        releaseTitle={params.releaseTitle}
        dashboardUrl={params.dashboardUrl}
      />
    ),
  });
}

/**
 * Non appelée ce sprint : aucun job ne fait encore transiter `releases.status`
 * de `delivering` à `delivered`/`error` (§13.1, voir ADR 0009/0011). Prête à
 * être appelée dès que ce job existe.
 */
export async function sendReleaseStatusUpdateEmail(params: {
  to: string;
  locale: AppLocale;
  releaseTitle: string;
  status: "delivered" | "error";
  dashboardUrl: string;
  errorDetails?: string;
}): Promise<void> {
  const t = await createEmailTranslator(params.locale);
  await send({
    to: params.to,
    subject: t(`releaseStatusUpdate.${params.status}.preview`, { title: params.releaseTitle }),
    react: (
      <ReleaseStatusUpdateEmail
        locale={params.locale}
        t={t}
        releaseTitle={params.releaseTitle}
        status={params.status}
        dashboardUrl={params.dashboardUrl}
        errorDetails={params.errorDetails}
      />
    ),
  });
}

/** Non appelée ce sprint : le workflow de validation qualité back-office (§11.10) n'existe pas encore. */
export async function sendReleaseCorrectionNeededEmail(params: {
  to: string;
  locale: AppLocale;
  releaseTitle: string;
  issues: string[];
  dashboardUrl: string;
}): Promise<void> {
  const t = await createEmailTranslator(params.locale);
  await send({
    to: params.to,
    subject: t("releaseCorrectionNeeded.preview", { title: params.releaseTitle }),
    react: (
      <ReleaseCorrectionNeededEmail
        locale={params.locale}
        t={t}
        releaseTitle={params.releaseTitle}
        issues={params.issues}
        dashboardUrl={params.dashboardUrl}
      />
    ),
  });
}

/** Invitation à collaborer sur un artiste (ADR 0030, Phase 2) — voir `inviteCollaborator`. */
export async function sendCollaboratorInviteEmail(params: {
  to: string;
  locale: AppLocale;
  artistName: string;
  inviterName: string;
  acceptUrl: string;
}): Promise<void> {
  const t = await createEmailTranslator(params.locale);
  await send({
    to: params.to,
    subject: t("collaboratorInvite.preview", { artist: params.artistName }),
    react: (
      <CollaboratorInviteEmail
        locale={params.locale}
        t={t}
        artistName={params.artistName}
        inviterName={params.inviterName}
        acceptUrl={params.acceptUrl}
      />
    ),
  });
}

export async function sendTakedownConfirmedEmail(params: {
  to: string;
  locale: AppLocale;
  releaseTitle: string;
  dashboardUrl: string;
}): Promise<void> {
  const t = await createEmailTranslator(params.locale);
  await send({
    to: params.to,
    subject: t("takedownConfirmed.preview", { title: params.releaseTitle }),
    react: (
      <TakedownConfirmedEmail
        locale={params.locale}
        t={t}
        releaseTitle={params.releaseTitle}
        dashboardUrl={params.dashboardUrl}
      />
    ),
  });
}
