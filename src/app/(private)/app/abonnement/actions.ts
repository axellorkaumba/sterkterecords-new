"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientEnv } from "@/lib/env";
import {
  getPaymentProvider,
  getPlanPrice,
  resolveRegionForCountry,
  resolveProviderForCountry,
  validateCoupon,
  applyDiscount,
  type BillingPeriod,
} from "@/lib/payments";

type ActionResult = { error: string | null };

/**
 * Souscription au plan SOLO (§5, §10.1) : résout la région tarifaire et le
 * rail de paiement du pays de l'utilisateur, applique un coupon optionnel
 * (validé côté serveur, jamais fait confiance à un montant venu du client),
 * crée une ligne `payments` en attente, puis redirige vers le checkout
 * hébergé (Stripe ou Flutterwave selon le rail résolu).
 */
export async function createSubscriptionCheckoutAction(
  period: BillingPeriod,
  couponCode?: string,
): Promise<ActionResult | never> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "unauthenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("country")
    .eq("id", user.id)
    .single();

  const region = await resolveRegionForCountry(supabase, profile?.country ?? null);
  const provider = await resolveProviderForCountry(supabase, profile?.country ?? null);
  const price = await getPlanPrice(supabase, "solo", region, period);
  if (!price) return { error: "period_unavailable" };

  const coupon = couponCode ? await validateCoupon(supabase, couponCode, "solo") : null;
  if (couponCode && !coupon) return { error: "invalid_coupon" };

  const amount = applyDiscount(price.amount, coupon);

  const admin = createAdminClient();
  const { data: couponRow } = couponCode
    ? await admin.from("coupons").select("id").eq("code", couponCode).maybeSingle()
    : { data: null };

  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .insert({
      user_id: user.id,
      type: "subscription",
      provider,
      amount,
      currency: price.currency_code,
      status: "pending",
      coupon_id: couponRow?.id ?? null,
      metadata: {
        planId: "solo",
        period,
        trialDays: "0",
        ...(couponCode ? { couponCode } : {}),
      },
    })
    .select("id")
    .single();

  if (paymentError || !payment) return { error: "unknown" };

  const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL;
  const checkout = await getPaymentProvider(provider).createSubscriptionCheckout({
    userId: user.id,
    email: user.email,
    planId: "solo",
    period,
    amount,
    currency: price.currency_code,
    trialDays: 0,
    successUrl: `${siteUrl}/app/abonnement?success=1`,
    cancelUrl: `${siteUrl}/app/abonnement?canceled=1`,
    paymentId: payment.id,
  });

  await admin.from("payments").update({ external_id: checkout.externalId }).eq("id", payment.id);

  redirect(checkout.url);
}
