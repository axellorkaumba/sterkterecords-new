import "server-only";

import { requireEnv, serverEnv } from "@/lib/env";

/**
 * PayPal — rail Maroc/international (§13.2, voir ADR 0025). Pas de SDK
 * officiel retenu ici, même choix que Flutterwave (`flutterwave/client.ts`) :
 * un client REST fin garde le contrôle total, cohérent avec l'architecture
 * en adaptateurs du §23.
 *
 * Contrairement à Stripe/Flutterwave (clé secrète statique en en-tête),
 * l'API REST PayPal utilise OAuth2 client-credentials : un jeton d'accès à
 * durée de vie limitée (~9h), mis en cache en mémoire du process pour
 * éviter un aller-retour `/v1/oauth2/token` à chaque appel.
 */
let cachedToken: { value: string; expiresAt: number } | null = null;

interface PayPalTokenResponse {
  access_token: string;
  expires_in: number;
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const clientId = requireEnv("PAYPAL_CLIENT_ID", "le client PayPal");
  const clientSecret = requireEnv("PAYPAL_CLIENT_SECRET", "le client PayPal");
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${serverEnv.PAYPAL_API_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`[paypal] ${response.status} ${response.statusText} — ${body}`);
  }

  const data = (await response.json()) as PayPalTokenResponse;
  // Marge de 60s pour ne jamais utiliser un jeton expiré à la limite.
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return cachedToken.value;
}

export async function paypalFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();

  const response = await fetch(`${serverEnv.PAYPAL_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`[paypal] ${response.status} ${response.statusText} — ${body}`);
  }

  return response.json() as Promise<T>;
}
