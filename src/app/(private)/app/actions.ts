"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSubscriptionActive } from "@/lib/subscriptions/gate";
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
 * Nombre maximum d'artistes déjà créés autorisé pour ce compte (ADR 0026 —
 * plafond de 5 artistes pour le forfait Label, demande explicite d'Axel).
 * Dérivé de l'abonnement actif le plus récent ; un compte sans abonnement
 * actif (accès immédiat à `/app`, pas encore validé — voir ADR 0026) reste
 * plafonné à 1, comme le forfait Solo par défaut.
 */
async function getArtistLimit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<number> {
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan_id, status, current_period_end")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const planId =
    subscription && isSubscriptionActive(subscription.status, subscription.current_period_end)
      ? subscription.plan_id
      : "solo";

  const { data: plan } = await supabase
    .from("plans")
    .select("max_artists")
    .eq("id", planId)
    .maybeSingle();

  return plan?.max_artists ?? 1;
}

/**
 * Onboarding profil artiste (§10.1) — adapté à l'ordre des sprints : le CDC
 * place cette étape après le choix du forfait et le paiement, qui n'existent
 * pas encore (module Distribution/Paiements, sprints suivants). Créée dès la
 * première visite de `/app` sans quoi le dashboard n'a rien à afficher.
 *
 * Plafonné par forfait (`plans.max_artists`, ADR 0026) : 1 pour Solo/Pro (ou
 * un compte non encore validé), 5 pour Label — la gestion multi-artistes
 * (inviter/gérer plusieurs profils sous un même compte Label) reste hors
 * périmètre de ce sprint (§7.2, déjà différée par l'ADR 0008) ; ce plafond
 * pose juste le garde-fou en base pour ce jour-là.
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
