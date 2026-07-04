import { defineRouting } from "next-intl/routing";

/**
 * Locales supportées par le site public (marketing + auth).
 * Le lingala (`ln`) est un différenciateur produit (§21 du CDC) : aucun
 * concurrent majeur (DistroKid, TuneCore, CD Baby) ne le propose.
 *
 * Le tableau privé (/app, /admin) n'utilise PAS ce routing par préfixe d'URL :
 * sa langue est résolue via `profiles.locale` (cookie de secours en attendant
 * l'authentification, livrée au Sprint 3) car il n'y a aucun enjeu SEO à
 * indexer un dashboard privé dans plusieurs langues.
 */
export const routing = defineRouting({
  locales: ["fr", "en", "ln"],
  defaultLocale: "fr",
  // "as-needed" : la locale par défaut (fr) n'a pas de préfixe (/tarifs),
  // les autres sont préfixées (/en/pricing, /ln/...) — meilleur pour le SEO
  // FR historique de Sterkte Records tout en gardant des URLs propres.
  localePrefix: "as-needed",
  localeCookie: {
    name: "sterkte_locale",
  },
});

export type AppLocale = (typeof routing.locales)[number];
