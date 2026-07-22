"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession, clearAdminSessionCookie } from "@/lib/admin-auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPresignedDownloadUrl } from "@/lib/storage/r2";
import type { Database } from "@/types/database.types";

type ActionResult = { error: string | null };
type BillingPeriod = Database["public"]["Enums"]["billing_period"];

export interface PendingPaymentProof {
  id: string;
  userEmail: string | null;
  userFullName: string | null;
  planId: string;
  period: BillingPeriod;
  amount: number;
  currencyCode: string;
  paymentMethod: string;
  screenshotUrl: string;
  ocrText: string | null;
  ocrAmount: number | null;
  createdAt: string;
}

const PERIOD_TO_DAYS: Record<BillingPeriod, number> = { monthly: 30, annual: 365 };

/** File de validation (§ ADR 0026) — la plus ancienne demande d'abord. */
export async function listPendingPaymentProofs(): Promise<PendingPaymentProof[]> {
  await requireAdminSession();
  const admin = createAdminClient();

  const { data: proofs } = await admin
    .from("payment_proofs")
    .select("*, profiles(full_name)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (!proofs || proofs.length === 0) return [];

  return Promise.all(
    proofs.map(async (proof) => {
      const [{ data: userData }, { url: screenshotUrl }] = await Promise.all([
        admin.auth.admin.getUserById(proof.user_id),
        createPresignedDownloadUrl(proof.screenshot_r2_key),
      ]);

      return {
        id: proof.id,
        userEmail: userData.user?.email ?? null,
        userFullName: proof.profiles?.full_name ?? null,
        planId: proof.plan_id,
        period: proof.period,
        amount: proof.amount,
        currencyCode: proof.currency_code,
        paymentMethod: proof.payment_method,
        screenshotUrl,
        ocrText: proof.ocr_text,
        ocrAmount: proof.ocr_amount,
        createdAt: proof.created_at,
      };
    }),
  );
}

/**
 * Approuve une preuve de paiement (§ ADR 0026) : crée l'abonnement (période
 * fixe — 30 jours pour un mensuel, 365 pour un annuel, comptés à partir de
 * MAINTENANT, pas de la date d'upload) et la ligne `payments` correspondante,
 * exactement comme le ferait un webhook PSP pour un paiement automatisé.
 */
export async function approvePaymentProof(proofId: string): Promise<ActionResult> {
  const session = await requireAdminSession();
  const admin = createAdminClient();

  const { data: proof } = await admin
    .from("payment_proofs")
    .select("*")
    .eq("id", proofId)
    .eq("status", "pending")
    .single();
  if (!proof) return { error: "not_found" };

  const now = new Date();
  const currentPeriodEnd = new Date(now);
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + PERIOD_TO_DAYS[proof.period]);

  const { error: subscriptionError } = await admin.from("subscriptions").insert({
    user_id: proof.user_id,
    plan_id: proof.plan_id,
    period: proof.period,
    status: "active",
    provider: "manual",
    current_period_end: currentPeriodEnd.toISOString(),
  });
  if (subscriptionError) return { error: "unknown" };

  await admin.from("payments").insert({
    user_id: proof.user_id,
    type: "subscription",
    provider: "manual",
    amount: proof.amount,
    currency: proof.currency_code,
    status: "succeeded",
    metadata: { planId: proof.plan_id, period: proof.period, paymentProofId: proof.id },
  });

  await admin
    .from("payment_proofs")
    .update({ status: "approved", reviewed_by: session.sub, reviewed_at: now.toISOString() })
    .eq("id", proofId);

  await admin.from("notifications").insert({
    user_id: proof.user_id,
    channel: "inapp",
    type: "payment_approved",
    payload: { planId: proof.plan_id, period: proof.period },
  });

  revalidatePath("/validations");
  return { error: null };
}

export async function rejectPaymentProof(proofId: string, reason: string): Promise<ActionResult> {
  const session = await requireAdminSession();
  if (!reason.trim()) return { error: "reason_required" };

  const admin = createAdminClient();
  const { data: proof } = await admin
    .from("payment_proofs")
    .select("id, user_id")
    .eq("id", proofId)
    .eq("status", "pending")
    .single();
  if (!proof) return { error: "not_found" };

  await admin
    .from("payment_proofs")
    .update({
      status: "rejected",
      rejection_reason: reason.trim(),
      reviewed_by: session.sub,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", proofId);

  await admin.from("notifications").insert({
    user_id: proof.user_id,
    channel: "inapp",
    type: "payment_rejected",
    payload: { reason: reason.trim() },
  });

  revalidatePath("/validations");
  return { error: null };
}

export async function logoutAdmin(): Promise<never> {
  await clearAdminSessionCookie();
  redirect("/validations/connexion");
}
