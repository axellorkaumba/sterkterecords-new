import "server-only";

import { serverEnv } from "@/lib/env";

/**
 * Registre des providers OAuth (§11.2 du CDC). Architecture pensée pour
 * qu'activer Apple ne nécessite AUCUNE refonte de l'authentification :
 * ajouter les identifiants dans `.env.local` (voir `.env.example`) et
 * activer `[auth.external.apple]` dans `supabase/config.toml` (ou le
 * dashboard cloud) suffit — ce registre, le callback PKCE
 * (`src/app/api/auth/callback/route.ts`), la Server Action générique
 * (`signInWithOAuth` dans `actions.ts`) et le composant `OAuthButton`
 * fonctionnent déjà pour n'importe quel provider listé ici. Voir
 * docs/adr/0007-auth-architecture.md.
 *
 * `server-only` : ce module lit `serverEnv`, jamais importable depuis un
 * Client Component. Les pages Server Component (`connexion`/`inscription`)
 * appellent `getEnabledOAuthProviders()` et transmettent le résultat
 * (simple tableau de chaînes) aux Client Components qui affichent les
 * boutons.
 */
export type OAuthProviderId = "google" | "apple";

export const OAUTH_PROVIDER_IDS: readonly OAuthProviderId[] = ["google", "apple"];

/**
 * Google : MVP, toujours actif. Apple : `[V1]` du CDC ET bloqué par un
 * compte Apple Developer payant (même famille de décision que LabelGrid,
 * ADR 0003) — actif dès que les identifiants sont configurés, sans
 * modification de code.
 */
export function getEnabledOAuthProviders(): OAuthProviderId[] {
  const providers: OAuthProviderId[] = ["google"];

  if (
    serverEnv.SUPABASE_AUTH_EXTERNAL_APPLE_CLIENT_ID &&
    serverEnv.SUPABASE_AUTH_EXTERNAL_APPLE_SECRET
  ) {
    providers.push("apple");
  }

  return providers;
}
