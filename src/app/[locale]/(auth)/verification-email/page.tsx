import { getTranslations, setRequestLocale } from "next-intl/server";
import { MailCheckIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader className="items-center text-center">
        <MailCheckIcon className="text-primary size-10" aria-hidden="true" />
        <CardTitle className="text-h3 font-display">{t("verifyEmail.title")}</CardTitle>
        <CardDescription>{t("verifyEmail.description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Separator />
        <ResendForm locale={locale as AppLocale} />
        <p className="text-small text-muted-foreground text-center">
          <Link href="/connexion" className="text-primary font-medium hover:underline">
            {t("verifyEmail.backToLogin")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
