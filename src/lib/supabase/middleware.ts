import "server-only";

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { clientEnv } from "@/lib/env";
import type { Database } from "@/types/database.types";

/**
 * Rafraîchissement de session Supabase dans `src/proxy.ts` (convention
 * Next.js ≥16, ex-"middleware"). Pattern documenté par Supabase pour le SSR :
 * https://supabase.com/docs/guides/auth/server-side/nextjs
 *
 * `supabase.auth.getUser()` (et non `getSession()`) revalide le JWT auprès du
 * serveur Auth à chaque requête — indispensable ici puisque c'est le seul
 * endroit qui peut réécrire le cookie de session avant qu'il n'atteigne les
 * Server Components (lecture seule, voir src/lib/supabase/server.ts).
 *
 * Si `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` ne sont pas configurées (aucun
 * projet Supabase branché), `user` reste `null` — les routes protégées
 * redirigent alors vers `/connexion` comme pour un visiteur anonyme.
 */
export async function updateSupabaseSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!clientEnv.NEXT_PUBLIC_SUPABASE_URL || !clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { supabaseResponse, user: null, supabase: null };
  }

  const supabase = createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return { supabaseResponse, user, supabase };
  } catch (error) {
    // `getUser()` tente un rafraîchissement en coulisses et peut *lever*
    // (plutôt que renvoyer `{ error }`) quand le refresh token du cookie
    // est déjà périmé/tourné — un onglet resté ouvert après qu'un autre a
    // déjà consommé ce token, par exemple (constaté en prod, "Invalid
    // Refresh Token: Refresh Token Not Found"). Sans ce filet, ça faisait
    // planter le middleware sur *toute* requête suivante. Traité comme "non
    // connecté", exactement le même chemin que ci-dessus quand Supabase
    // n'est pas configuré — la prochaine connexion pose un cookie propre.
    console.error("[middleware] Session Supabase invalide, traitée comme déconnectée :", error);
    return { supabaseResponse, user: null, supabase: null };
  }
}
