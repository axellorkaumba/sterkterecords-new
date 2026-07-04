/**
 * Les listes de pays/devises ne sont PLUS codées en dur ici : elles vivent
 * dans les tables `public.countries`/`public.currencies` (§11.2, voir
 * `supabase/migrations/20260704150000_countries_and_currencies.sql`) et sont
 * lues par `page.tsx` (Server Component) puis transmises en props à
 * `ProfileTab`/`LanguageTab`. Ajouter un pays ou une devise = une ligne
 * insérée en base, jamais une modification de code — voir
 * docs/adr/0007-auth-architecture.md.
 *
 * Les libellés affichés restent dérivés à l'affichage via
 * `Intl.DisplayNames` (pas de colonne "name" en base) : `ln` n'est pas une
 * locale ICU reconnue, d'où ce repli sur `fr`.
 */
export function displayLocaleFor(locale: string): string {
  return locale === "ln" ? "fr" : locale;
}
