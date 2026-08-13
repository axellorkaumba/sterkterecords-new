import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createSeoMetadata } from "@/lib/seo";
import { AuthPanel } from "../auth-panel";
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
    <AuthPanel
      tag={t("forgotPassword.tag")}
      title={t("forgotPassword.title")}
      subtitle={t("forgotPassword.subtitle")}
    >
      <ForgotPasswordForm locale={locale as AppLocale} />
      <p className="text-small text-muted-foreground text-center">
        <Link href="/connexion" className="text-primary font-medium hover:underline">
          {t("forgotPassword.backToLogin")}
        </Link>
      </p>
    </AuthPanel>
  );
}
