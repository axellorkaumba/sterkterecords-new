import { Text } from "@react-email/components";
import { EmailLayout, emailColors } from "./layout";
import type { BaseEmailProps } from "./types";

export type SecurityEventType =
  | "password_changed"
  | "mfa_enrolled"
  | "mfa_disabled"
  | "identity_linked"
  | "identity_unlinked"
  | "email_changed";

export interface SecurityAlertEmailProps extends BaseEmailProps {
  eventType: SecurityEventType;
  occurredAt: string;
}

/**
 * Alerte de sécurité (§14, §17) — changement de mot de passe, activation/
 * désactivation 2FA, comptes liés/déliés, changement d'email. Envoyée à la
 * fois par le Send Email Hook (types `*_notification`, si Supabase les
 * déclenche automatiquement — documentation ambiguë à ce sujet) et par un
 * appel direct depuis les Server Actions concernées (`src/app/(private)/app/
 * parametres/actions.ts`) — redondance volontaire, voir ADR 0011.
 */
export function SecurityAlertEmail({ locale, t, eventType, occurredAt }: SecurityAlertEmailProps) {
  return (
    <EmailLayout
      locale={locale}
      previewText={t("securityAlert.preview")}
      brandLabel={t("layout.brandLabel")}
      footerRightsLabel={t("layout.footerRights")}
      footerLinktreeLabel={t("layout.footerLinktree")}
      footerContactLabel={t("layout.footerContact")}
    >
      <Text style={{ fontSize: 18, fontWeight: 700, color: emailColors.noir, margin: "0 0 16px" }}>
        {t("securityAlert.heading")}
      </Text>
      <Text
        style={{ fontSize: 14, color: emailColors.gris600, lineHeight: 1.6, margin: "0 0 8px" }}
      >
        {t(`securityAlert.events.${eventType}`, { date: occurredAt })}
      </Text>
      <Text style={{ fontSize: 14, color: emailColors.noir, lineHeight: 1.6, margin: "16px 0 0" }}>
        {t("securityAlert.notYouNote")}
      </Text>
    </EmailLayout>
  );
}
