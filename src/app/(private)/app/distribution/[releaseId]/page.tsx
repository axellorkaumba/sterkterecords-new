import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLabelGridClient } from "@/lib/labelgrid";
import { getArtistCatalogFingerprint } from "../actions";
import { DistributionTunnel } from "./distribution-tunnel";
import { ReleaseDetail } from "./release-detail";
import type { TunnelContributor, TunnelReleaseData, TunnelTrack } from "./types";

interface PageProps {
  params: Promise<{ releaseId: string }>;
}

/**
 * Entrée du tunnel (§11.4, étapes 2 à 9 — l'étape 1 vit dans `/nouvelle`).
 * Une sortie qui n'est plus `draft` affiche sa fiche détail (gestion
 * post-sortie, §11.4 "recommandation Q16") plutôt que de rouvrir le tunnel.
 */
export default async function ReleaseTunnelPage({ params }: PageProps) {
  const { releaseId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: release } = await supabase
    .from("releases")
    .select("*")
    .eq("id", releaseId)
    .maybeSingle();

  if (!release) {
    redirect("/app/distribution");
  }

  const { data: tracksRows } = await supabase
    .from("tracks")
    .select("*, contributors(role, name, split_pct)")
    .eq("release_id", releaseId)
    .order("position");

  const tracks: TunnelTrack[] = (tracksRows ?? []).map((track) => ({
    id: track.id,
    position: track.position,
    title: track.title,
    version: track.version ?? "",
    isrc: track.isrc ?? "",
    explicit: track.explicit,
    duration: track.duration,
    audioHash: track.audio_hash ?? "",
    contributors: (track.contributors ?? []).map((c): TunnelContributor => ({
      role: c.role,
      name: c.name,
      splitPct: c.split_pct,
    })),
  }));

  if (release.status !== "draft") {
    return <ReleaseDetail release={release} tracks={tracks} />;
  }

  const { data: platformRows } = await supabase
    .from("release_platforms")
    .select("dsp")
    .eq("release_id", releaseId);

  const [catalogFingerprint, availableDsps] = await Promise.all([
    getArtistCatalogFingerprint(),
    getLabelGridClient().listAvailableDsps(),
  ]);

  const releaseData: TunnelReleaseData = {
    id: release.id,
    artistId: release.artist_id,
    type: release.type,
    title: release.title,
    genre: release.genre ?? "",
    subGenre: release.sub_genre ?? "",
    language: release.language ?? "",
    explicit: release.explicit,
    recordingDate: release.recording_date ?? "",
    copyrightP: release.copyright_p ?? "",
    copyrightC: release.copyright_c ?? "",
    labelName: release.label_name,
    artworkKey: release.artwork_url,
    appleArtworkAddon: release.apple_artwork,
    releaseDate: release.release_date ?? "",
    releaseTime: release.release_time ?? "",
    releaseTimezone: release.release_timezone ?? "",
    upc: release.upc,
    status: release.status,
  };

  return (
    <DistributionTunnel
      release={releaseData}
      initialTracks={tracks}
      initialPlatforms={(platformRows ?? []).map((p) => p.dsp)}
      catalogFingerprint={catalogFingerprint}
      availableDsps={availableDsps}
      initialStep={release.current_step}
    />
  );
}
