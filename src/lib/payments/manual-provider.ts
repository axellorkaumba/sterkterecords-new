import "server-only";

import type { PaymentProviderClient } from "./types";

/**
 * Rail "manuel" (mobile money/PayPal validés à la main, ADR 0026) — n'est
 * JAMAIS résolu par `resolveProviderForCountry` (qui ne renvoie que stripe/
 * flutterwave/paypal) : les abonnements/paiements `provider = 'manual'` sont
 * créés directement par `approvePaymentProof` (`/validations`), jamais via un
 * checkout. Cette implémentation n'existe que pour satisfaire l'exhaustivité
 * du `Record<PaymentProviderId, PaymentProviderClient>` de `getPaymentProvider` —
 * un appel réel serait un bug (checkout demandé pour un rail sans checkout).
 */
export const manualProvider: PaymentProviderClient = {
  id: "manual",
  async createSubscriptionCheckout() {
    throw new Error(
      "[manual] Le rail de paiement manuel n'a pas de checkout — les abonnements 'manual' sont créés par /validations.",
    );
  },
  async createOneTimeCheckout() {
    throw new Error(
      "[manual] Le rail de paiement manuel n'a pas de checkout — les abonnements 'manual' sont créés par /validations.",
    );
  },
};
