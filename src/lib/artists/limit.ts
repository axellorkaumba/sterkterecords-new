import "server-only";

import type { createClient } from "@/lib/supabase/server";
import { isSubscriptionActive } from "@/lib/subscriptions/gate";

/**
 * Nombre maximum d'artistes autorisé pour ce compte (ADR 0026 — plafond de 5
 * artistes pour le forfait Label, demande explicite d'Axel). Dérivé de
 * l'abonnement actif le plus récent ; un compte sans abonnement actif (accès
 * immédiat à `/app`, pas encore validé — voir ADR 0026) reste plafonné à 1,
 * comme le forfait Solo par défaut.
 */
export async function getArtistLimit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<number> {
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan_id, status, current_period_end")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const planId =
    subscription && isSubscriptionActive(subscription.status, subscription.current_period_end)
      ? subscription.plan_id
      : "solo";

  const { data: plan } = await supabase
    .from("plans")
    .select("max_artists")
    .eq("id", planId)
    .maybeSingle();

  return plan?.max_artists ?? 1;
}
