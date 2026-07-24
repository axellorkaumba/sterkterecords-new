"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { withdrawalAmountSchema, type WithdrawalAmountValues } from "./schemas";

type ActionResult = { error: string | null };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("[revenus] Non authentifié.");
  return { supabase, user };
}

/**
 * Demande de retrait (§11.5, module Royalties). `payout_method`/
 * `payout_details` sont copiés depuis `payout_methods` au moment de la
 * demande (voir le commentaire de la migration 20260722160000) — un
 * changement de moyen de retrait après coup ne modifie pas une demande déjà
 * en attente. Le plafond (`amount <= wallet.balance_available`) est vérifié
 * ici plutôt qu'en RLS déclarative, même limite que la validation de coupon
 * (ADR 0031 §5) : `wallet.balance_available` est recalculé par trigger
 * (`recompute_wallet`), donc toujours à jour au moment de cette lecture.
 */
export async function requestWithdrawal(values: WithdrawalAmountValues): Promise<ActionResult> {
  const parsed = withdrawalAmountSchema.safeParse(values);
  if (!parsed.success) return { error: "invalid" };
  const { supabase, user } = await requireUser();

  const [{ data: wallet }, { data: payoutMethod }] = await Promise.all([
    supabase
      .from("wallet")
      .select("balance_available, currency")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("payout_methods").select("method, details").eq("user_id", user.id).maybeSingle(),
  ]);

  if (!payoutMethod) return { error: "no_payout_method" };
  if (!wallet || parsed.data.amount > wallet.balance_available) {
    return { error: "insufficient_balance" };
  }

  const { error } = await supabase.from("withdrawals").insert({
    user_id: user.id,
    amount: parsed.data.amount,
    currency: wallet.currency,
    payout_method: payoutMethod.method,
    payout_details: payoutMethod.details,
  });

  if (error) return { error: "unknown" };
  revalidatePath("/app/revenus");
  return { error: null };
}
