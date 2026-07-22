import "server-only";

import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_TTL_SECONDS,
  createAdminToken,
  verifyAdminToken,
  type AdminSessionPayload,
} from "./token";

export type { AdminSessionPayload };

/** Posée après un login réussi (Server Action `loginAdmin`). `path` scope le cookie à `/validations` — jamais envoyé aux requêtes `/app`/`/admin`. */
export async function setAdminSessionCookie(payload: AdminSessionPayload): Promise<void> {
  const token = await createAdminToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/validations",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({ name: ADMIN_SESSION_COOKIE_NAME, path: "/validations" });
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  return verifyAdminToken(cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value);
}

/** À utiliser en tête de chaque Server Action de `/validations` — lève si la session est absente/invalide. */
export async function requireAdminSession(): Promise<AdminSessionPayload> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("[validations] Session admin invalide ou expirée.");
  }
  return session;
}
