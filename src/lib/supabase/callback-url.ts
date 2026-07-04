import "server-only";

import { clientEnv } from "@/lib/env";

/**
 * Construit une URL vers `/api/auth/callback` avec des paramètres propres à
 * l'application (`type`, `locale`, `next`) — Supabase se contente d'y
 * ajouter `?code=...` sans autrement modifier l'URL fournie (voir
 * `src/app/api/auth/callback/route.ts`, docs/adr/0007-auth-architecture.md).
 * Partagé entre les Server Actions d'authentification et celles des
 * Paramètres (liaison de comptes OAuth).
 */
export function authCallbackUrl(params: Record<string, string | undefined>): string {
  const url = new URL("/api/auth/callback", clientEnv.NEXT_PUBLIC_SITE_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}
