import { getTranslations, setRequestLocale } from "next-intl/server";

// Placeholder — réinitialisation de mot de passe livrée au Sprint 3.
export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth.forgotPassword");

  return <p className="text-sm text-neutral-500">{t("placeholder")}</p>;
}
