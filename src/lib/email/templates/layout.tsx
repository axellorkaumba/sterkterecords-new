import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Link,
} from "@react-email/components";
import type { ReactNode } from "react";

/**
 * Habillage commun à tous les emails transactionnels (§14) — en-tête/pied de
 * page, palette Sterkte Records (§9). Couleurs en hexadécimal en dur : les
 * clients email n'interprètent pas les variables CSS (`--cerise-500` etc.,
 * `src/app/globals.css`), donc ces valeurs sont dupliquées ici sciemment,
 * pas une régression de la politique "pas de valeur en dur" du design system.
 */
const COLORS = {
  cerise: "#C8102E",
  noir: "#0A0A0B",
  or: "#F5B700",
  gris600: "#5B5B60",
  blanc: "#FFFFFF",
  border: "#E5E5E5",
  bg: "#F5F5F4",
} as const;

export const emailColors = COLORS;

interface EmailLayoutProps {
  locale: string;
  previewText: string;
  brandLabel: string;
  footerRightsLabel: string;
  footerLinktreeLabel: string;
  footerContactLabel: string;
  children: ReactNode;
}

export function EmailLayout({
  locale,
  previewText,
  brandLabel,
  footerRightsLabel,
  footerLinktreeLabel,
  footerContactLabel,
  children,
}: EmailLayoutProps) {
  return (
    <Html lang={locale}>
      <Head />
      <Preview>{previewText}</Preview>
      <Body
        style={{
          backgroundColor: COLORS.bg,
          fontFamily: "Helvetica, Arial, sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            backgroundColor: COLORS.blanc,
            maxWidth: 480,
            margin: "40px auto",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <Section style={{ backgroundColor: COLORS.noir, padding: "24px 32px" }}>
            <Text style={{ color: COLORS.blanc, fontSize: 20, fontWeight: 700, margin: 0 }}>
              {brandLabel.split(" ")[0]}{" "}
              <span style={{ color: COLORS.cerise }}>
                {brandLabel.split(" ").slice(1).join(" ")}
              </span>
            </Text>
          </Section>

          <Section style={{ padding: "32px" }}>{children}</Section>

          <Hr style={{ borderColor: COLORS.border, margin: 0 }} />

          <Section style={{ padding: "24px 32px" }}>
            <Text style={{ color: COLORS.gris600, fontSize: 12, margin: "0 0 8px" }}>
              {footerRightsLabel}
            </Text>
            <Text style={{ color: COLORS.gris600, fontSize: 12, margin: 0 }}>
              <Link href="https://linktr.ee/sterkterecords" style={{ color: COLORS.cerise }}>
                {footerLinktreeLabel}
              </Link>
              {" · "}
              <Link href="mailto:contact.sterkterecords@gmail.com" style={{ color: COLORS.cerise }}>
                {footerContactLabel}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
