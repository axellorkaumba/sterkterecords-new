import { Text } from "@react-email/components";
import { EmailLayout, emailColors } from "./layout";
import { EmailCtaButton } from "./cta-button";
import type { BaseEmailProps } from "./types";

export interface CollaboratorInviteEmailProps extends BaseEmailProps {
  artistName: string;
  inviterName: string;
  acceptUrl: string;
}

/** Invitation à collaborer sur un artiste (ADR 0030, Phase 2) — envoyée depuis `inviteCollaborator`. */
export function CollaboratorInviteEmail({
  locale,
  t,
  artistName,
  inviterName,
  acceptUrl,
}: CollaboratorInviteEmailProps) {
  return (
    <EmailLayout
      locale={locale}
      previewText={t("collaboratorInvite.preview", { artist: artistName })}
      brandLabel={t("layout.brandLabel")}
      footerRightsLabel={t("layout.footerRights")}
      footerLinktreeLabel={t("layout.footerLinktree")}
      footerContactLabel={t("layout.footerContact")}
    >
      <Text style={{ fontSize: 18, fontWeight: 700, color: emailColors.noir, margin: "0 0 16px" }}>
        {t("collaboratorInvite.heading", { artist: artistName })}
      </Text>
      <Text
        style={{ fontSize: 14, color: emailColors.gris600, lineHeight: 1.6, margin: "0 0 24px" }}
      >
        {t("collaboratorInvite.body", { inviter: inviterName, artist: artistName })}
      </Text>
      <EmailCtaButton href={acceptUrl}>{t("collaboratorInvite.cta")}</EmailCtaButton>
    </EmailLayout>
  );
}
