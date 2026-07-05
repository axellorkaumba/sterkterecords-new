import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { listPlanPrices, resolveRegionForCountry } from "@/lib/payments";
import { isSubscriptionActive } from "@/lib/subscriptions/gate";
import { SubscriptionPicker } from "./subscription-picker";

export async function generateMetadata() {
  const t = await getTranslations("SubscriptionPage");
  return { title: t("title") };
}

/**
 * Choix du forfait (§10.1, §5) — s'insère entre la vérification d'email et
 * l'onboarding profil artiste (voir docs/adr/0008, point 1 : "le choix de
 * forfait/paiement viendra s'insérer avant cette étape quand le module sera
 * construit" — c'est ce sprint qui tient cette promesse). Exempté du paywall
 * (src/proxy.ts) : il faut pouvoir y accéder sans abonnement actif.
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

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from("profiles").select("country").eq("id", user.id).single(),
    supabase
      .from("subscriptions")
      .select("plan_id, period, status, current_period_end")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const region = await resolveRegionForCountry(supabase, profile?.country ?? null);
  const prices = await listPlanPrices(supabase, "solo", region);

  const isActive = isSubscriptionActive(subscription?.status, subscription?.current_period_end);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-8">
      <SubscriptionPicker
        prices={prices.map((p) => ({
          period: p.period,
          currency: p.currency_code,
          amount: p.amount,
        }))}
        currentPlanId={isActive ? (subscription?.plan_id ?? null) : null}
        currentPeriod={isActive ? (subscription?.period ?? null) : null}
        justSucceeded={success === "1"}
        justCanceled={canceled === "1"}
      />
    </div>
  );
}
