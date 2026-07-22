"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientEnv } from "@/lib/env";
import { downloadObjectBuffer } from "@/lib/storage/r2";
import { extractPaymentProofText } from "@/lib/ocr/payment-proof";
import {
  getPaymentProvider,
  getPlanPrice,
  resolveRegionForCountry,
  resolveProviderForCountry,
  validateCoupon,
  applyDiscount,
  type BillingPeriod,
} from "@/lib/payments";
import type { ManualPaymentMethodId } from "@/lib/payments/manual-contacts";

type ActionResult = { error: string | null };

const SELF_SERVICE_PLAN_IDS = ["solo", "pro", "label"] as const;
type SelfServicePlanId = (typeof SELF_SERVICE_PLAN_IDS)[number];

function isSelfServicePlanId(value: string): value is SelfServicePlanId {
  return (SELF_SERVICE_PLAN_IDS as readonly string[]).includes(value);
}

/**
 * Souscription self-service (§5, §10.1) — checkout automatisé (Stripe/
 * Flutterwave/PayPal selon le pays). Paramétré par `planId` depuis ADR 0026 :
 * les 3 forfaits (Solo/Pro/Label) sont désormais tous self-service, plus
 * seulement Solo.
 */
export async function createSubscriptionCheckoutAction(
  planId: string,
  period: BillingPeriod,
  couponCode?: string,
): Promise<ActionResult | never> {
  if (!isSelfServicePlanId(planId)) return { error: "unknown" };

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
  const price = await getPlanPrice(supabase, planId, region, period);
  if (!price) return { error: "period_unavailable" };

  const coupon = couponCode ? await validateCoupon(supabase, couponCode, planId) : null;
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
        planId,
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
    planId,
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

/**
 * Preuve de paiement manuelle (mobile money/PayPal, §10.1 ADR 0026) — insérée
 * en attente, l'OCR (best-effort, jamais bloquant) tourne juste après pour
 * donner un indice à l'équipe de validation (`/validations`).
 */
export async function submitPaymentProof(input: {
  planId: string;
  period: BillingPeriod;
  paymentMethod: ManualPaymentMethodId;
  screenshotR2Key: string;
}): Promise<ActionResult> {
  if (!isSelfServicePlanId(input.planId)) return { error: "unknown" };
  if (!input.screenshotR2Key) return { error: "screenshot_required" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("country")
    .eq("id", user.id)
    .single();

  const region = await resolveRegionForCountry(supabase, profile?.country ?? null);
  const price = await getPlanPrice(supabase, input.planId, region, input.period);
  if (!price) return { error: "period_unavailable" };

  const { data: proof, error } = await supabase
    .from("payment_proofs")
    .insert({
      user_id: user.id,
      plan_id: input.planId,
      period: input.period,
      region_id: region,
      amount: price.amount,
      currency_code: price.currency_code,
      payment_method: input.paymentMethod,
      screenshot_r2_key: input.screenshotR2Key,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !proof) return { error: "unknown" };

  try {
    const buffer = await downloadObjectBuffer(input.screenshotR2Key);
    const { text, amount } = await extractPaymentProofText(buffer);
    if (text) {
      const admin = createAdminClient();
      await admin
        .from("payment_proofs")
        .update({ ocr_text: text, ocr_amount: amount })
        .eq("id", proof.id);
    }
  } catch {
    // OCR best-effort — une erreur ici ne doit jamais faire échouer l'upload de la preuve.
  }

  return { error: null };
}

export interface LatestPaymentProofStatus {
  status: "pending" | "approved" | "rejected";
  planId: string;
  period: BillingPeriod;
  rejectionReason: string | null;
}

/** État de la dernière preuve soumise (§10.1) — pilote le bandeau affiché sur `/app/abonnement`. */
export async function getLatestPaymentProofStatus(): Promise<LatestPaymentProofStatus | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("payment_proofs")
    .select("status, plan_id, period, rejection_reason")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return {
    status: data.status,
    planId: data.plan_id,
    period: data.period,
    rejectionReason: data.rejection_reason,
  };
}
