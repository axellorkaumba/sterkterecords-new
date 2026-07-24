import { NextResponse, type NextRequest } from "next/server";
import { capturePayPalOrder } from "@/lib/payments/paypal-provider";
import { paypalFetch } from "@/lib/payments/paypal/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEnv } from "@/lib/env";
import { sendPaymentReceiptForUser } from "@/lib/email/receipt";
import type { Json } from "@/types/database.types";

interface PayPalWebhookEvent {
  event_type: string;
  resource: { id: string };
}

interface PayPalVerificationResponse {
  verification_status: "SUCCESS" | "FAILURE";
}

interface PaymentMetadata {
  planId?: string;
  period?: "monthly" | "annual";
  trialDays?: string;
  couponCode?: string;
}

async function notify(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  type: string,
  payload: Record<string, unknown>,
) {
  await admin
    .from("notifications")
    .insert({ user_id: userId, channel: "inapp", type, payload: payload as Json });
}

/**
 * Webhook PayPal (§13.2, ADR 0025) — vérification via l'API dédiée
 * `/v1/notifications/verify-webhook-signature` (PayPal n'utilise pas une
 * simple signature HMAC calculable localement comme Stripe, ni un secret
 * partagé statique comme Flutterwave). Sur `CHECKOUT.ORDER.APPROVED`, on
 * capture la commande côté serveur (jamais fait confiance au seul payload
 * webhook, §17 — même principe que `verifyFlutterwaveTransaction`) avant de
 * créditer quoi que ce soit.
 *
 * Comme le webhook Flutterwave, distingue abonnement/addon via notre propre
 * ligne `payments.type` (PayPal ne transporte que `custom_id` = notre
 * `paymentId`, pas de sac de métadonnées libre comme Flutterwave).
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const event = JSON.parse(rawBody) as PayPalWebhookEvent;
  const webhookId = requireEnv("PAYPAL_WEBHOOK_ID", "le webhook PayPal");

  const verification = await paypalFetch<PayPalVerificationResponse>(
    "/v1/notifications/verify-webhook-signature",
    {
      method: "POST",
      body: JSON.stringify({
        auth_algo: request.headers.get("paypal-auth-algo"),
        cert_url: request.headers.get("paypal-cert-url"),
        transmission_id: request.headers.get("paypal-transmission-id"),
        transmission_sig: request.headers.get("paypal-transmission-sig"),
        transmission_time: request.headers.get("paypal-transmission-time"),
        webhook_id: webhookId,
        webhook_event: event,
      }),
    },
  );

  if (verification.verification_status !== "SUCCESS") {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  if (event.event_type !== "CHECKOUT.ORDER.APPROVED") {
    return NextResponse.json({ received: true });
  }

  const capture = await capturePayPalOrder(event.resource.id);
  const capturedUnit = capture.purchase_units[0];
  const paymentId = capturedUnit?.custom_id;
  const captureStatus = capturedUnit?.payments?.captures?.[0]?.status;

  if (!paymentId || captureStatus !== "COMPLETED") {
    return NextResponse.json({ received: true });
  }

  const admin = createAdminClient();
  const { data: payment } = await admin
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .maybeSingle();
  if (!payment || payment.status === "succeeded") {
    return NextResponse.json({ received: true });
  }

  // Corrigé en audit : PayPal documente explicitement que le même événement
  // webhook peut être livré plus d'une fois — la lecture ci-dessus et
  // l'écriture qui suivait étaient deux requêtes séparées, sans lien entre
  // elles. Deux livraisons quasi simultanées passaient toutes les deux le
  // `payment.status === "succeeded"` avant qu'aucune n'écrive, créant deux
  // abonnements, deux emails de reçu, et un coupon compté deux fois pour un
  // seul paiement réel. L'UPDATE porte maintenant sa propre garde
  // (`status != 'succeeded'`) : seule la livraison qui affecte réellement la
  // ligne poursuit vers les effets de bord.
  const { data: claimed } = await admin
    .from("payments")
    .update({ status: "succeeded", external_id: capture.id })
    .eq("id", paymentId)
    .neq("status", "succeeded")
    .select("id")
    .maybeSingle();
  if (!claimed) {
    return NextResponse.json({ received: true });
  }

  if (payment.type === "subscription") {
    const metadata = payment.metadata as PaymentMetadata;
    const period = metadata.period === "annual" ? "annual" : "monthly";
    const periodDays = period === "annual" ? 365 : 30;
    const trialDays = Number(metadata.trialDays ?? "0");

    await admin.from("subscriptions").insert({
      user_id: payment.user_id,
      plan_id: metadata.planId ?? "solo",
      period,
      status: "active",
      provider: "paypal",
      external_id: capture.id,
      coupon_id: payment.coupon_id,
      trial_ends_at:
        trialDays > 0 ? new Date(Date.now() + trialDays * 86400000).toISOString() : null,
      current_period_end: new Date(Date.now() + periodDays * 86400000).toISOString(),
    });

    if (metadata.couponCode) {
      await admin.rpc("increment_coupon_redemption", { coupon_code: metadata.couponCode });
    }

    await notify(admin, payment.user_id, "subscription_active", { planId: metadata.planId });
    await sendPaymentReceiptForUser(
      admin,
      payment.user_id,
      "subscription",
      period === "annual" ? "soloAnnual" : "soloMonthly",
      payment.amount,
      payment.currency,
    );
  } else if (payment.type === "addon") {
    await notify(admin, payment.user_id, "addon_paid", { paymentId });
    await sendPaymentReceiptForUser(
      admin,
      payment.user_id,
      "addon",
      "appleMusicArtwork",
      payment.amount,
      payment.currency,
    );
  }

  return NextResponse.json({ received: true });
}
