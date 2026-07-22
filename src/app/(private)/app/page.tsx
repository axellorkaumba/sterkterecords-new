import { createClient } from "@/lib/supabase/server";
import { fetchUserRole } from "@/lib/supabase/profile";
import { getActiveArtist } from "@/lib/artists/active-artist";
import { getArtistLimit } from "@/lib/artists/limit";
import { OnboardingForm } from "./onboarding-form";
import { LabelOnboardingForm } from "./label-onboarding-form";
import { OverviewHeader } from "./overview-header";
import { ReleasesBanner } from "./releases-banner";
import { StreamsCard, RevenueCard, ReleasesCard } from "./stat-cards";
import { TopTracksCard } from "./top-tracks-card";
import { StreamsChartCard } from "./streams-chart-card";
import { QuickActionsCard } from "./quick-actions-card";
import { NotificationsCard } from "./notifications-card";
import { aggregateDashboardStats } from "./dashboard-stats";

/**
 * Vue d'ensemble artiste (§11.3 du CDC). Un utilisateur `artist` sans
 * profil artiste voit l'onboarding (§10.1) à la place — voir
 * docs/adr/0008-dashboard-artiste.md pour l'adaptation de cet ordre
 * (paiement/forfait pas encore construits).
 *
 * Un compte peut posséder plusieurs artistes (forfait Label, jusqu'à 5,
 * ADR 0027) : tout ce qui suit est scopé sur l'artiste "actif"
 * (`getActiveArtist`), pas systématiquement le premier créé.
 *
 * Compte Label (`profiles.role = 'manager'`, ADR 0029 Phase 1) : crée
 * d'abord son espace Label (`LabelOnboardingForm`) avant de pouvoir créer un
 * artiste — `OnboardingForm` bascule alors en variante `"labelFirst"`
 * (même formulaire, copy différente) plutôt que la variante par défaut.
 */
export default async function ArtistDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const role = await fetchUserRole(supabase, user.id);
  const isLabelAccount = role === "manager";

  const { data: label } = isLabelAccount
    ? await supabase.from("labels").select("*").eq("owner_id", user.id).maybeSingle()
    : { data: null };

  if (isLabelAccount && !label) {
    return <LabelOnboardingForm />;
  }

  const [{ artists, activeArtist: artist, ownedCount }, artistLimit] = await Promise.all([
    getActiveArtist(supabase, user.id),
    getArtistLimit(supabase, user.id),
  ]);

  if (!artist) {
    return <OnboardingForm variant={isLabelAccount ? "labelFirst" : "onboarding"} />;
  }

  // Le plafond (plans.max_artists) porte sur les artistes possédés — les
  // artistes collaborés (ADR 0030) ne comptent jamais dedans, sans quoi un
  // collaborateur ferait baisser le quota du compte propriétaire.
  const canAddMoreArtists = ownedCount < artistLimit;

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

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <OverviewHeader
        artist={artist}
        artists={artists}
        canAddMore={canAddMoreArtists}
        latestPeriod={latestPeriod}
        label={label}
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
