import { NextResponse, type NextRequest } from "next/server";
import { verifyFlutterwaveTransaction } from "@/lib/payments/flutterwave-provider";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEnv } from "@/lib/env";
import type { Json } from "@/types/database.types";

interface FlutterwaveWebhookPayload {
  event: string;
  data: {
    id: number;
    tx_ref: string;
    status: string;
    amount: number;
    currency: string;
    meta?: Record<string, string> | null;
  };
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
 * Webhook Flutterwave (§13.2) — `verif-hash` est un secret partagé renvoyé
 * tel quel par Flutterwave (pas une signature HMAC du corps), configuré côté
 * dashboard Flutterwave. Conformément aux bonnes pratiques Flutterwave, le
 * payload webhook n'est JAMAIS considéré fiable seul : on re-vérifie la
 * transaction via l'API avant de créditer quoi que ce soit (§17).
 */
export async function POST(request: NextRequest) {
  const receivedHash = request.headers.get("verif-hash");
  const expectedHash = requireEnv("FLUTTERWAVE_WEBHOOK_SECRET_HASH", "le webhook Flutterwave");

  if (!receivedHash || receivedHash !== expectedHash) {
    return NextResponse.json({ error: "invalid_hash" }, { status: 401 });
  }

  const payload = (await request.json()) as FlutterwaveWebhookPayload;
  if (payload.event !== "charge.completed") {
    return NextResponse.json({ received: true });
  }

  const verification = await verifyFlutterwaveTransaction(String(payload.data.id));
  if (verification.data.status !== "successful") {
    return NextResponse.json({ received: true });
  }

  const meta = verification.data.meta ?? {};
  const paymentId = meta.paymentId;
  if (!paymentId) {
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

  await admin
    .from("payments")
    .update({ status: "succeeded", external_id: String(verification.data.id) })
    .eq("id", paymentId);

  if (meta.kind === "subscription") {
    const period = meta.period === "annual" ? "annual" : "monthly";
    const periodDays = period === "annual" ? 365 : 30;
    const trialDays = Number(meta.trialDays ?? "0");

    await admin.from("subscriptions").insert({
      user_id: payment.user_id,
      plan_id: meta.planId ?? "solo",
      period,
      status: "active",
      provider: "flutterwave",
      external_id: null,
      coupon_id: payment.coupon_id,
      trial_ends_at:
        trialDays > 0 ? new Date(Date.now() + trialDays * 86400000).toISOString() : null,
      current_period_end: new Date(Date.now() + periodDays * 86400000).toISOString(),
    });

    if (meta.couponCode) {
      await admin.rpc("increment_coupon_redemption", { coupon_code: meta.couponCode });
    }

    await notify(admin, payment.user_id, "subscription_active", { planId: meta.planId });
  } else if (meta.kind === "addon") {
    await notify(admin, payment.user_id, "addon_paid", { paymentId });
  }

  return NextResponse.json({ received: true });
}
