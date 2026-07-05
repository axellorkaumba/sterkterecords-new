import { Button } from "@react-email/components";
import { emailColors } from "./layout";

export function EmailCtaButton({ href, children }: { href: string; children: string }) {
  return (
    <Button
      href={href}
      style={{
        backgroundColor: emailColors.cerise,
        color: emailColors.blanc,
        borderRadius: 8,
        padding: "12px 24px",
        fontSize: 14,
        fontWeight: 600,
        textDecoration: "none",
        display: "inline-block",
      }}
    >
      {children}
    </Button>
  );
}
