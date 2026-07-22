"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/admin";
import { setAdminSessionCookie } from "@/lib/admin-auth/session";

type ActionResult = { error: "invalid" | "invalid_credentials" | "unknown" | null };

/**
 * Connexion au dashboard de validation (`/validations`, ADR 0026) — contre
 * `admin_users`, jamais Supabase Auth. Le hash bcrypt n'est jamais renvoyé au
 * client (sélectionné ici mais jamais présent dans `ActionResult`).
 */
export async function loginAdmin(username: string, password: string): Promise<ActionResult> {
  if (!username.trim() || !password) return { error: "invalid" };

  const admin = createAdminClient();
  const { data: account } = await admin
    .from("admin_users")
    .select("id, username, display_name, password_hash, active")
    .eq("username", username.trim())
    .maybeSingle();

  if (!account || !account.active) return { error: "invalid_credentials" };

  const passwordMatches = await bcrypt.compare(password, account.password_hash);
  if (!passwordMatches) return { error: "invalid_credentials" };

  try {
    await setAdminSessionCookie({
      sub: account.id,
      username: account.username,
      displayName: account.display_name,
    });
  } catch {
    return { error: "unknown" };
  }

  await admin
    .from("admin_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", account.id);

  redirect("/validations");
}
