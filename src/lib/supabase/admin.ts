import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { clientEnv, requireEnv } from "@/lib/env";
import type { Database } from "@/types/database.types";

/**
 * Client Supabase "admin" — clé `service_role`, contourne TOUTES les
 * policies RLS (§17). Réservé aux opérations serveur qui doivent agir en
 * dehors du contexte d'un utilisateur (webhooks PSP/LabelGrid, jobs Inngest,
 * scripts de migration). Ne jamais l'utiliser pour servir une requête
 * utilisateur directe : passer par `src/lib/supabase/server.ts` (RLS)
 * dans ce cas pour garder la défense en profondeur du §17.
 *
 * `import "server-only"` fait planter le build si ce module est importé
 * (même transitivement) depuis un Client Component.
 */
export function createAdminClient() {
  const url = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("[supabase/admin] NEXT_PUBLIC_SUPABASE_URL doit être défini dans .env.local.");
  }
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY", "le client Supabase admin");

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
