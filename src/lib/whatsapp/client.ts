import "server-only";

import { requireEnv } from "@/lib/env";

/**
 * WhatsApp Business Cloud API (Meta) — notifications push `[V1]` (§6.1,
 * §14) : confirmation studio, statut de distribution, etc. Client REST fin
 * contre l'API Graph officielle, pas de SDK tiers.
 *
 * L'envoi de templates spécifiques (studio confirmé, sortie livrée...) sera
 * ajouté avec le Sprint Notifications, une fois les templates approuvés par
 * Meta.
 */
const GRAPH_API_VERSION = "v21.0";

export async function whatsappFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = requireEnv("WHATSAPP_CLOUD_API_TOKEN", "le client WhatsApp Cloud API");
  const phoneNumberId = requireEnv(
    "WHATSAPP_CLOUD_PHONE_NUMBER_ID",
    "le client WhatsApp Cloud API",
  );

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}${path}`,
    {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`[whatsapp] ${response.status} ${response.statusText} — ${body}`);
  }

  return response.json() as Promise<T>;
}
