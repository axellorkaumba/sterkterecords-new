import "server-only";

/**
 * Un `next` qui commence par `/` seul ne suffit pas à garantir une
 * redirection interne : `//evil.com` ou `/\evil.com` sont des chemins
 * "protocol-relative" que les navigateurs résolvent comme une URL externe
 * (le navigateur ignore le premier `/` vide et traite `//evil.com` comme
 * `https://evil.com`, RFC 3986). Repéré en audit : `signIn`
 * (`src/app/[locale]/(auth)/actions.ts`) appelait `redirect(next)` nu, sans
 * préfixe d'origine, avec juste `next.startsWith("/")` comme garde — un lien
 * `/connexion?next=//site-pirate.example` envoyait la victime, une fois
 * connectée, tout droit hors du site (CWE-601, redirection ouverte).
 */
export function isSafeRedirectPath(next: string | null | undefined): next is string {
  return !!next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\");
}
