import { Text } from "@react-email/components";
import { EmailLayout, emailColors } from "./layout";
import { EmailCtaButton } from "./cta-button";
import type { BaseEmailProps } from "./types";

export interface ReleaseStatusUpdateEmailProps extends BaseEmailProps {
  releaseTitle: string;
  status: "delivered" | "error";
  dashboardUrl: string;
  errorDetails?: string;
}

/**
 * Mise à jour de statut de distribution / "sortie livrée" (§14, §11.4) —
 * gabarit prêt mais **non câblé** ce sprint : rien ne fait encore transiter
 * `releases.status` de `delivering` à `delivered`/`error` (job de statut/
 * webhook LabelGrid, §13.1, pas construit — même limite documentée dans
 * ADR 0009). À appeler depuis ce futur job dès qu'il existe.
 */
export function ReleaseStatusUpdateEmail({
  locale,
  t,
  releaseTitle,
  status,
  dashboardUrl,
  errorDetails,
}: ReleaseStatusUpdateEmailProps) {
  return (
    <EmailLayout
      locale={locale}
      previewText={t(`releaseStatusUpdate.${status}.preview`, { title: releaseTitle })}
      brandLabel={t("layout.brandLabel")}
      footerRightsLabel={t("layout.footerRights")}
      footerLinktreeLabel={t("layout.footerLinktree")}
      footerContactLabel={t("layout.footerContact")}
    >
      <Text style={{ fontSize: 18, fontWeight: 700, color: emailColors.noir, margin: "0 0 16px" }}>
        {t(`releaseStatusUpdate.${status}.heading`, { title: releaseTitle })}
      </Text>
      <Text
        style={{ fontSize: 14, color: emailColors.gris600, lineHeight: 1.6, margin: "0 0 16px" }}
      >
        {t(`releaseStatusUpdate.${status}.body`)}
      </Text>
      {status === "error" && errorDetails ? (
        <Text
          style={{
            fontSize: 13,
            color: emailColors.noir,
            backgroundColor: emailColors.bg,
            borderRadius: 8,
            padding: 12,
            margin: "0 0 24px",
          }}
        >
          {errorDetails}
        </Text>
      ) : null}
      <EmailCtaButton href={dashboardUrl}>{t(`releaseStatusUpdate.${status}.cta`)}</EmailCtaButton>
    </EmailLayout>
  );
}
