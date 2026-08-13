import { getTranslations, setRequestLocale } from "next-intl/server";
import { MailCheckIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { createSeoMetadata } from "@/lib/seo";
import { ResendForm } from "./resend-form";
import type { AppLocale } from "@/i18n/routing";

export const generateMetadata = createSeoMetadata("Seo.verifyEmail", { noindex: true });

export default async function VerifyEmailPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <MailCheckIcon className="text-primary size-10" aria-hidden="true" />
        <h1 className="text-h2 font-display">{t("verifyEmail.title")}</h1>
        <p className="text-muted-foreground">{t("verifyEmail.description")}</p>
      </div>
      <Separator />
      <ResendForm locale={locale as AppLocale} />
      <p className="text-small text-muted-foreground text-center">
        <Link href="/connexion" className="text-primary font-medium hover:underline">
          {t("verifyEmail.backToLogin")}
        </Link>
      </p>
    </div>
  );
}
