import { Text } from "@react-email/components";
import { EmailLayout, emailColors } from "./layout";
import { EmailCtaButton } from "./cta-button";
import type { BaseEmailProps } from "./types";

export interface PasswordResetEmailProps extends BaseEmailProps {
  resetUrl: string;
}

/** Réinitialisation de mot de passe (§14, §11.2) — reçu via le Send Email Hook Supabase (action `recovery`). */
export function PasswordResetEmail({ locale, t, resetUrl }: PasswordResetEmailProps) {
  return (
    <EmailLayout
      locale={locale}
      previewText={t("passwordReset.preview")}
      brandLabel={t("layout.brandLabel")}
      footerRightsLabel={t("layout.footerRights")}
      footerLinktreeLabel={t("layout.footerLinktree")}
      footerContactLabel={t("layout.footerContact")}
    >
      <Text style={{ fontSize: 18, fontWeight: 700, color: emailColors.noir, margin: "0 0 16px" }}>
        {t("passwordReset.heading")}
      </Text>
      <Text
        style={{ fontSize: 14, color: emailColors.gris600, lineHeight: 1.6, margin: "0 0 24px" }}
      >
        {t("passwordReset.body")}
      </Text>
      <EmailCtaButton href={resetUrl}>{t("passwordReset.cta")}</EmailCtaButton>
      <Text style={{ fontSize: 12, color: emailColors.gris600, marginTop: 24 }}>
        {t("passwordReset.ignoreNote")}
      </Text>
    </EmailLayout>
  );
}
