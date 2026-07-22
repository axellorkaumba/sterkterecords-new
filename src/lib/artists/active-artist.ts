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
 * Artistes sur lesquels l'utilisateur a été invité en tant que
 * collaborateur et a accepté (ADR 0030, Phase 2) — accès lecture seule,
 * jamais compté dans le plafond `plans.max_artists` du compte qui les
 * possède (voir `ownedCount` dans `getActiveArtist`).
 */
async function listCollaboratedArtists(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<Artist[]> {
  const { data } = await supabase
    .from("artist_collaborators")
    .select("artists(*)")
    .eq("user_id", userId)
    .eq("status", "accepted");
  return (data ?? [])
    .map((row) => row.artists)
    .filter((artist): artist is Artist => artist !== null);
}

/**
 * Retombe sur le plus ancien artiste accessible si le cookie est absent ou
 * pointe vers un artiste qui n'est plus accessible (owner_id différent,
 * suppression, collaboration révoquée, cookie d'une session précédente).
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
 *
 * `artists` (ADR 0030, Phase 2) mélange volontairement possédés +
 * collaborés — un collaborateur doit voir l'artiste dans son switcher. Mais
 * `ownedCount` reste strictement les artistes possédés : c'est lui qui doit
 * être comparé à `plans.max_artists` (voir `page.tsx`), jamais `artists.length`,
 * sous peine de compter les artistes des autres dans le plafond du compte.
 */
export async function getActiveArtist(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<{ artists: Artist[]; activeArtist: Artist | null; ownedCount: number }> {
  const [owned, collaborated, cookieStore] = await Promise.all([
    listOwnedArtists(supabase, userId),
    listCollaboratedArtists(supabase, userId),
    cookies(),
  ]);
  const artists = [...owned, ...collaborated];
  const activeArtist = resolveActiveArtist(artists, cookieStore.get(ACTIVE_ARTIST_COOKIE)?.value);
  return { artists, activeArtist, ownedCount: owned.length };
}
