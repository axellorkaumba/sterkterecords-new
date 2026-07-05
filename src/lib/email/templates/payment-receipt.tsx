import { Hr, Row, Column, Text } from "@react-email/components";
import { EmailLayout, emailColors } from "./layout";
import type { BaseEmailProps } from "./types";

export interface PaymentReceiptEmailProps extends BaseEmailProps {
  kind: "subscription" | "addon";
  description: string;
  amountLabel: string;
  dateLabel: string;
}

/** Confirmation d'abonnement / de paiement / reçu (§14, §5.3) — abonnement initial, renouvellement, ou add-on payé. */
export function PaymentReceiptEmail({
  locale,
  t,
  kind,
  description,
  amountLabel,
  dateLabel,
}: PaymentReceiptEmailProps) {
  return (
    <EmailLayout
      locale={locale}
      previewText={t("paymentReceipt.preview")}
      brandLabel={t("layout.brandLabel")}
      footerRightsLabel={t("layout.footerRights")}
      footerLinktreeLabel={t("layout.footerLinktree")}
      footerContactLabel={t("layout.footerContact")}
    >
      <Text style={{ fontSize: 18, fontWeight: 700, color: emailColors.noir, margin: "0 0 16px" }}>
        {t(`paymentReceipt.${kind}.heading`)}
      </Text>
      <Text
        style={{ fontSize: 14, color: emailColors.gris600, lineHeight: 1.6, margin: "0 0 24px" }}
      >
        {t(`paymentReceipt.${kind}.body`)}
      </Text>

      <Row>
        <Column>
          <Text style={{ fontSize: 13, color: emailColors.gris600, margin: 0 }}>
            {t("paymentReceipt.descriptionLabel")}
          </Text>
        </Column>
        <Column align="right">
          <Text style={{ fontSize: 13, color: emailColors.noir, margin: 0 }}>{description}</Text>
        </Column>
      </Row>
      <Row>
        <Column>
          <Text style={{ fontSize: 13, color: emailColors.gris600, margin: 0 }}>
            {t("paymentReceipt.dateLabel")}
          </Text>
        </Column>
        <Column align="right">
          <Text style={{ fontSize: 13, color: emailColors.noir, margin: 0 }}>{dateLabel}</Text>
        </Column>
      </Row>
      <Hr style={{ borderColor: emailColors.border, margin: "12px 0" }} />
      <Row>
        <Column>
          <Text style={{ fontSize: 14, fontWeight: 700, color: emailColors.noir, margin: 0 }}>
            {t("paymentReceipt.totalLabel")}
          </Text>
        </Column>
        <Column align="right">
          <Text style={{ fontSize: 14, fontWeight: 700, color: emailColors.noir, margin: 0 }}>
            {amountLabel}
          </Text>
        </Column>
      </Row>
    </EmailLayout>
  );
}
