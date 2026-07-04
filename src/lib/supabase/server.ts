import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { clientEnv } from "@/lib/env";
import type { Database } from "@/types/database.types";

/**
 * Client Supabase pour Server Components / Server Actions / Route Handlers.
 * Propage les cookies de session HTTP-only — soumis aux policies RLS (§17).
 *
 * `setAll` peut échouer si appelé depuis un Server Component pur (lecture
 * seule) : c'est attendu, Next.js gère le rafraîchissement de session via le
 * middleware (branché au Sprint 3).
 */
export async function createClient() {
  if (!clientEnv.NEXT_PUBLIC_SUPABASE_URL || !clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      "[supabase/server] NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY " +
        "doivent être définis dans .env.local (voir .env.example).",
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Appelé depuis un Server Component (lecture seule) : ignoré,
            // le middleware se charge du rafraîchissement de session.
          }
        },
      },
    },
  );
}
