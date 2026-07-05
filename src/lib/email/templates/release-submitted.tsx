import { Text } from "@react-email/components";
import { EmailLayout, emailColors } from "./layout";
import { EmailCtaButton } from "./cta-button";
import type { BaseEmailProps } from "./types";

export interface ReleaseSubmittedEmailProps extends BaseEmailProps {
  releaseTitle: string;
  dashboardUrl: string;
}

/** Sortie soumise (§14, §11.4 étape 9) — envoyé à la soumission vers LabelGrid (`submitRelease`). */
export function ReleaseSubmittedEmail({
  locale,
  t,
  releaseTitle,
  dashboardUrl,
}: ReleaseSubmittedEmailProps) {
  return (
    <EmailLayout
      locale={locale}
      previewText={t("releaseSubmitted.preview", { title: releaseTitle })}
      brandLabel={t("layout.brandLabel")}
      footerRightsLabel={t("layout.footerRights")}
      footerLinktreeLabel={t("layout.footerLinktree")}
      footerContactLabel={t("layout.footerContact")}
    >
      <Text style={{ fontSize: 18, fontWeight: 700, color: emailColors.noir, margin: "0 0 16px" }}>
        {t("releaseSubmitted.heading", { title: releaseTitle })}
      </Text>
      <Text
        style={{ fontSize: 14, color: emailColors.gris600, lineHeight: 1.6, margin: "0 0 24px" }}
      >
        {t("releaseSubmitted.body")}
      </Text>
      <EmailCtaButton href={dashboardUrl}>{t("releaseSubmitted.cta")}</EmailCtaButton>
    </EmailLayout>
  );
}
