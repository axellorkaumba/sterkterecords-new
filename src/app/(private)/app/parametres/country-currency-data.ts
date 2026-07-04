/**
 * Codes ISO uniquement — les libellés affichés sont dérivés à l'affichage
 * via `Intl.DisplayNames` (voir `country-select.tsx`/`currency-select.tsx`),
 * pas traduits à la main : évite de maintenir ~30 noms de pays/devises dans
 * chaque fichier i18n alors que la plateforme JS le fait déjà nativement.
 *
 * Liste volontairement resserrée aux marchés pertinents pour Sterkte Records
 * (Afrique francophone, Maghreb, principaux marchés de streaming) plutôt que
 * les ~195 pays ISO 3166-1 — extensible facilement si besoin (§11.2).
 */
export const COUNTRY_CODES = [
  "CD",
  "MA",
  "FR",
  "BE",
  "CH",
  "CA",
  "US",
  "GB",
  "DE",
  "ES",
  "PT",
  "NL",
  "SN",
  "CI",
  "CM",
  "CG",
  "GA",
  "TG",
  "BJ",
  "ML",
  "BF",
  "NE",
  "TD",
  "ZA",
  "GH",
  "NG",
  "KE",
] as const;

export const CURRENCY_CODES = [
  "USD",
  "EUR",
  "CDF",
  "MAD",
  "XOF",
  "XAF",
  "ZAR",
  "GBP",
  "CAD",
] as const;

/** `ln` n'est pas une locale ICU reconnue par `Intl.DisplayNames` — repli sur `fr`. */
export function displayLocaleFor(locale: string): string {
  return locale === "ln" ? "fr" : locale;
}
