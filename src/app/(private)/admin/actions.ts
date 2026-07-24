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
import { recordRoyaltyStatementSchema, type RecordRoyaltyStatementValues } from "./schemas";

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
/**
 * Corrigé en audit : `approveRelease` lisait le statut (`= 'in_review'`)
 * puis écrivait `status = 'delivering'` dans deux requêtes séparées, sans
 * lien entre elles — deux appels concurrents (double-clic, deux membres de
 * l'équipe, requête relancée après un délai réseau) passaient tous les deux
 * la lecture avant qu'aucun n'écrive, soumettant la même sortie deux fois à
 * LabelGrid. La transition de statut est maintenant la garde atomique
 * elle-même (`UPDATE ... WHERE status = 'in_review'`) et se fait AVANT
 * l'appel externe : seul l'appel qui affecte réellement une ligne
 * poursuit — tout appel concurrent/relancé s'arrête à `already_processed`.
 * Si l'envoi à LabelGrid échoue après coup, le statut repasse à `error`
 * (déjà dans l'enum `release_status`) plutôt que de rester bloqué sur
 * `delivering` sans qu'aucune synchronisation n'existe.
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

  const { data: claimed } = await supabase
    .from("releases")
    .update({ status: "delivering" })
    .eq("id", releaseId)
    .eq("status", "in_review")
    .select("id")
    .maybeSingle();
  if (!claimed) return { error: "already_processed" };

  try {
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

    await admin.from("labelgrid_sync").insert({
      release_id: releaseId,
      external_id: externalId,
      status: "in_delivery",
    });
  } catch (labelgridError) {
    await supabase.from("releases").update({ status: "error" }).eq("id", releaseId);
    console.error(`[admin] Échec de l'envoi LabelGrid pour ${releaseId} :`, labelgridError);
    return { error: "labelgrid_failed" };
  }

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

  // Même garde atomique qu'`approveRelease` (voir son commentaire) — évite
  // un double envoi de l'email de correction sur double-clic/relance.
  const { data: claimed } = await supabase
    .from("releases")
    .update({ status: "draft" })
    .eq("id", releaseId)
    .eq("status", "in_review")
    .select("id")
    .maybeSingle();
  if (!claimed) return { error: "already_processed" };

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

export interface PendingWithdrawal {
  id: string;
  userEmail: string | null;
  userFullName: string | null;
  amount: number;
  currency: string;
  payoutMethod: string;
  payoutDetails: Record<string, string>;
  requestedAt: string;
}

/**
 * File de retraits en attente (§11.5, module Royalties). La RLS
 * (`withdrawals_select_own_or_staff`, migration 20260722160000) laisse déjà
 * le staff tout voir via sa propre session — le client admin ne sert ici
 * qu'à lire `auth.users.email` (pas exposé via PostgREST, même motif que
 * `getOwnerContact` ci-dessus).
 */
export async function listPendingWithdrawals(): Promise<PendingWithdrawal[]> {
  const { supabase } = await requireStaff();
  const admin = createAdminClient();

  const { data: withdrawals } = await supabase
    .from("withdrawals")
    .select("id, user_id, amount, currency, payout_method, payout_details, requested_at")
    .eq("status", "pending")
    .order("requested_at", { ascending: true });

  if (!withdrawals || withdrawals.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in(
      "id",
      withdrawals.map((withdrawal) => withdrawal.user_id),
    );
  const fullNameByUserId = new Map(
    profiles?.map((profile) => [profile.id, profile.full_name]) ?? [],
  );

  return Promise.all(
    withdrawals.map(async (withdrawal) => {
      const { data: userData } = await admin.auth.admin.getUserById(withdrawal.user_id);
      return {
        id: withdrawal.id,
        userEmail: userData.user?.email ?? null,
        userFullName: fullNameByUserId.get(withdrawal.user_id) ?? null,
        amount: withdrawal.amount,
        currency: withdrawal.currency,
        payoutMethod: withdrawal.payout_method,
        payoutDetails: withdrawal.payout_details as Record<string, string>,
        requestedAt: withdrawal.requested_at,
      };
    }),
  );
}

/**
 * Marque un retrait payé — le virement/mobile money est exécuté hors
 * système par l'équipe (même modèle opérationnel que la validation des
 * paiements entrants, ADR 0026), ce bouton n'en est que la confirmation.
 * Garde atomique (`eq("status", "pending")` sur l'UPDATE lui-même) — même
 * schéma que `approvePaymentProof`, voir ADR 0031 §2-4.
 */
export async function markWithdrawalPaid(withdrawalId: string): Promise<ActionResult> {
  const { supabase, user } = await requireStaff();

  const { data: claimed } = await supabase
    .from("withdrawals")
    .update({ status: "paid", processed_by: user.id, processed_at: new Date().toISOString() })
    .eq("id", withdrawalId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (!claimed) return { error: "already_processed" };

  await logAudit(user.id, "withdrawal_paid", "withdrawal", withdrawalId);
  revalidatePath("/admin/finances");
  return { error: null };
}

export async function rejectWithdrawal(
  withdrawalId: string,
  reason: string,
): Promise<ActionResult> {
  if (!reason.trim()) return { error: "reason_required" };
  const { supabase, user } = await requireStaff();

  const { data: claimed } = await supabase
    .from("withdrawals")
    .update({
      status: "rejected",
      rejection_reason: reason.trim(),
      processed_by: user.id,
      processed_at: new Date().toISOString(),
    })
    .eq("id", withdrawalId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (!claimed) return { error: "already_processed" };

  await logAudit(user.id, "withdrawal_rejected", "withdrawal", withdrawalId);
  revalidatePath("/admin/finances");
  return { error: null };
}

/**
 * Saisie manuelle d'un relevé DSP (§11.5) — en attendant une vraie
 * ingestion automatisée LabelGrid (hors périmètre, voir
 * docs/adr/0032-module-royalties.md). Écrit dans `stats_monthly` via le
 * client admin : cette table n'a aucune policy INSERT pour `authenticated`
 * (lecture seule côté client, voir migration 20260704160000) — le
 * déclencheur `recompute_wallet` (migration 20260722160000) répercute
 * immédiatement ce revenu sur le solde de l'artiste.
 */
export async function recordRoyaltyStatement(
  values: RecordRoyaltyStatementValues,
): Promise<ActionResult> {
  const parsed = recordRoyaltyStatementSchema.safeParse(values);
  if (!parsed.success) return { error: "invalid" };
  const { user } = await requireStaff();
  const admin = createAdminClient();

  const { error } = await admin.from("stats_monthly").insert({
    artist_id: parsed.data.artistId,
    period: parsed.data.period,
    dsp: parsed.data.dsp,
    country: parsed.data.country || null,
    streams: parsed.data.streams,
    revenue: parsed.data.revenue,
  });

  if (error) return { error: "unknown" };

  await logAudit(user.id, "royalty_statement_recorded", "artist", parsed.data.artistId);
  revalidatePath("/admin/finances");
  revalidatePath("/app");
  return { error: null };
}
