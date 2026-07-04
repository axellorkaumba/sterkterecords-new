import "server-only";

import { Resend } from "resend";
import { requireEnv } from "@/lib/env";

/**
 * Resend — emails transactionnels (§14). Les templates React Email
 * (bienvenue, confirmation de sortie, reçus...) seront ajoutés au Sprint
 * Emails, avec `@react-email/components` déjà installé.
 */
let resendClient: Resend | null = null;

export function getResendClient(): Resend {
  if (resendClient) return resendClient;

  const apiKey = requireEnv("RESEND_API_KEY", "le client Resend");
  resendClient = new Resend(apiKey);

  return resendClient;
}
