"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLabelGridClient } from "@/lib/labelgrid";
import { clientEnv } from "@/lib/env";
import {
  getPaymentProvider,
  getAddonPrice,
  resolveRegionForCountry,
  resolveProviderForCountry,
} from "@/lib/payments";
import { sendReleaseSubmittedEmail, sendTakedownConfirmedEmail } from "@/lib/email/send";
import type { Database } from "@/types/database.types";
import {
  releaseTypeSchema,
  releaseMetadataSchema,
  trackMetadataSchema,
  contributorSchema,
  scheduleSchema,
  type ReleaseTypeValue,
  type ReleaseMetadataValues,
  type TrackMetadataValues,
  type ContributorValues,
  type ScheduleValues,
} from "./schemas";

type ActionResult = { error: string | null };
type Track = Database["public"]["Tables"]["tracks"]["Row"];

async function requireArtist() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("[distribution] Non authentifié.");

  const { data: artist } = await supabase
    .from("artists")
    .select("id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!artist) throw new Error("[distribution] Aucun profil artiste.");
  return { supabase, user, artistId: artist.id };
}

/** Langue du destinataire pour les emails transactionnels (§14) — déjà accessible via la session RLS, pas besoin du client admin ici. */
async function getRecipientLocale(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<"fr" | "en" | "ln"> {
  const { data } = await supabase.from("profiles").select("locale").eq("id", userId).single();
  return (data?.locale as "fr" | "en" | "ln" | undefined) ?? "fr";
}

async function logAudit(actorId: string, action: string, entityId: string) {
  const admin = createAdminClient();
  await admin
    .from("audit_log")
    .insert({ actor_id: actorId, action, entity: "release", entity_id: entityId });
}

/** Démarre une nouvelle sortie brouillon (§11.4 étape 1) — redirige vers son tunnel. */
export async function createDraftRelease(type: ReleaseTypeValue): Promise<never> {
  const parsedType = releaseTypeSchema.parse(type);
  const { supabase, artistId } = await requireArtist();

  const { data: release, error } = await supabase
    .from("releases")
    .insert({ artist_id: artistId, type: parsedType, title: "", current_step: 2 })
    .select("id")
    .single();

  if (error || !release) {
    throw new Error("[distribution] Impossible de créer la sortie.");
  }

  redirect(`/app/distribution/${release.id}`);
}

export async function updateReleaseStep(releaseId: string, step: number): Promise<void> {
  const { supabase } = await requireArtist();
  await supabase.from("releases").update({ current_step: step }).eq("id", releaseId);
  revalidatePath(`/app/distribution/${releaseId}`);
}

export async function updateReleaseMetadata(
  releaseId: string,
  values: ReleaseMetadataValues,
): Promise<ActionResult> {
  const parsed = releaseMetadataSchema.safeParse(values);
  if (!parsed.success) return { error: "invalid" };
  const { supabase } = await requireArtist();

  const { error } = await supabase
    .from("releases")
    .update({
      title: parsed.data.title,
      genre: parsed.data.genre,
      sub_genre: parsed.data.subGenre || null,
      language: parsed.data.language,
      explicit: parsed.data.explicit,
      recording_date: parsed.data.recordingDate || null,
      copyright_p: parsed.data.copyrightP || null,
      copyright_c: parsed.data.copyrightC || null,
    })
    .eq("id", releaseId);

  if (error) return { error: "unknown" };
  revalidatePath(`/app/distribution/${releaseId}`);
  return { error: null };
}

export async function addTrack(
  releaseId: string,
  input: {
    audioR2Key: string;
    fileSize: number;
    durationSeconds: number | null;
    sampleRateHz: number | null;
    bitDepth: number | null;
    codec: string;
    loudnessLufs: number | null;
    audioHash: string;
  },
): Promise<{ error: string | null; trackId?: string }> {
  const { supabase } = await requireArtist();

  const { data: existingTracks } = await supabase
    .from("tracks")
    .select("position")
    .eq("release_id", releaseId)
    .order("position", { ascending: false })
    .limit(1);

  const nextPosition = (existingTracks?.[0]?.position ?? 0) + 1;

  const { data: track, error } = await supabase
    .from("tracks")
    .insert({
      release_id: releaseId,
      position: nextPosition,
      title: "",
      audio_url: input.audioR2Key,
      file_size: input.fileSize,
      duration: input.durationSeconds,
      sample_rate: input.sampleRateHz,
      bit_depth: input.bitDepth,
      codec: input.codec,
      loudness_lufs: input.loudnessLufs,
      audio_hash: input.audioHash,
    })
    .select("id")
    .single();

  if (error || !track) return { error: "unknown" };
  revalidatePath(`/app/distribution/${releaseId}`);
  return { error: null, trackId: track.id };
}

export async function removeTrack(releaseId: string, trackId: string): Promise<void> {
  const { supabase } = await requireArtist();
  await supabase.from("tracks").delete().eq("id", trackId);
  revalidatePath(`/app/distribution/${releaseId}`);
}

export async function reorderTracks(releaseId: string, orderedTrackIds: string[]): Promise<void> {
  const { supabase } = await requireArtist();
  await Promise.all(
    orderedTrackIds.map((trackId, index) =>
      supabase
        .from("tracks")
        .update({ position: index + 1 })
        .eq("id", trackId),
    ),
  );
  revalidatePath(`/app/distribution/${releaseId}`);
}

export async function updateTrackMetadata(
  releaseId: string,
  trackId: string,
  values: TrackMetadataValues,
): Promise<ActionResult> {
  const parsed = trackMetadataSchema.safeParse(values);
  if (!parsed.success) return { error: "invalid" };
  const { supabase } = await requireArtist();

  const { error } = await supabase
    .from("tracks")
    .update({
      title: parsed.data.title,
      version: parsed.data.version || null,
      isrc: parsed.data.isrc || null,
      explicit: parsed.data.explicit,
    })
    .eq("id", trackId);

  if (error) return { error: "unknown" };
  revalidatePath(`/app/distribution/${releaseId}`);
  return { error: null };
}

export async function replaceContributors(
  releaseId: string,
  trackId: string,
  contributors: ContributorValues[],
): Promise<ActionResult> {
  const parsed = contributorSchema.array().safeParse(contributors);
  if (!parsed.success) return { error: "invalid" };
  const { supabase } = await requireArtist();

  await supabase.from("contributors").delete().eq("track_id", trackId);

  if (parsed.data.length > 0) {
    const { error } = await supabase.from("contributors").insert(
      parsed.data.map((c) => ({
        track_id: trackId,
        role: c.role,
        name: c.name,
        split_pct: c.splitPct,
      })),
    );
    if (error) return { error: "unknown" };
  }

  revalidatePath(`/app/distribution/${releaseId}`);
  return { error: null };
}

export async function updateReleaseArtwork(
  releaseId: string,
  artworkR2Key: string,
  appleArtworkAddon: boolean,
): Promise<ActionResult> {
  const { supabase } = await requireArtist();
  const { error } = await supabase
    .from("releases")
    .update({ artwork_url: artworkR2Key, apple_artwork: appleArtworkAddon })
    .eq("id", releaseId);

  if (error) return { error: "unknown" };
  revalidatePath(`/app/distribution/${releaseId}`);
  return { error: null };
}

export async function replacePlatforms(releaseId: string, dspIds: string[]): Promise<ActionResult> {
  const { supabase } = await requireArtist();

  await supabase.from("release_platforms").delete().eq("release_id", releaseId);
  if (dspIds.length > 0) {
    const { error } = await supabase
      .from("release_platforms")
      .insert(dspIds.map((dsp) => ({ release_id: releaseId, dsp })));
    if (error) return { error: "unknown" };
  }

  revalidatePath(`/app/distribution/${releaseId}`);
  return { error: null };
}

export async function updateReleaseSchedule(
  releaseId: string,
  values: ScheduleValues,
): Promise<ActionResult> {
  const parsed = scheduleSchema.safeParse(values);
  if (!parsed.success) return { error: "invalid" };
  const { supabase } = await requireArtist();

  const { error } = await supabase
    .from("releases")
    .update({
      release_date: parsed.data.releaseDate,
      release_time: parsed.data.releaseTime || null,
      release_timezone: parsed.data.releaseTimezone,
    })
    .eq("id", releaseId);

  if (error) return { error: "unknown" };
  revalidatePath(`/app/distribution/${releaseId}`);
  return { error: null };
}

/** Catalogue existant de l'artiste — alimente les règles de doublons (§11.4). */
export async function getArtistCatalogFingerprint(): Promise<{
  audioHashes: string[];
  isrcs: string[];
  upcs: string[];
  titles: string[];
}> {
  const { supabase, artistId } = await requireArtist();

  const { data: releases } = await supabase
    .from("releases")
    .select("id, title, upc")
    .eq("artist_id", artistId);

  const releaseIds = (releases ?? []).map((r) => r.id);
  let tracks: Pick<Track, "isrc" | "audio_hash">[] = [];
  if (releaseIds.length > 0) {
    const { data } = await supabase
      .from("tracks")
      .select("isrc, audio_hash")
      .in("release_id", releaseIds);
    tracks = data ?? [];
  }

  return {
    audioHashes: tracks.map((t) => t.audio_hash).filter((h): h is string => !!h),
    isrcs: tracks.map((t) => t.isrc).filter((v): v is string => !!v),
    upcs: (releases ?? []).map((r) => r.upc).filter((v): v is string => !!v),
    titles: (releases ?? []).map((r) => r.title).filter((v): v is string => !!v),
  };
}

/**
 * Paiement de l'option Artwork Apple Music (§5.3, §11.4 étape 9 : "paiement
 * des add-ons éventuels" avant soumission). Prix résolu depuis `addon_prices`
 * (région du pays du profil), rail de paiement résolu depuis
 * `countries.default_payment_provider` — jamais de valeur en dur.
 */
export async function createAddonCheckoutAction(releaseId: string): Promise<ActionResult | never> {
  const { supabase, user, artistId } = await requireArtist();

  const { data: release } = await supabase
    .from("releases")
    .select("id, apple_artwork")
    .eq("id", releaseId)
    .eq("artist_id", artistId)
    .single();
  if (!release?.apple_artwork) return { error: "not_applicable" };

  const alreadyPaid = await hasAddonBeenPaid(releaseId);
  if (alreadyPaid) return { error: "already_paid" };

  if (!user.email) return { error: "unknown" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("country")
    .eq("id", user.id)
    .single();

  const region = await resolveRegionForCountry(supabase, profile?.country ?? null);
  const provider = await resolveProviderForCountry(supabase, profile?.country ?? null);
  const price = await getAddonPrice(supabase, "apple_music_artwork", region);
  if (!price) return { error: "unknown" };

  const admin = createAdminClient();
  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .insert({
      user_id: user.id,
      type: "addon",
      provider,
      amount: price.amount,
      currency: price.currency,
      status: "pending",
      release_id: releaseId,
      addon_id: "apple_music_artwork",
    })
    .select("id")
    .single();
  if (paymentError || !payment) return { error: "unknown" };

  const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL;
  const checkout = await getPaymentProvider(provider).createOneTimeCheckout({
    userId: user.id,
    email: user.email,
    description: "Sterkte Records — Artwork Apple Music",
    amount: price.amount,
    currency: price.currency,
    successUrl: `${siteUrl}/app/distribution/${releaseId}?addonPaid=1`,
    cancelUrl: `${siteUrl}/app/distribution/${releaseId}?addonCanceled=1`,
    paymentId: payment.id,
  });

  await admin.from("payments").update({ external_id: checkout.externalId }).eq("id", payment.id);
  redirect(checkout.url);
}

export async function hasAddonBeenPaid(releaseId: string): Promise<boolean> {
  const { supabase } = await requireArtist();
  const { data } = await supabase
    .from("payments")
    .select("id")
    .eq("release_id", releaseId)
    .eq("addon_id", "apple_music_artwork")
    .eq("status", "succeeded")
    .maybeSingle();
  return !!data;
}

/**
 * Soumission finale (§11.4 étape 9) : passe le statut à `in_review` et
 * envoie l'email de confirmation (§14, ADR 0011). **N'envoie plus
 * directement à LabelGrid** — la sortie rejoint la file de validation
 * qualité du back-office (§11.10) : c'est l'action staff `approveRelease`
 * (`src/app/(private)/admin/actions.ts`) qui déclenche l'envoi réel après
 * approbation, ou `rejectRelease` qui renvoie en brouillon avec motif (voir
 * ADR 0012). Bloque tant que l'add-on Apple Music, si choisi, n'est pas
 * payé (§5.3).
 */
export async function submitRelease(releaseId: string): Promise<ActionResult> {
  const { supabase, user, artistId } = await requireArtist();

  const { data: release } = await supabase
    .from("releases")
    .select("*")
    .eq("id", releaseId)
    .eq("artist_id", artistId)
    .single();
  const { count: trackCount } = await supabase
    .from("tracks")
    .select("id", { count: "exact", head: true })
    .eq("release_id", releaseId);

  if (!release || !trackCount) {
    return { error: "incomplete" };
  }

  if (release.apple_artwork && !(await hasAddonBeenPaid(releaseId))) {
    return { error: "addon_unpaid" };
  }

  await supabase
    .from("releases")
    .update({ status: "in_review", submitted_at: new Date().toISOString(), current_step: 9 })
    .eq("id", releaseId);

  await logAudit(user.id, "release_submitted_for_review", releaseId);

  if (user.email) {
    await sendReleaseSubmittedEmail({
      to: user.email,
      locale: await getRecipientLocale(supabase, user.id),
      releaseTitle: release.title,
      dashboardUrl: `${clientEnv.NEXT_PUBLIC_SITE_URL}/app/distribution/${releaseId}`,
    });
  }

  revalidatePath("/app/distribution");
  revalidatePath(`/app/distribution/${releaseId}`);
  return { error: null };
}

/**
 * Gestion post-sortie (§11.4, "recommandation Q16"). Une demande de
 * modification est journalisée (audit_log) pour traitement par l'équipe —
 * pas de workflow d'approbation automatisé dans ce sprint (back-office à
 * construire séparément, voir docs/adr/0009-distribution-module.md).
 */
export async function requestModification(
  releaseId: string,
  details: string,
): Promise<ActionResult> {
  const { user } = await requireArtist();
  const admin = createAdminClient();

  const { error } = await admin.from("audit_log").insert({
    actor_id: user.id,
    action: "modification_requested",
    entity: "release",
    entity_id: releaseId,
    diff: { details },
  });

  if (error) return { error: "unknown" };
  return { error: null };
}

/**
 * Retrait de la distribution (§11.4 — "Takedown"). Aucune suppression
 * définitive : le statut passe à `takedown_requested`, `archived` est mis à
 * vrai pour préserver l'historique de stats et la traçabilité. Le passage à
 * `removed` sera fait par le job de synchronisation LabelGrid (§13.1, pas
 * encore construit — même limite que le suivi `delivering` → `delivered`).
 */
export async function requestTakedown(releaseId: string, reason: string): Promise<ActionResult> {
  const { supabase, user } = await requireArtist();

  const [{ data: sync }, { data: release }] = await Promise.all([
    supabase
      .from("labelgrid_sync")
      .select("external_id")
      .eq("release_id", releaseId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("releases").select("title").eq("id", releaseId).single(),
  ]);

  if (sync?.external_id) {
    const labelgrid = getLabelGridClient();
    await labelgrid.requestTakedown(sync.external_id, reason);
  }

  const { error } = await supabase
    .from("releases")
    .update({ status: "takedown_requested", archived: true })
    .eq("id", releaseId);

  if (error) return { error: "unknown" };

  await logAudit(user.id, "release_takedown_requested", releaseId);

  if (user.email && release) {
    await sendTakedownConfirmedEmail({
      to: user.email,
      locale: await getRecipientLocale(supabase, user.id),
      releaseTitle: release.title,
      dashboardUrl: `${clientEnv.NEXT_PUBLIC_SITE_URL}/app/distribution/${releaseId}`,
    });
  }

  revalidatePath("/app/distribution");
  revalidatePath(`/app/distribution/${releaseId}`);
  return { error: null };
}

/** Liste des sorties de l'artiste (§8 — `/app/distribution`). */
export async function listArtistReleases() {
  const { supabase, artistId } = await requireArtist();
  const { data } = await supabase
    .from("releases")
    .select("id, title, type, status, release_date, created_at")
    .eq("artist_id", artistId)
    .order("created_at", { ascending: false });
  return data ?? [];
}
