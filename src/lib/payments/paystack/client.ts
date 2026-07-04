import "server-only";

import { requireEnv } from "@/lib/env";

/**
 * Paystack — cartes + Mobile Money Afrique, PSP secondaire/complément à
 * Flutterwave (§11.5). Client REST fin, même logique que
 * src/lib/payments/flutterwave/client.ts.
 */
const PAYSTACK_API_BASE_URL = "https://api.paystack.co";

export async function paystackFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const secretKey = requireEnv("PAYSTACK_SECRET_KEY", "le client Paystack");

  const response = await fetch(`${PAYSTACK_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`[paystack] ${response.status} ${response.statusText} — ${body}`);
  }

  return response.json() as Promise<T>;
}
