import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

/**
 * Page d'accueil — placeholder d'infrastructure (Sprint 0).
 * Contenu éditorial réel (hero, preuve sociale, comparatif, FAQ) livré au
 * Sprint 2 conformément au §11.1 du cahier des charges.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  return (
    <div className="flex flex-1 items-center justify-center p-8 text-center">
      <p className="text-sm text-neutral-500">{t("comingSoon")}</p>
    </div>
  );
}
