"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createArtistSchema, type CreateArtistValues } from "./schemas";

type ActionResult = { error: string | null };

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}

/**
 * Onboarding profil artiste (§10.1) — adapté à l'ordre des sprints : le CDC
 * place cette étape après le choix du forfait et le paiement, qui n'existent
 * pas encore (module Distribution/Paiements, sprints suivants). Créée dès la
 * première visite de `/app` sans quoi le dashboard n'a rien à afficher — un
 * seul artiste par `owner_id` au MVP self-service (§7.1, pas encore de
 * comptes équipe/managers multi-artistes).
 */
export async function createArtistProfile(values: CreateArtistValues): Promise<ActionResult> {
  const parsed = createArtistSchema.safeParse(values);
  if (!parsed.success) return { error: "invalid" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unknown" };

  const { name, bio, avatarUrl, website, instagram, spotify } = parsed.data;
  const baseSlug = slugify(name) || "artiste";
  const links = {
    ...(website ? { website } : {}),
    ...(instagram ? { instagram } : {}),
    ...(spotify ? { spotify } : {}),
  };

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${randomSuffix()}`;
    const { error } = await supabase.from("artists").insert({
      owner_id: user.id,
      slug,
      name,
      bio: bio || null,
      avatar_url: avatarUrl || null,
      links,
    });

    if (!error) {
      revalidatePath("/app");
      return { error: null };
    }

    // Code Postgres 23505 = violation de contrainte unique (slug déjà pris) —
    // on retente avec un suffixe aléatoire ; toute autre erreur est fatale.
    if (error.code !== "23505") {
      return { error: "unknown" };
    }
  }

  return { error: "unknown" };
}
