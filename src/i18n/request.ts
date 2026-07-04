import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { LOCALE_COOKIE_NAME, routing, type AppLocale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

/**
 * Résout la langue de `/app`/`/admin` (pas de segment `[locale]`, §11.2) :
 * `profiles.locale` en priorité pour un utilisateur authentifié — modifiable
 * à tout moment dans Paramètres > Langue (voir
 * `src/app/(private)/app/parametres/actions.ts`, `updateLocaleAndCurrency`)
 * — sinon le cookie `sterkte_locale` (visite précédente du site public, ou
 * repli avant authentification), sinon la locale par défaut.
 */
async function resolvePrivateAreaLocale(): Promise<AppLocale> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase.from("profiles").select("locale").eq("id", user.id).single();
      if (data && hasLocale(routing.locales, data.locale)) {
        return data.locale;
      }
    }
  } catch {
    // Aucun projet Supabase configuré, ou utilisateur non authentifié —
    // repli silencieux sur le cookie ci-dessous.
  }

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  return hasLocale(routing.locales, cookieLocale) ? cookieLocale : routing.defaultLocale;
}

/**
 * Résolution de la locale pour TOUTE l'application (site public/auth
 * préfixés par l'URL, mais aussi `/app` et `/admin` qui n'ont pas de
 * préfixe — voir docs/adr/0002-i18n-routing.md).
 *
 * Sous `src/app/[locale]/...`, `requestLocale` vient du segment d'URL
 * (résolu par le proxy next-intl) et est toujours valide. Sous
 * `src/app/(private)/...`, il n'y a pas de segment `[locale]` : voir
 * `resolvePrivateAreaLocale` ci-dessus.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  let locale = hasLocale(routing.locales, requested) ? requested : undefined;

  if (!locale) {
    locale = await resolvePrivateAreaLocale();
  }

  const messages = (await import(`@/i18n/messages/${locale}.json`)).default as Record<
    string,
    unknown
  >;

  return { locale, messages };
});
