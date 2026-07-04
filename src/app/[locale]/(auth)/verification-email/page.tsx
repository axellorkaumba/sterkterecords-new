import { getTranslations, setRequestLocale } from "next-intl/server";

// Placeholder — écran de vérification d'email livré au Sprint 3.
export default async function VerifyEmailPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth.verifyEmail");

  return <p className="text-sm text-neutral-500">{t("placeholder")}</p>;
}
