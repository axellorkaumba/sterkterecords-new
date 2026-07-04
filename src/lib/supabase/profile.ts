import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export type UserRole = Database["public"]["Enums"]["user_role"];

/** Rôles internes Sterkte Records (§7.1) — seuls autorisés sur /admin. */
export const STAFF_ROLES: UserRole[] = [
  "super_admin",
  "accounting",
  "support",
  "ar_manager",
  "marketing",
];

/**
 * Pas de dépendance à `server-only` : utilisée aussi bien depuis `src/proxy.ts`
 * (runtime Edge) que depuis des Server Actions (runtime Node).
 */
export async function fetchUserRole(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<UserRole | null> {
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).single();
  return data?.role ?? null;
}

export function homeForRole(role: UserRole | null): "/admin" | "/app" {
  return role && STAFF_ROLES.includes(role) ? "/admin" : "/app";
}
