import type { MonthlyStreams } from "./streams-chart-card";
import type { TopTrack } from "./top-tracks-card";

interface ReleaseRow {
  status: string;
}

interface StatsRow {
  period: string;
  streams: number;
  track_id: string | null;
  tracks: { title: string } | null;
}

interface WalletRow {
  balance_available: number;
  balance_pending: number;
}

/**
 * Agrégation partagée entre le dashboard d'un artiste (`page.tsx`, scopé sur
 * un `artist_id`) et la vue consolidée Label (`label/page.tsx`, scopée sur
 * plusieurs `artist_id` d'un coup, ADR 0029 Phase 3) — même logique de
 * regroupement par période/piste, seule la requête en amont diffère (un
 * `.eq("artist_id", x)` vs un `.in("artist_id", [...])`).
 */
export function aggregateDashboardStats(
  releases: ReleaseRow[],
  statsRows: StatsRow[],
  wallet: WalletRow | null,
) {
  const delivered = releases.filter((r) => r.status === "delivered").length;
  const drafts = releases.filter((r) => r.status === "draft").length;
  const inProgress = releases.length - delivered - drafts;

  const periodTotals = new Map<string, number>();
  for (const row of statsRows) {
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
  for (const row of statsRows) {
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

  const hasAnyRevenue =
    sortedPeriods.length > 0 ||
    (wallet?.balance_available ?? 0) > 0 ||
    (wallet?.balance_pending ?? 0) > 0;

  return {
    delivered,
    drafts,
    inProgress,
    latestPeriod,
    currentStreams,
    previousStreams,
    monthlyChartData,
    topTracks,
    hasAnyRevenue,
  };
}
