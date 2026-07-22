"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify, randomSuffix } from "@/lib/slug";
import { createLabelSchema, type CreateLabelValues } from "./schemas";

type ActionResult = { error: string | null };

/**
 * Création de l'espace Label (ADR 0029, Phase 1) — étape préalable à
 * l'ajout d'artistes pour un compte `profiles.role = 'manager'`. Un seul
 * label par compte (contrainte `unique(owner_id)`, migration
 * 20260722120000_label_accounts.sql) : appelée une seule fois, contrairement
 * à `createArtistProfile` qui peut l'être jusqu'à 5 fois.
 */
export async function createLabel(values: CreateLabelValues): Promise<ActionResult> {
  const parsed = createLabelSchema.safeParse(values);
  if (!parsed.success) return { error: "invalid" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unknown" };

  const { name, bio, avatarUrl } = parsed.data;
  const baseSlug = slugify(name) || "label";

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${randomSuffix()}`;
    const { error } = await supabase.from("labels").insert({
      owner_id: user.id,
      slug,
      name,
      bio: bio || null,
      avatar_url: avatarUrl || null,
    });

    if (!error) {
      revalidatePath("/app");
      return { error: null };
    }

    // 23505 = slug déjà pris (retente avec un suffixe) ou owner_id déjà
    // titulaire d'un label (contrainte unique — un compte ne devrait jamais
    // arriver ici deux fois, page.tsx ne montre ce formulaire que si aucun
    // label n'existe, mais la contrainte reste la garde-fou réel).
    if (error.code !== "23505") {
      return { error: "unknown" };
    }
  }

  return { error: "unknown" };
}
