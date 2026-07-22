import "server-only";

import { cookies } from "next/headers";
import type { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type Artist = Database["public"]["Tables"]["artists"]["Row"];

/** Nom du cookie posé par `setActiveArtist` (artist-actions.ts). */
export const ACTIVE_ARTIST_COOKIE = "active_artist_id";

/** Tous les artistes du compte connecté, du plus ancien au plus récent. */
export async function listOwnedArtists(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<Artist[]> {
  const { data } = await supabase
    .from("artists")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

/**
 * Retombe sur le plus ancien artiste du compte si le cookie est absent ou
 * pointe vers un artiste qui n'appartient plus (ou plus) à ce compte —
 * changement de forfait, suppression, cookie d'une session précédente.
 */
export function resolveActiveArtist(
  artists: Artist[],
  activeArtistIdCookie: string | undefined,
): Artist | null {
  if (artists.length === 0) return null;
  const match = activeArtistIdCookie
    ? artists.find((artist) => artist.id === activeArtistIdCookie)
    : undefined;
  return match ?? artists[0]!;
}

/**
 * Artiste "actif" du compte connecté (§ADR 0026 — multi-artistes Label) :
 * celui affiché sur le dashboard et ciblé par les Server Actions du tunnel
 * de distribution qui n'ont pas encore de `releaseId` (créer une sortie,
 * lister le catalogue). Les actions déjà scopées par `releaseId` n'en ont
 * pas besoin — la RLS `owns_artist(artist_id)` suffit à elle seule.
 */
export async function getActiveArtist(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<{ artists: Artist[]; activeArtist: Artist | null }> {
  const [artists, cookieStore] = await Promise.all([listOwnedArtists(supabase, userId), cookies()]);
  const activeArtist = resolveActiveArtist(artists, cookieStore.get(ACTIVE_ARTIST_COOKIE)?.value);
  return { artists, activeArtist };
}
