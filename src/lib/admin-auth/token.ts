import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { requireEnv } from "@/lib/env";

/**
 * Session du dashboard de validation (`/validations`) — comptes nommés dans
 * `admin_users`, volontairement INDÉPENDANTE de Supabase Auth (demande
 * explicite d'Axel, voir docs/adr/0026-validation-manuelle-paiements.md).
 * JWT signé (HS256, `jose` — compatible edge runtime) plutôt qu'un ID de
 * session en base : pas de table de sessions à nettoyer, vérifiable aussi
 * bien dans `src/proxy.ts` (edge) que dans les Server Actions (node).
 */
export const ADMIN_SESSION_COOKIE_NAME = "sr_admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12;

export interface AdminSessionPayload {
  sub: string;
  username: string;
  displayName: string;
}

function getSecretKey() {
  return new TextEncoder().encode(
    requireEnv("ADMIN_SESSION_SECRET", "la session du dashboard de validation (/validations)"),
  );
}

export async function createAdminToken(payload: AdminSessionPayload): Promise<string> {
  return new SignJWT({ username: payload.username, displayName: payload.displayName })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

/** Ne lève jamais — un token absent/expiré/invalide renvoie simplement `null` (traité comme non connecté). */
export async function verifyAdminToken(
  token: string | undefined,
): Promise<AdminSessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.sub !== "string" ||
      typeof payload.username !== "string" ||
      typeof payload.displayName !== "string"
    ) {
      return null;
    }
    return { sub: payload.sub, username: payload.username, displayName: payload.displayName };
  } catch {
    return null;
  }
}
