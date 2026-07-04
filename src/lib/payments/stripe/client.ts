import "server-only";

import Stripe from "stripe";
import { requireEnv } from "@/lib/env";

/**
 * Stripe — abonnements & add-ons pour les marchés internationaux (§11.5).
 * Indisponible en RDC : Flutterwave/Paystack (src/lib/payments/flutterwave,
 * .../paystack) sont le rail par défaut pour ce marché.
 *
 * La logique métier (créer un abonnement, gérer les webhooks) sera ajoutée
 * avec le Sprint Paiements — ce module ne fournit que le client configuré.
 */
let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (stripeClient) return stripeClient;

  const secretKey = requireEnv("STRIPE_SECRET_KEY", "le client Stripe");
  stripeClient = new Stripe(secretKey, {
    typescript: true,
  });

  return stripeClient;
}
