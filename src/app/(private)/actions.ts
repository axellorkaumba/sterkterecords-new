"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Déconnexion de l'appareil courant (bouton du header minimal, §11.2). Pour
 * "se déconnecter de tous les appareils", voir `signOutEverywhere` dans
 * `src/app/(private)/app/parametres/actions.ts`.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
