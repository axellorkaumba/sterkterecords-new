import { Text } from "@react-email/components";
import { EmailLayout, emailColors } from "./layout";
import { EmailCtaButton } from "./cta-button";
import type { BaseEmailProps } from "./types";

export interface TakedownConfirmedEmailProps extends BaseEmailProps {
  releaseTitle: string;
  dashboardUrl: string;
}

/** Retrait de distribution confirmé (§14, §11.4 "Takedown") — envoyé depuis `requestTakedown`. */
export function TakedownConfirmedEmail({
  locale,
  t,
  releaseTitle,
  dashboardUrl,
}: TakedownConfirmedEmailProps) {
  return (
    <EmailLayout
      locale={locale}
      previewText={t("takedownConfirmed.preview", { title: releaseTitle })}
      brandLabel={t("layout.brandLabel")}
      footerRightsLabel={t("layout.footerRights")}
      footerLinktreeLabel={t("layout.footerLinktree")}
      footerContactLabel={t("layout.footerContact")}
    >
      <Text style={{ fontSize: 18, fontWeight: 700, color: emailColors.noir, margin: "0 0 16px" }}>
        {t("takedownConfirmed.heading", { title: releaseTitle })}
      </Text>
      <Text
        style={{ fontSize: 14, color: emailColors.gris600, lineHeight: 1.6, margin: "0 0 24px" }}
      >
        {t("takedownConfirmed.body")}
      </Text>
      <EmailCtaButton href={dashboardUrl}>{t("takedownConfirmed.cta")}</EmailCtaButton>
    </EmailLayout>
  );
}
