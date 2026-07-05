import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type SubscriptionStatus = Database["public"]["Enums"]["subscription_status"];

/** Isolé dans une fonction dédiée (pas inline dans un composant) — `Date.now()` y est un appel impur toléré, hors du corps d'un composant/hook. */
export function isSubscriptionActive(
  status: SubscriptionStatus | null | undefined,
  currentPeriodEnd: string | null | undefined,
): boolean {
  if (status !== "active") return false;
  if (!currentPeriodEnd) return true;
  return new Date(currentPeriodEnd).getTime() > Date.now();
}

/**
 * Pas de dépendance à `server-only` : utilisée aussi bien depuis `src/proxy.ts`
 * (runtime Edge) que depuis des Server Components (même convention que
 * `src/lib/supabase/profile.ts`).
 *
 * Éligibilité à `/app` (§10.1 : paiement avant accès) — deux voies :
 * - Un artiste au forfait Label (`artists.plan = 'label'`) : géré en
 *   back-office, pas de paiement self-service attendu (§3.1, §11.10).
 * - Un abonnement self-service actif et non expiré (`subscriptions`, dernière
 *   ligne par date de création — table historisée, pas une ligne mutable
 *   unique, voir la migration Sprint 6).
 */
export async function hasActiveEntitlement(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<boolean> {
  const { data: labelArtist } = await supabase
    .from("artists")
    .select("id")
    .eq("owner_id", userId)
    .eq("plan", "label")
    .limit(1)
    .maybeSingle();

  if (labelArtist) return true;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return isSubscriptionActive(subscription?.status, subscription?.current_period_end);
}
