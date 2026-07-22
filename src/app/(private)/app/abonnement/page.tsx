import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { listPlanPrices, resolveRegionForCountry } from "@/lib/payments";
import { isSubscriptionActive } from "@/lib/subscriptions/gate";
import { getLatestPaymentProofStatus } from "./actions";
import { SubscriptionPicker } from "./subscription-picker";

export async function generateMetadata() {
  const t = await getTranslations("SubscriptionPage");
  return { title: t("title") };
}

type PlanId = "solo" | "pro" | "label";
const PLAN_IDS: PlanId[] = ["solo", "pro", "label"];

/**
 * Choix du forfait (§10.1, §5) — accessible sans condition de paiement
 * (exempté du paywall d'entrée, désormais retiré, voir ADR 0026). Les 3
 * forfaits (Solo/Pro/Label) sont tous self-service : checkout automatisé
 * (Stripe/Flutterwave/PayPal) OU preuve de paiement manuelle (mobile money/
 * PayPal, validée par l'équipe via `/validations`).
 */
export default async function AbonnementPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const { success, canceled } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: subscription }, latestProof] = await Promise.all([
    supabase.from("profiles").select("country").eq("id", user.id).single(),
    supabase
      .from("subscriptions")
      .select("plan_id, period, status, current_period_end")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getLatestPaymentProofStatus(),
  ]);

  const region = await resolveRegionForCountry(supabase, profile?.country ?? null);
  const pricesByPlan = Object.fromEntries(
    await Promise.all(
      PLAN_IDS.map(async (planId) => [
        planId,
        (await listPlanPrices(supabase, planId, region)).map((p) => ({
          period: p.period,
          currency: p.currency_code,
          amount: p.amount,
        })),
      ]),
    ),
  ) as Record<PlanId, { period: "monthly" | "annual"; currency: string; amount: number }[]>;

  const isActive = isSubscriptionActive(subscription?.status, subscription?.current_period_end);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-8">
      <SubscriptionPicker
        pricesByPlan={pricesByPlan}
        currentPlanId={isActive ? ((subscription?.plan_id ?? null) as PlanId | null) : null}
        currentPeriod={isActive ? (subscription?.period ?? null) : null}
        justSucceeded={success === "1"}
        justCanceled={canceled === "1"}
        latestProof={latestProof}
      />
    </div>
  );
}
