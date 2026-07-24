"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_ARTIST_COOKIE } from "@/lib/artists/active-artist";

type ActionResult = { error: string | null };

/**
 * Change l'artiste "actif" du compte connecté (§ADR 0026 — multi-artistes
 * Label). Vérifie l'accès avant de poser le cookie : un id d'artiste
 * arbitraire ne doit pas pouvoir être injecté depuis le client. Pas de
 * filtre `owner_id` ici — corrigé en audit : cette action rejetait tout
 * artiste que l'appelant ne possédait pas, y compris un artiste sur lequel
 * il collabore (ADR 0030) alors que `getActiveArtist` le liste bien dans le
 * switcher. La RLS `artists_select_own_or_staff` (propriétaire OU
 * `is_artist_collaborator` OU staff) est l'autorité : si la ligne revient,
 * l'accès est légitime, qu'il soit possédé ou collaboré.
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
