import "server-only";

import { getStripeClient } from "@/lib/payments/stripe/client";
import type {
  PaymentProviderClient,
  CreateSubscriptionCheckoutParams,
  CreateOneTimeCheckoutParams,
  CheckoutResult,
} from "./types";

/**
 * Stripe — rail international carte (§11.5, §13.2). Les prix viennent de
 * `plan_prices`/`addon_prices` (DB, §5.2) : on utilise `price_data` inline
 * (montant/devise dynamiques) plutôt que des Price objects préconfigurés
 * dans le dashboard Stripe, pour rester fidèle au principe "aucune valeur
 * codée en dur, tout piloté par la config" (voir ADR 0010).
 */
export const stripeProvider: PaymentProviderClient = {
  id: "stripe",

  async createSubscriptionCheckout(
    params: CreateSubscriptionCheckoutParams,
  ): Promise<CheckoutResult> {
    const stripe = getStripeClient();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: params.email,
      client_reference_id: params.userId,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: { paymentId: params.paymentId, planId: params.planId, period: params.period },
      subscription_data: {
        metadata: { paymentId: params.paymentId, planId: params.planId, userId: params.userId },
        ...(params.trialDays > 0 ? { trial_period_days: params.trialDays } : {}),
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: params.currency.toLowerCase(),
            unit_amount: Math.round(params.amount * 100),
            recurring: { interval: params.period === "monthly" ? "month" : "year" },
            product_data: { name: `Sterkte Records — ${params.planId}` },
          },
        },
      ],
    });

    if (!session.url) {
      throw new Error("[stripe] La session de paiement n'a pas retourné d'URL de redirection.");
    }
    return { url: session.url, externalId: session.id };
  },

  async createOneTimeCheckout(params: CreateOneTimeCheckoutParams): Promise<CheckoutResult> {
    const stripe = getStripeClient();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: params.email,
      client_reference_id: params.userId,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: { paymentId: params.paymentId, userId: params.userId },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: params.currency.toLowerCase(),
            unit_amount: Math.round(params.amount * 100),
            product_data: { name: params.description },
          },
        },
      ],
    });

    if (!session.url) {
      throw new Error("[stripe] La session de paiement n'a pas retourné d'URL de redirection.");
    }
    return { url: session.url, externalId: session.id };
  },
};
