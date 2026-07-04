import { getTranslations, setRequestLocale } from "next-intl/server";

// Placeholder — formulaire d'inscription (Supabase Auth) livré au Sprint 3.
export default async function SignupPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth.signup");

  return <p className="text-sm text-neutral-500">{t("placeholder")}</p>;
}
