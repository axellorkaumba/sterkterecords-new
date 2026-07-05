"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLabelGridClient } from "@/lib/labelgrid";
import { getPublicUrl } from "@/lib/storage/r2";
import { clientEnv } from "@/lib/env";
import { sendReleaseCorrectionNeededEmail } from "@/lib/email/send";
import { STAFF_ROLES } from "@/lib/supabase/profile";
import type { Database } from "@/types/database.types";

type ActionResult = { error: string | null };
type ArtistPlan = Database["public"]["Enums"]["artist_plan"];

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("[admin] Non authentifié.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !STAFF_ROLES.includes(profile.role)) {
    throw new Error("[admin] Rôle non autorisé.");
  }

  return { supabase, user };
}

async function logAudit(actorId: string, action: string, entity: string, entityId?: string) {
  const admin = createAdminClient();
  await admin
    .from("audit_log")
    .insert({ actor_id: actorId, action, entity, entity_id: entityId ?? null });
}

/** `auth.users` n'est pas exposé via PostgREST — lecture via l'API admin Supabase Auth (même motif que src/lib/email/receipt.ts). */
async function getOwnerContact(
  admin: ReturnType<typeof createAdminClient>,
  ownerId: string,
): Promise<{ email: string; locale: "fr" | "en" | "ln" } | null> {
  const [{ data: userData }, { data: profile }] = await Promise.all([
    admin.auth.admin.getUserById(ownerId),
    admin.from("profiles").select("locale").eq("id", ownerId).maybeSingle(),
  ]);
  if (!userData.user?.email) return null;
  return { email: userData.user.email, locale: (profile?.locale as "fr" | "en" | "ln") ?? "fr" };
}

/** File de validation qualité (§11.10) — sorties soumises par les artistes, en attente d'approbation staff. */
export async function listReleasesForReview() {
  const { supabase } = await requireStaff();
  const { data } = await supabase
    .from("releases")
    .select("id, title, type, submitted_at, artists(name, slug)")
    .eq("status", "in_review")
    .order("submitted_at", { ascending: true });
  return data ?? [];
}

/**
 * Approuve une sortie en file de validation (§11.10) : c'est ICI, et non plus
 * dans `submitRelease` (§11.4, côté artiste), que la sortie part réellement
 * vers LabelGrid — voir docs/adr/0012-back-office-minimal.md. `labelgrid_sync`
 * est écrit via le client admin (pas de policy INSERT pour `authenticated`,
 * cohérent avec le commentaire de la migration Sprint 5 : "Écrit par le
 * serveur").
 */
export async function approveRelease(releaseId: string): Promise<ActionResult> {
  const { supabase, user } = await requireStaff();
  const admin = createAdminClient();

  const [{ data: release }, { data: tracks }, { data: platforms }] = await Promise.all([
    supabase.from("releases").select("*").eq("id", releaseId).eq("status", "in_review").single(),
    supabase
      .from("tracks")
      .select("*, contributors(role, name, split_pct)")
      .eq("release_id", releaseId)
      .order("position"),
    supabase.from("release_platforms").select("dsp").eq("release_id", releaseId),
  ]);

  if (!release || !tracks) return { error: "not_found" };

  const labelgrid = getLabelGridClient();
  const { externalId } = await labelgrid.submitRelease({
    releaseId: release.id,
    type: release.type,
    title: release.title,
    upc: release.upc ?? undefined,
    genre: release.genre ?? "",
    language: release.language ?? "",
    explicit: release.explicit,
    artworkUrl: release.artwork_url ? getPublicUrl(release.artwork_url) : "",
    releaseDate: release.release_date ?? new Date().toISOString(),
    selectedDsps: (platforms ?? []).map((p) => p.dsp),
    tracks: tracks.map((track) => ({
      position: track.position,
      title: track.title,
      isrc: track.isrc ?? undefined,
      audioFileUrl: track.audio_url ?? "",
      explicit: track.explicit,
      contributors: (track.contributors ?? []).map((c) => ({
        name: c.name,
        role: c.role,
        splitPct: c.split_pct,
      })),
    })),
  });

  const { error } = await supabase
    .from("releases")
    .update({ status: "delivering" })
    .eq("id", releaseId);
  if (error) return { error: "unknown" };

  await admin.from("labelgrid_sync").insert({
    release_id: releaseId,
    external_id: externalId,
    status: "in_delivery",
  });

  await logAudit(user.id, "release_approved", "release", releaseId);

  revalidatePath("/admin/sorties");
  revalidatePath("/app/distribution");
  return { error: null };
}

/**
 * Renvoie une sortie en brouillon avec motif (§11.10 "approuver / renvoyer
 * avec motif") — l'artiste la retrouve dans son tunnel pour la corriger et
 * la resoumettre. Le motif est envoyé par email (gabarit construit au
 * Sprint 7, resté sans déclencheur jusqu'ici faute de ce workflow).
 */
export async function rejectRelease(releaseId: string, reason: string): Promise<ActionResult> {
  const { supabase, user } = await requireStaff();
  const admin = createAdminClient();

  const { data: release } = await supabase
    .from("releases")
    .select("title, artist_id, artists(owner_id)")
    .eq("id", releaseId)
    .eq("status", "in_review")
    .single();
  if (!release) return { error: "not_found" };

  const { error } = await supabase.from("releases").update({ status: "draft" }).eq("id", releaseId);
  if (error) return { error: "unknown" };

  await logAudit(user.id, "release_rejected", "release", releaseId);

  const ownerId = release.artists?.owner_id;
  if (ownerId) {
    const contact = await getOwnerContact(admin, ownerId);
    if (contact) {
      await sendReleaseCorrectionNeededEmail({
        to: contact.email,
        locale: contact.locale,
        releaseTitle: release.title,
        issues: [reason],
        dashboardUrl: `${clientEnv.NEXT_PUBLIC_SITE_URL}/app/distribution/${releaseId}`,
      });
    }
  }

  revalidatePath("/admin/sorties");
  revalidatePath("/app/distribution");
  return { error: null };
}

/** Liste tous les artistes (§11.10 "gérer les artistes label") — Solo (self-service) et Label (géré en interne). */
export async function listAllArtists() {
  const { supabase } = await requireStaff();
  const { data } = await supabase
    .from("artists")
    .select("id, name, slug, plan, created_at, releases(count)")
    .order("created_at", { ascending: false });
  return data ?? [];
}

/** Bascule un artiste entre Solo (self-service, paywall applicable) et Label (géré en interne, exempté du paywall — voir src/lib/subscriptions/gate.ts). */
export async function toggleArtistPlan(artistId: string, plan: ArtistPlan): Promise<ActionResult> {
  const { supabase, user } = await requireStaff();

  const { error } = await supabase.from("artists").update({ plan }).eq("id", artistId);
  if (error) return { error: "unknown" };

  await logAudit(user.id, `artist_plan_set_${plan}`, "artist", artistId);
  revalidatePath("/admin/artistes");
  return { error: null };
}
