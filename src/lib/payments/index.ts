import "server-only";

import { stripeProvider } from "./stripe-provider";
import { flutterwaveProvider } from "./flutterwave-provider";
import type { PaymentProviderClient, PaymentProviderId } from "./types";

export type {
  PaymentProviderClient,
  PaymentProviderId,
  BillingPeriod,
  CreateSubscriptionCheckoutParams,
  CreateOneTimeCheckoutParams,
  CheckoutResult,
} from "./types";
export * from "./pricing";

/** Point d'entrée unique des rails de paiement (§13.2) — voir docs/adr/0010-abonnement-paiements.md. */
export function getPaymentProvider(id: PaymentProviderId): PaymentProviderClient {
  return id === "stripe" ? stripeProvider : flutterwaveProvider;
}
