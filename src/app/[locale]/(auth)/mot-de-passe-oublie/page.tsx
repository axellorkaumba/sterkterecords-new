import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { createSeoMetadata } from "@/lib/seo";
import { ForgotPasswordForm } from "./forgot-password-form";
import type { AppLocale } from "@/i18n/routing";

export const generateMetadata = createSeoMetadata("Seo.forgotPassword", { noindex: true });

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth");

  return (
    <Card>
      <CardHeader>
        <p className="text-caption text-primary font-medium tracking-wide uppercase">
          {t("forgotPassword.tag")}
        </p>
        <CardTitle className="text-h3 font-display">{t("forgotPassword.title")}</CardTitle>
        <CardDescription>{t("forgotPassword.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ForgotPasswordForm locale={locale as AppLocale} />
        <p className="text-small text-muted-foreground text-center">
          <Link href="/connexion" className="text-primary font-medium hover:underline">
            {t("forgotPassword.backToLogin")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
