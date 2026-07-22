import { createClient } from "@/lib/supabase/server";
import { getActiveArtist } from "@/lib/artists/active-artist";
import { getArtistLimit } from "@/lib/artists/limit";
import { OnboardingForm } from "./onboarding-form";
import { OverviewHeader } from "./overview-header";
import { ReleasesBanner } from "./releases-banner";
import { StreamsCard, RevenueCard, ReleasesCard } from "./stat-cards";
import { TopTracksCard, type TopTrack } from "./top-tracks-card";
import { StreamsChartCard, type MonthlyStreams } from "./streams-chart-card";
import { QuickActionsCard } from "./quick-actions-card";
import { NotificationsCard } from "./notifications-card";

/**
 * Vue d'ensemble artiste (§11.3 du CDC). Un utilisateur `artist` sans
 * profil artiste voit l'onboarding (§10.1) à la place — voir
 * docs/adr/0008-dashboard-artiste.md pour l'adaptation de cet ordre
 * (paiement/forfait pas encore construits).
 *
 * Un compte peut posséder plusieurs artistes (forfait Label, jusqu'à 5,
 * ADR 0027) : tout ce qui suit est scopé sur l'artiste "actif"
 * (`getActiveArtist`), pas systématiquement le premier créé.
 */
export default async function ArtistDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ artists, activeArtist: artist }, artistLimit] = await Promise.all([
    getActiveArtist(supabase, user.id),
    getArtistLimit(supabase, user.id),
  ]);

  if (!artist) {
    return <OnboardingForm />;
  }

  const canAddMoreArtists = artists.length < artistLimit;

  const [{ data: releases }, { data: statsRows }, { data: wallet }, { data: notifications }] =
    await Promise.all([
      supabase.from("releases").select("id, title, artwork_url, status").eq("artist_id", artist.id),
      supabase
        .from("stats_monthly")
        .select("period, streams, revenue, track_id, tracks(title)")
        .eq("artist_id", artist.id)
        .order("period", { ascending: false })
        .limit(1000),
      supabase
        .from("wallet")
        .select("balance_available, balance_pending, currency")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const delivered = (releases ?? []).filter((r) => r.status === "delivered").length;
  const drafts = (releases ?? []).filter((r) => r.status === "draft").length;
  const inProgress = (releases ?? []).length - delivered - drafts;

  const periodTotals = new Map<string, number>();
  for (const row of statsRows ?? []) {
    periodTotals.set(row.period, (periodTotals.get(row.period) ?? 0) + row.streams);
  }
  const sortedPeriods = [...periodTotals.keys()].sort((a, b) => b.localeCompare(a));
  const latestPeriod = sortedPeriods[0] ?? null;
  const currentStreams = latestPeriod ? (periodTotals.get(latestPeriod) ?? 0) : null;
  const previousStreams = sortedPeriods[1] ? (periodTotals.get(sortedPeriods[1]) ?? 0) : null;

  const monthlyChartData: MonthlyStreams[] = [...sortedPeriods]
    .slice(0, 6)
    .reverse()
    .map((period) => ({
      month: new Date(period).toLocaleDateString(undefined, { month: "short" }),
      streams: periodTotals.get(period) ?? 0,
    }));

  const trackTotals = new Map<string, { title: string; streams: number }>();
  for (const row of statsRows ?? []) {
    if (row.period !== latestPeriod || !row.track_id) continue;
    const title = row.tracks?.title ?? "—";
    const current = trackTotals.get(row.track_id) ?? { title, streams: 0 };
    current.streams += row.streams;
    trackTotals.set(row.track_id, current);
  }
  const topTracks: TopTrack[] = [...trackTotals.entries()]
    .map(([id, value]) => ({ id, ...value }))
    .sort((a, b) => b.streams - a.streams)
    .slice(0, 5);

  const totalRevenue = [...periodTotals.keys()].length > 0;
  const hasAnyRevenue =
    totalRevenue || (wallet?.balance_available ?? 0) > 0 || (wallet?.balance_pending ?? 0) > 0;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <OverviewHeader
        artist={artist}
        artists={artists}
        canAddMore={canAddMoreArtists}
        latestPeriod={latestPeriod}
      />

      <ReleasesBanner releases={releases ?? []} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StreamsCard currentStreams={currentStreams} previousStreams={previousStreams} />
        <RevenueCard
          balanceAvailable={wallet?.balance_available ?? 0}
          balancePending={wallet?.balance_pending ?? 0}
          currency={wallet?.currency ?? "USD"}
          hasAnyRevenue={hasAnyRevenue}
        />
        <ReleasesCard delivered={delivered} inProgress={inProgress} drafts={drafts} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StreamsChartCard data={monthlyChartData} />
        <TopTracksCard tracks={topTracks} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <QuickActionsCard />
        <NotificationsCard notifications={notifications ?? []} />
      </div>
    </div>
  );
}
