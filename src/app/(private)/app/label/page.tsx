import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { fetchUserRole } from "@/lib/supabase/profile";
import { listOwnedArtists } from "@/lib/artists/active-artist";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StreamsCard, RevenueCard, ReleasesCard } from "../stat-cards";
import { StreamsChartCard } from "../streams-chart-card";
import { TopTracksCard } from "../top-tracks-card";
import { aggregateDashboardStats } from "../dashboard-stats";
import { ViewArtistButton } from "./view-artist-button";

export async function generateMetadata() {
  const t = await getTranslations("Dashboard.labelView");
  return { title: t("title") };
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Vue consolidée Label (ADR 0029, Phase 3) — stats/sorties agrégées sur
 * tous les artistes du compte manager, réutilisant les mêmes cartes que le
 * dashboard par-artiste (`page.tsx`) via `aggregateDashboardStats`. Le
 * wallet est déjà consolidé nativement (`wallet.user_id`, pas `artist_id`) :
 * rien à agréger côté paiements, la même requête que `page.tsx` suffit.
 *
 * Réservée aux comptes manager avec un espace Label et au moins un artiste
 * — sinon redirection vers `/app`, qui gère déjà ces états (onboarding
 * label/premier artiste, voir ADR 0029 Phase 1).
 */
export default async function LabelOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const role = await fetchUserRole(supabase, user.id);
  if (role !== "manager") redirect("/app");

  const [{ data: label }, artists] = await Promise.all([
    supabase.from("labels").select("*").eq("owner_id", user.id).maybeSingle(),
    listOwnedArtists(supabase, user.id),
  ]);
  if (!label || artists.length === 0) redirect("/app");

  const artistIds = artists.map((a) => a.id);
  const t = await getTranslations("Dashboard.labelView");

  const [{ data: releases }, { data: statsRows }, { data: wallet }] = await Promise.all([
    supabase.from("releases").select("artist_id, status").in("artist_id", artistIds),
    supabase
      .from("stats_monthly")
      .select("period, streams, track_id, artist_id, tracks(title)")
      .in("artist_id", artistIds)
      .order("period", { ascending: false })
      .limit(5000),
    supabase
      .from("wallet")
      .select("balance_available, balance_pending, currency")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const {
    delivered,
    drafts,
    inProgress,
    latestPeriod,
    currentStreams,
    previousStreams,
    monthlyChartData,
    topTracks,
    hasAnyRevenue,
  } = aggregateDashboardStats(releases ?? [], statsRows ?? [], wallet ?? null);

  const releaseCountByArtist = new Map<string, number>();
  for (const release of releases ?? []) {
    releaseCountByArtist.set(
      release.artist_id,
      (releaseCountByArtist.get(release.artist_id) ?? 0) + 1,
    );
  }
  const streamsByArtist = new Map<string, number>();
  for (const row of statsRows ?? []) {
    if (row.period !== latestPeriod) continue;
    streamsByArtist.set(row.artist_id, (streamsByArtist.get(row.artist_id) ?? 0) + row.streams);
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          {label.avatar_url ? <AvatarImage src={label.avatar_url} alt="" /> : null}
          <AvatarFallback>{initialsOf(label.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-h2 font-display">{label.name}</h1>
          <p className="text-small text-muted-foreground">
            {t("subtitle", { count: artists.length })}
          </p>
        </div>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>{t("artistsTitle")}</CardTitle>
          <CardDescription>{t("artistsSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {artists.map((artist) => (
            <div
              key={artist.id}
              className="border-border flex items-center gap-3 border-b py-2 last:border-b-0"
            >
              <Avatar size="sm">
                {artist.avatar_url ? <AvatarImage src={artist.avatar_url} alt="" /> : null}
                <AvatarFallback>{initialsOf(artist.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-small font-medium">{artist.name}</p>
                <p className="text-caption text-muted-foreground">
                  {t("artistStats", {
                    releases: releaseCountByArtist.get(artist.id) ?? 0,
                    streams: (streamsByArtist.get(artist.id) ?? 0).toLocaleString(),
                  })}
                </p>
              </div>
              <ViewArtistButton artistId={artist.id} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
