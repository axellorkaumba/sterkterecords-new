import "server-only";

import { flutterwaveFetch } from "@/lib/payments/flutterwave/client";
import type {
  PaymentProviderClient,
  CreateSubscriptionCheckoutParams,
  CreateOneTimeCheckoutParams,
  CheckoutResult,
} from "./types";

interface FlutterwaveCheckoutResponse {
  status: string;
  data: { link: string };
}

async function createHostedCheckout(input: {
  txRef: string;
  amount: number;
  currency: string;
  email: string;
  redirectUrl: string;
  title: string;
  meta: Record<string, string>;
}): Promise<CheckoutResult> {
  const result = await flutterwaveFetch<FlutterwaveCheckoutResponse>("/payments", {
    method: "POST",
    body: JSON.stringify({
      tx_ref: input.txRef,
      amount: input.amount,
      currency: input.currency,
      redirect_url: input.redirectUrl,
      customer: { email: input.email },
      customizations: { title: input.title },
      meta: input.meta,
    }),
  });

  return { url: result.data.link, externalId: input.txRef };
}

/**
 * Flutterwave — rail Afrique cartes + Mobile Money (M-Pesa, Airtel, Orange,
 * MTN — §11.5, PSP par défaut RDC). Pas d'objet "abonnement" natif fiable
 * pour ces rails : chaque échéance est un paiement à l'acte (lien de
 * paiement hébergé). Le webhook, une fois le paiement confirmé, crée/
 * prolonge la ligne `subscriptions` (`current_period_end = maintenant +
 * période`) — le renouvellement automatique (relance à l'approche de
 * l'échéance) est différé au job planifié (Inngest, pas encore construit,
 * voir ADR 0010), comme le reporting mensuel LabelGrid (§13.1).
 *
 * `cancelUrl` n'est pas utilisé : l'API Checkout Flutterwave n'accepte
 * qu'une seule URL de retour, avec le statut ajouté en query string
 * (`?status=successful|cancelled&tx_ref=...`) — c'est la page de retour qui
 * distingue les deux cas.
 */
export const flutterwaveProvider: PaymentProviderClient = {
  id: "flutterwave",

  async createSubscriptionCheckout(
    params: CreateSubscriptionCheckoutParams,
  ): Promise<CheckoutResult> {
    return createHostedCheckout({
      txRef: `sub_${params.paymentId}`,
      amount: params.amount,
      currency: params.currency,
      email: params.email,
      redirectUrl: params.successUrl,
      title: "Sterkte Records — Abonnement",
      meta: {
        paymentId: params.paymentId,
        kind: "subscription",
        planId: params.planId,
        period: params.period,
        userId: params.userId,
      },
    });
  },

  async createOneTimeCheckout(params: CreateOneTimeCheckoutParams): Promise<CheckoutResult> {
    return createHostedCheckout({
      txRef: `addon_${params.paymentId}`,
      amount: params.amount,
      currency: params.currency,
      email: params.email,
      redirectUrl: params.successUrl,
      title: params.description,
      meta: { paymentId: params.paymentId, kind: "addon", userId: params.userId },
    });
  },
};

export interface FlutterwaveTransactionVerification {
  status: string;
  data: {
    id: number;
    tx_ref: string;
    status: "successful" | "failed" | string;
    amount: number;
    currency: string;
    meta: Record<string, string> | null;
  };
}

/**
 * Re-vérification côté serveur d'une transaction (bonne pratique
 * Flutterwave : ne jamais faire confiance au seul payload webhook). Appelée
 * depuis `api/webhooks/flutterwave`.
 */
export async function verifyFlutterwaveTransaction(
  transactionId: string,
): Promise<FlutterwaveTransactionVerification> {
  return flutterwaveFetch<FlutterwaveTransactionVerification>(
    `/transactions/${transactionId}/verify`,
  );
}
