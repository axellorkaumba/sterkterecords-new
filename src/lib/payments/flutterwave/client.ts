import "server-only";

import { requireEnv } from "@/lib/env";

/**
 * Flutterwave — cartes + Mobile Money Afrique (M-Pesa, Airtel, Orange, MTN).
 * PSP par défaut pour les utilisateurs RDC, Stripe y étant indisponible
 * (§11.5). Pas de SDK officiel maintenu retenu ici : un client REST fin
 * garde le contrôle total et évite une dépendance supplémentaire non
 * essentielle, cohérent avec l'architecture en adaptateurs du §23.
 *
 * La logique métier (initier un paiement, vérifier une transaction, gérer
 * les webhooks) sera ajoutée avec le Sprint Paiements.
 */
const FLUTTERWAVE_API_BASE_URL = "https://api.flutterwave.com/v3";

export async function flutterwaveFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const secretKey = requireEnv("FLUTTERWAVE_SECRET_KEY", "le client Flutterwave");

  const response = await fetch(`${FLUTTERWAVE_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`[flutterwave] ${response.status} ${response.statusText} — ${body}`);
  }

  return response.json() as Promise<T>;
}
