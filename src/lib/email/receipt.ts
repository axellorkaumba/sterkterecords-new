import "server-only";

import type { createAdminClient } from "@/lib/supabase/admin";
import {
  sendPaymentReceiptEmail,
  resolveUserLocale,
  type PaymentReceiptDescriptionKey,
} from "./send";

/**
 * Partagé par les webhooks Stripe et Flutterwave (§13.2) — `auth.users`
 * n'est pas exposé via PostgREST, l'email se lit via l'API admin Supabase
 * Auth (`auth.admin.getUserById`), disponible uniquement côté service_role.
 */
export async function sendPaymentReceiptForUser(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  kind: "subscription" | "addon",
  descriptionKey: PaymentReceiptDescriptionKey,
  amount: number,
  currency: string,
): Promise<void> {
  const { data } = await admin.auth.admin.getUserById(userId);
  if (!data.user?.email) return;

  const locale = await resolveUserLocale(userId);
  await sendPaymentReceiptEmail({
    to: data.user.email,
    locale,
    kind,
    descriptionKey,
    amountLabel: new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount),
    dateLabel: new Date().toLocaleDateString(locale),
  });
}
