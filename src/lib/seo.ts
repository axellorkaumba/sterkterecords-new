import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

/**
 * Génère un `generateMetadata` standard à partir d'un namespace `Seo.*`
 * des messages i18n (title + description). Évite de dupliquer le même
 * bloc dans chaque page marketing (§19 du CDC — SEO par page).
 *
 * Appelle `setRequestLocale` ici aussi (pas seulement dans le composant de
 * page) : sans ça, Next.js perd l'information de rendu statique pendant la
 * phase de génération des métadonnées et bascule toute la route en rendu
 * dynamique (`ƒ` au lieu de `●` dans la sortie de `next build`).
 *
 * `noindex` : pages d'authentification (§11.2) — chemins localisés comme le
 * site public, mais sans valeur de contenu propre pour le SEO (formulaires,
 * pas d'éditorial), donc exclues de l'indexation.
 */
export function createSeoMetadata(namespace: string, options?: { noindex?: boolean }) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }): Promise<Metadata> {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace });
    return {
      title: t("title"),
      description: t("description"),
      ...(options?.noindex ? { robots: { index: false, follow: false } } : {}),
    };
  };
}
