import { defineRouting } from "next-intl/routing";

/**
 * Locales supportées par le site public (marketing + auth).
 * Le lingala (`ln`) est un différenciateur produit (§21 du CDC) : aucun
 * concurrent majeur (DistroKid, TuneCore, CD Baby) ne le propose.
 *
 * Le tableau privé (/app, /admin) n'utilise PAS ce routing par préfixe d'URL :
 * sa langue est résolue via `profiles.locale` une fois authentifié (Sprint 3),
 * avec le cookie ci-dessous comme repli avant connexion. Voir
 * docs/adr/0002-i18n-routing.md.
 */
export const LOCALE_COOKIE_NAME = "sterkte_locale";

/**
 * Chemins localisés (§19 SEO — hreflang par des URLs traduites, pas
 * seulement préfixées) pour le site public ET l'authentification, décidé
 * dans docs/adr/0002-i18n-routing.md : `/fr/connexion`, `/en/login`,
 * `/ln/connexion` (traduction lingala en attente de relecture native,
 * voir docs/adr/0004-i18n-content-policy.md).
 *
 * La clé est le nom de dossier interne (canonique, en français) sous
 * `src/app/[locale]/...` ; les valeurs sont les segments affichés dans
 * l'URL par locale. Toute nouvelle route publique/auth doit être ajoutée
 * ici, sinon `Link`/`redirect` typés (src/i18n/navigation.ts) refuseront
 * de compiler.
 */
export const routing = defineRouting({
  locales: ["fr", "en", "ln"],
  defaultLocale: "fr",
  // "as-needed" : la locale par défaut (fr) n'a pas de préfixe (/tarifs),
  // les autres sont préfixées (/en/pricing, /ln/...) — meilleur pour le SEO
  // FR historique de Sterkte Records tout en gardant des URLs propres.
  localePrefix: "as-needed",
  localeCookie: {
    name: LOCALE_COOKIE_NAME,
  },
  pathnames: {
    "/": "/",
    "/a-propos": {
      fr: "/a-propos",
      en: "/about",
      ln: "/a-propos",
    },
    "/distribution": {
      fr: "/distribution",
      en: "/distribution",
      ln: "/distribution",
    },
    "/tarifs": {
      fr: "/tarifs",
      en: "/pricing",
      ln: "/tarifs",
    },
    "/studio": {
      fr: "/studio",
      en: "/studio",
      ln: "/studio",
    },
    "/booking": {
      fr: "/booking",
      en: "/booking",
      ln: "/booking",
    },
    "/featuring": {
      fr: "/featuring",
      en: "/featuring",
      ln: "/featuring",
    },
    "/consulting": {
      fr: "/consulting",
      en: "/consulting",
      ln: "/consulting",
    },
    "/contact": {
      fr: "/contact",
      en: "/contact",
      ln: "/contact",
    },
    "/aide": {
      fr: "/aide",
      en: "/help",
      ln: "/aide",
    },
    "/legal/cgu": {
      fr: "/legal/cgu",
      en: "/legal/terms",
      ln: "/legal/cgu",
    },
    "/legal/confidentialite": {
      fr: "/legal/confidentialite",
      en: "/legal/privacy",
      ln: "/legal/confidentialite",
    },
    "/legal/mentions": {
      fr: "/legal/mentions",
      en: "/legal/notice",
      ln: "/legal/mentions",
    },
    "/connexion": {
      fr: "/connexion",
      en: "/login",
      // TODO(relecture native lingala, ADR 0004) : segment provisoire.
      ln: "/connexion",
    },
    "/inscription": {
      fr: "/inscription",
      en: "/signup",
      ln: "/inscription",
    },
    "/mot-de-passe-oublie": {
      fr: "/mot-de-passe-oublie",
      en: "/forgot-password",
      ln: "/mot-de-passe-oublie",
    },
    "/verification-email": {
      fr: "/verification-email",
      en: "/verify-email",
      ln: "/verification-email",
    },
    "/reinitialiser-mot-de-passe": {
      fr: "/reinitialiser-mot-de-passe",
      en: "/reset-password",
      ln: "/reinitialiser-mot-de-passe",
    },
  },
});

export type AppLocale = (typeof routing.locales)[number];
