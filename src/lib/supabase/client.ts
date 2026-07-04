"use client";

import { createBrowserClient } from "@supabase/ssr";
import { clientEnv } from "@/lib/env";
import type { Database } from "@/types/database.types";

/**
 * Client Supabase pour les Client Components. Utilise la clé publique
 * `anon` : soumis aux policies RLS (§17 du CDC), jamais de bypass ici.
 *
 * `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` sont optionnels tant que le projet
 * Supabase n'existe pas (Sprint 0). Une fois créés (voir .env.example),
 * ce client fonctionne sans autre changement.
 */
export function createClient() {
  if (!clientEnv.NEXT_PUBLIC_SUPABASE_URL || !clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      "[supabase/client] NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY " +
        "doivent être définis dans .env.local (voir .env.example).",
    );
  }

  return createBrowserClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
