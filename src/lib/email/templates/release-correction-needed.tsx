import { Text } from "@react-email/components";
import { EmailLayout, emailColors } from "./layout";
import { EmailCtaButton } from "./cta-button";
import type { BaseEmailProps } from "./types";

export interface ReleaseCorrectionNeededEmailProps extends BaseEmailProps {
  releaseTitle: string;
  issues: string[];
  dashboardUrl: string;
}

/**
 * Sortie à corriger, avec détail des erreurs (§14) — gabarit prêt mais
 * **non câblé** ce sprint : déclenché par le futur workflow de validation
 * qualité back-office (§11.10, sprint séparé), qui n'existe pas encore.
 */
export function ReleaseCorrectionNeededEmail({
  locale,
  t,
  releaseTitle,
  issues,
  dashboardUrl,
}: ReleaseCorrectionNeededEmailProps) {
  return (
    <EmailLayout
      locale={locale}
      previewText={t("releaseCorrectionNeeded.preview", { title: releaseTitle })}
      brandLabel={t("layout.brandLabel")}
      footerRightsLabel={t("layout.footerRights")}
      footerLinktreeLabel={t("layout.footerLinktree")}
      footerContactLabel={t("layout.footerContact")}
    >
      <Text style={{ fontSize: 18, fontWeight: 700, color: emailColors.noir, margin: "0 0 16px" }}>
        {t("releaseCorrectionNeeded.heading", { title: releaseTitle })}
      </Text>
      <Text
        style={{ fontSize: 14, color: emailColors.gris600, lineHeight: 1.6, margin: "0 0 16px" }}
      >
        {t("releaseCorrectionNeeded.body")}
      </Text>
      <ul style={{ margin: "0 0 24px", paddingLeft: 20 }}>
        {issues.map((issue) => (
          <li key={issue} style={{ fontSize: 13, color: emailColors.noir, marginBottom: 4 }}>
            {issue}
          </li>
        ))}
      </ul>
      <EmailCtaButton href={dashboardUrl}>{t("releaseCorrectionNeeded.cta")}</EmailCtaButton>
    </EmailLayout>
  );
}
