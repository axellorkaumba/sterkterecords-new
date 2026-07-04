import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { LOCALE_COOKIE_NAME, routing } from "@/i18n/routing";

/**
 * Résolution de la locale pour TOUTE l'application (site public/auth
 * préfixés par l'URL, mais aussi `/app` et `/admin` qui n'ont pas de
 * préfixe — voir docs/adr/0002-i18n-routing.md).
 *
 * Sous `src/app/[locale]/...`, `requestLocale` vient du segment d'URL
 * (résolu par le proxy next-intl) et est toujours valide. Sous
 * `src/app/(private)/...`, il n'y a pas de segment `[locale]` : on retombe
 * sur le cookie `sterkte_locale` (posé par une visite précédente du site
 * public, ou par le sélecteur de langue dans les paramètres une fois
 * authentifié), puis sur la locale par défaut.
 *
 * TODO(Sprint 3) : une fois l'utilisateur authentifié, préférer
 * `profiles.locale` au cookie (et resynchroniser le cookie quand l'utilisateur
 * change sa langue dans les paramètres, §21 du CDC).
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  let locale = hasLocale(routing.locales, requested) ? requested : undefined;

  if (!locale) {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
    locale = hasLocale(routing.locales, cookieLocale) ? cookieLocale : routing.defaultLocale;
  }

  const messages = (await import(`@/i18n/messages/${locale}.json`)).default as Record<
    string,
    unknown
  >;

  return { locale, messages };
});
