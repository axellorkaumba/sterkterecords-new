"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getArtistLimit } from "@/lib/artists/limit";
import { slugify, randomSuffix } from "@/lib/slug";
import { createArtistSchema, type CreateArtistValues } from "./schemas";

type ActionResult = { error: string | null; artistId?: string };

/**
 * Onboarding profil artiste (§10.1) — adapté à l'ordre des sprints : le CDC
 * place cette étape après le choix du forfait et le paiement, qui n'existent
 * pas encore (module Distribution/Paiements, sprints suivants). Créée dès la
 * première visite de `/app` sans quoi le dashboard n'a rien à afficher.
 *
 * Plafonné par forfait (`plans.max_artists`, ADR 0026) : 1 pour Solo/Pro (ou
 * un compte non encore validé), 5 pour Label. Le forfait Label peut donc
 * appeler cette action plusieurs fois (`/app/artistes/nouveau`, voir
 * artist-switcher.tsx) — retourne l'id créé pour que l'appelant puisse le
 * définir comme artiste actif (`setActiveArtist`, src/app/(private)/app/artist-actions.ts).
 */
export async function createArtistProfile(values: CreateArtistValues): Promise<ActionResult> {
  const parsed = createArtistSchema.safeParse(values);
  if (!parsed.success) return { error: "invalid" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unknown" };

  const [{ count: existingArtists }, limit] = await Promise.all([
    supabase.from("artists").select("id", { count: "exact", head: true }).eq("owner_id", user.id),
    getArtistLimit(supabase, user.id),
  ]);
  if ((existingArtists ?? 0) >= limit) return { error: "artist_limit_reached" };

  const { name, bio, avatarUrl, website, instagram, spotify } = parsed.data;
  const baseSlug = slugify(name) || "artiste";
  const links = {
    ...(website ? { website } : {}),
    ...(instagram ? { instagram } : {}),
    ...(spotify ? { spotify } : {}),
  };

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${randomSuffix()}`;
    const { data: created, error } = await supabase
      .from("artists")
      .insert({
        owner_id: user.id,
        slug,
        name,
        bio: bio || null,
        avatar_url: avatarUrl || null,
        links,
      })
      .select("id")
      .single();

    if (!error && created) {
      revalidatePath("/app");
      return { error: null, artistId: created.id };
    }

    // Code Postgres 23505 = violation de contrainte unique (slug déjà pris) —
    // on retente avec un suffixe aléatoire ; toute autre erreur est fatale.
    if (error.code !== "23505") {
      return { error: "unknown" };
    }
  }

  return { error: "unknown" };
}
