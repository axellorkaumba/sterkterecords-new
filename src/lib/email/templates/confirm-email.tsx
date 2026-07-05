import { Text } from "@react-email/components";
import { EmailLayout, emailColors } from "./layout";
import { EmailCtaButton } from "./cta-button";
import type { BaseEmailProps } from "./types";

export type ConfirmEmailActionType =
  "signup" | "invite" | "magiclink" | "email_change" | "reauthentication";

export interface ConfirmEmailProps extends BaseEmailProps {
  actionType: ConfirmEmailActionType;
  confirmUrl: string;
}

/**
 * Email de confirmation (§14 "Bienvenue / vérification email") — reçu via
 * le Send Email Hook Supabase (signup, invitation, lien magique, changement
 * d'email, réauthentification), un seul gabarit paramétré par `actionType`
 * plutôt que 5 gabarits quasi identiques.
 */
export function ConfirmEmail({ locale, t, actionType, confirmUrl }: ConfirmEmailProps) {
  return (
    <EmailLayout
      locale={locale}
      previewText={t(`confirmEmail.${actionType}.preview`)}
      brandLabel={t("layout.brandLabel")}
      footerRightsLabel={t("layout.footerRights")}
      footerLinktreeLabel={t("layout.footerLinktree")}
      footerContactLabel={t("layout.footerContact")}
    >
      <Text style={{ fontSize: 18, fontWeight: 700, color: emailColors.noir, margin: "0 0 16px" }}>
        {t(`confirmEmail.${actionType}.heading`)}
      </Text>
      <Text
        style={{ fontSize: 14, color: emailColors.gris600, lineHeight: 1.6, margin: "0 0 24px" }}
      >
        {t(`confirmEmail.${actionType}.body`)}
      </Text>
      <EmailCtaButton href={confirmUrl}>{t(`confirmEmail.${actionType}.cta`)}</EmailCtaButton>
      <Text style={{ fontSize: 12, color: emailColors.gris600, marginTop: 24 }}>
        {t("confirmEmail.ignoreNote")}
      </Text>
    </EmailLayout>
  );
}
