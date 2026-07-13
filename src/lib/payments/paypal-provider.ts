import "server-only";

import { paypalFetch } from "@/lib/payments/paypal/client";
import type {
  PaymentProviderClient,
  CreateSubscriptionCheckoutParams,
  CreateOneTimeCheckoutParams,
  CheckoutResult,
} from "./types";

interface PayPalOrderResponse {
  id: string;
  links: { rel: string; href: string }[];
}

function approvalUrl(order: PayPalOrderResponse): string {
  const link = order.links.find((l) => l.rel === "approve" || l.rel === "payer-action");
  if (!link) {
    throw new Error("[paypal] Aucun lien d'approbation retourné par l'API Orders.");
  }
  return link.href;
}

async function createOrder(input: {
  paymentId: string;
  amount: number;
  currency: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<CheckoutResult> {
  const order = await paypalFetch<PayPalOrderResponse>("/v2/checkout/orders", {
    method: "POST",
    // Clé d'idempotence PayPal — évite une double commande en cas de retry
    // réseau côté serveur (même paymentId = même requête).
    headers: { "PayPal-Request-Id": input.paymentId },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          // Seul identifiant qu'on peut faire porter par PayPal jusqu'au
          // webhook — le reste des métadonnées (type, plan, période...) vit
          // dans notre propre table `payments`, relue via cet id (voir
          // /api/webhooks/paypal, même principe que le webhook Stripe).
          custom_id: input.paymentId,
          description: input.description.slice(0, 127),
          amount: { currency_code: input.currency, value: input.amount.toFixed(2) },
        },
      ],
      application_context: {
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
        user_action: "PAY_NOW",
        brand_name: "Sterkte Records",
      },
    }),
  });

  return { url: approvalUrl(order), externalId: order.id };
}

/**
 * PayPal — rail Maroc/international (§13.2, ADR 0025). Comme Flutterwave,
 * pas d'abonnement natif utilisé ici : chaque échéance est une commande
 * PayPal (Orders API v2) à l'acte, capturée depuis le webhook
 * `CHECKOUT.ORDER.APPROVED` (voir /api/webhooks/paypal) — qui crée/prolonge
 * la ligne `subscriptions`, même mécanique que flutterwave-provider.ts.
 */
export const paypalProvider: PaymentProviderClient = {
  id: "paypal",

  async createSubscriptionCheckout(
    params: CreateSubscriptionCheckoutParams,
  ): Promise<CheckoutResult> {
    return createOrder({
      paymentId: params.paymentId,
      amount: params.amount,
      currency: params.currency,
      description: `Sterkte Records — Abonnement ${params.planId}`,
      returnUrl: params.successUrl,
      cancelUrl: params.cancelUrl,
    });
  },

  async createOneTimeCheckout(params: CreateOneTimeCheckoutParams): Promise<CheckoutResult> {
    return createOrder({
      paymentId: params.paymentId,
      amount: params.amount,
      currency: params.currency,
      description: params.description,
      returnUrl: params.successUrl,
      cancelUrl: params.cancelUrl,
    });
  },
};

export interface PayPalCaptureResult {
  id: string;
  status: string;
  purchase_units: {
    custom_id?: string;
    payments?: {
      captures?: {
        id: string;
        status: string;
        amount: { value: string; currency_code: string };
      }[];
    };
  }[];
}

/**
 * Capture côté serveur d'une commande approuvée (bonne pratique PayPal :
 * ne jamais créditer sur la seule foi du payload webhook — même principe
 * que `verifyFlutterwaveTransaction`, §17). Appelée depuis
 * `api/webhooks/paypal` sur l'évènement `CHECKOUT.ORDER.APPROVED`.
 */
export async function capturePayPalOrder(orderId: string): Promise<PayPalCaptureResult> {
  return paypalFetch<PayPalCaptureResult>(`/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
  });
}
