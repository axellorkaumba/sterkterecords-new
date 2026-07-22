"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_ARTIST_COOKIE } from "@/lib/artists/active-artist";

type ActionResult = { error: string | null };

/**
 * Change l'artiste "actif" du compte connecté (§ADR 0026 — multi-artistes
 * Label). Vérifie l'ownership avant de poser le cookie : un id d'artiste
 * arbitraire ne doit pas pouvoir être injecté depuis le client, même si la
 * RLS empêcherait de toute façon toute lecture/écriture sur un artiste qui
 * n'appartient pas à l'appelant.
 */
export async function setActiveArtist(artistId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unknown" };

  const { data: artist } = await supabase
    .from("artists")
    .select("id")
    .eq("id", artistId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!artist) return { error: "not_found" };

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ARTIST_COOKIE, artist.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/app",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/app");
  revalidatePath("/app/distribution");
  return { error: null };
}
