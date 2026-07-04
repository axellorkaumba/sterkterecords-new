import "server-only";

import { requireEnv, serverEnv } from "@/lib/env";

/**
 * Documenso — e-signature des contrats `[V1]` (§11.11 : distribution,
 * label, booking). Auto-hébergeable ou SaaS (app.documenso.com) : l'URL de
 * base est configurable via DOCUMENSO_BASE_URL pour couvrir les deux cas.
 *
 * La génération de documents à partir de modèles et le suivi des statuts
 * (À signer → Signé → Expiré) seront ajoutés avec le Sprint Contrats.
 */
export async function documensoFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const apiKey = requireEnv("DOCUMENSO_API_KEY", "le client Documenso");
  const baseUrl = serverEnv.DOCUMENSO_BASE_URL ?? "https://app.documenso.com/api/v1";

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`[documenso] ${response.status} ${response.statusText} — ${body}`);
  }

  return response.json() as Promise<T>;
}
