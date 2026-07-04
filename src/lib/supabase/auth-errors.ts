import "server-only";

import type { AuthError } from "@supabase/supabase-js";

/**
 * Codes d'erreur Supabase Auth explicitement traduits (voir
 * `Auth.errors.*` dans les messages i18n). Toute erreur au code inconnu
 * retombe sur `Auth.errors.unknown` plutôt que d'exposer le message anglais
 * brut de Supabase à l'utilisateur.
 *
 * Liste des codes : https://supabase.com/docs/guides/auth/debugging/error-codes
 */
const KNOWN_ERROR_CODES = new Set([
  "invalid_credentials",
  "email_not_confirmed",
  "user_already_exists",
  "weak_password",
  "same_password",
  "over_email_send_rate_limit",
  "over_request_rate_limit",
  "session_not_found",
  "user_not_found",
]);

export type AuthErrorCode = string;

/** Retourne un code d'erreur stable (jamais le message anglais de Supabase). */
export function mapSupabaseErrorCode(error: AuthError): AuthErrorCode {
  if (error.code && KNOWN_ERROR_CODES.has(error.code)) {
    return error.code;
  }
  return "unknown";
}
