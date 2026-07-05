import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/payments/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEnv } from "@/lib/env";
import type { Database, Json } from "@/types/database.types";

type SubscriptionStatus = Database["public"]["Enums"]["subscription_status"];

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "trialing":
    case "active":
      return "active";
    case "past_due":
    case "paused":
      return "past_due";
    case "incomplete":
      return "incomplete";
    default:
      return "canceled";
  }
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
 * Webhook Stripe (§13.2) — corps brut requis pour la vérification de
 * signature (§17 : "webhooks signés"), donc `request.text()` et jamais
 * `request.json()` avant `constructEvent`. Client `service_role` (aucune
 * session utilisateur dans un webhook), même exception documentée que pour
 * `audit_log` (voir src/lib/supabase/admin.ts).
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const stripe = getStripeClient();
  const webhookSecret = requireEnv("STRIPE_WEBHOOK_SECRET", "le webhook Stripe");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = session.metadata?.paymentId;
      if (!paymentId) break;

      const { data: payment } = await admin
        .from("payments")
        .select("*")
        .eq("id", paymentId)
        .maybeSingle();
      if (!payment) break;

      await admin
        .from("payments")
        .update({ status: "succeeded", external_id: session.id })
        .eq("id", paymentId);

      if (session.mode === "subscription" && typeof session.subscription === "string") {
        const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);
        const metadata = payment.metadata as PaymentMetadata;
        const trialDays = Number(metadata.trialDays ?? "0");

        await admin.from("subscriptions").insert({
          user_id: payment.user_id,
          plan_id: metadata.planId ?? "solo",
          period: metadata.period ?? "monthly",
          status: mapStripeStatus(stripeSubscription.status),
          provider: "stripe",
          external_id: stripeSubscription.id,
          coupon_id: payment.coupon_id,
          trial_ends_at:
            trialDays > 0 ? new Date(Date.now() + trialDays * 86400000).toISOString() : null,
          current_period_end: new Date(
            (stripeSubscription.items.data[0]?.current_period_end ?? 0) * 1000,
          ).toISOString(),
        });

        if (metadata.couponCode) {
          await admin.rpc("increment_coupon_redemption", { coupon_code: metadata.couponCode });
        }

        await notify(admin, payment.user_id, "subscription_active", { planId: metadata.planId });
      } else if (session.mode === "payment") {
        await notify(admin, payment.user_id, "addon_paid", { paymentId });
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null };
      if (!invoice.subscription) break;

      const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription);
      const { data: subscription } = await admin
        .from("subscriptions")
        .select("id, user_id")
        .eq("external_id", stripeSubscription.id)
        .maybeSingle();
      if (!subscription) break;

      await admin
        .from("subscriptions")
        .update({
          status: mapStripeStatus(stripeSubscription.status),
          current_period_end: new Date(
            (stripeSubscription.items.data[0]?.current_period_end ?? 0) * 1000,
          ).toISOString(),
        })
        .eq("id", subscription.id);

      if (invoice.billing_reason === "subscription_cycle") {
        await admin.from("payments").insert({
          user_id: subscription.user_id,
          type: "subscription",
          provider: "stripe",
          amount: invoice.amount_paid / 100,
          currency: invoice.currency.toUpperCase(),
          status: "succeeded",
          external_id: invoice.id,
        });
        await notify(admin, subscription.user_id, "subscription_renewed", {});
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const stripeSubscription = event.data.object as Stripe.Subscription;
      await admin
        .from("subscriptions")
        .update({
          status:
            event.type === "customer.subscription.deleted"
              ? "canceled"
              : mapStripeStatus(stripeSubscription.status),
          current_period_end: new Date(
            (stripeSubscription.items.data[0]?.current_period_end ?? 0) * 1000,
          ).toISOString(),
        })
        .eq("external_id", stripeSubscription.id);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
