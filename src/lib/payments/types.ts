import type { Database } from "@/types/database.types";

export type PaymentProviderId = Database["public"]["Enums"]["payment_provider"];
export type BillingPeriod = Database["public"]["Enums"]["billing_period"];

export interface CreateSubscriptionCheckoutParams {
  userId: string;
  email: string;
  planId: string;
  period: BillingPeriod;
  /** Montant déjà net de remise éventuelle (§ coupon) — voir pricing.ts. */
  amount: number;
  currency: string;
  trialDays: number;
  successUrl: string;
  cancelUrl: string;
  /** Référence interne (ligne `payments`) transmise en métadonnée pour le webhook. */
  paymentId: string;
}

export interface CreateOneTimeCheckoutParams {
  userId: string;
  email: string;
  description: string;
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  paymentId: string;
}

export interface CheckoutResult {
  url: string;
  /** Identifiant externe (session Stripe, tx_ref Flutterwave) à stocker sur `payments.external_id`. */
  externalId: string;
}

/**
 * Contrat commun aux rails de paiement (§13.2). Stripe gère des abonnements
 * natifs (renouvellement automatique) ; Flutterwave n'a pas d'équivalent
 * fiable pour le Mobile Money africain — chaque "abonnement" y est en
 * réalité un paiement unique dont le webhook fait vivre la ligne
 * `subscriptions` (voir flutterwave-provider.ts et ADR 0010).
 */
export interface PaymentProviderClient {
  id: PaymentProviderId;
  createSubscriptionCheckout(params: CreateSubscriptionCheckoutParams): Promise<CheckoutResult>;
  createOneTimeCheckout(params: CreateOneTimeCheckoutParams): Promise<CheckoutResult>;
}
