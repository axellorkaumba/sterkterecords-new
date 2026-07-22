import "server-only";

import { stripeProvider } from "./stripe-provider";
import { flutterwaveProvider } from "./flutterwave-provider";
import { paypalProvider } from "./paypal-provider";
import { manualProvider } from "./manual-provider";
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

const PROVIDERS: Record<PaymentProviderId, PaymentProviderClient> = {
  stripe: stripeProvider,
  flutterwave: flutterwaveProvider,
  paypal: paypalProvider,
  manual: manualProvider,
};

/**
 * Point d'entrée unique des rails de paiement (§13.2) — voir
 * docs/adr/0010-abonnement-paiements.md et docs/adr/0025-paypal-payment-provider.md.
 */
export function getPaymentProvider(id: PaymentProviderId): PaymentProviderClient {
  return PROVIDERS[id];
}
