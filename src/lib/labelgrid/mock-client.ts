import type {
  DspInfo,
  LabelGridClient,
  MonthlyReportEntry,
  ReleaseStatusInfo,
  SubmitReleaseInput,
} from "@/lib/labelgrid/types";

/**
 * Implémentation mock du contrat LabelGrid (§13.1), utilisée tant que
 * l'onboarding API n'est pas terminé. Permet de développer et tester tout
 * le tunnel de distribution (§11.4) sans dépendance externe.
 *
 * Liste de DSP alignée sur le §11.4 : "Spotify, Apple Music, Deezer,
 * YouTube Music, Amazon, Tidal, TikTok, Boomplay, Audiomack, etc."
 */
const MOCK_DSPS: DspInfo[] = [
  { id: "spotify", name: "Spotify", category: "streaming", logoUrl: "/dsp/spotify.svg" },
  {
    id: "apple_music",
    name: "Apple Music",
    category: "streaming",
    logoUrl: "/dsp/apple_music.svg",
  },
  { id: "deezer", name: "Deezer", category: "streaming", logoUrl: "/dsp/deezer.svg" },
  {
    id: "amazon_music",
    name: "Amazon Music",
    category: "streaming",
    logoUrl: "/dsp/amazon_music.svg",
  },
  { id: "tidal", name: "Tidal", category: "streaming", logoUrl: "/dsp/tidal.svg" },
  {
    id: "youtube_music",
    name: "YouTube Music",
    category: "video",
    logoUrl: "/dsp/youtube_music.svg",
  },
  { id: "tiktok", name: "TikTok", category: "social", logoUrl: "/dsp/tiktok.svg" },
  { id: "boomplay", name: "Boomplay", category: "afrique", logoUrl: "/dsp/boomplay.svg" },
  { id: "audiomack", name: "Audiomack", category: "afrique", logoUrl: "/dsp/audiomack.svg" },
];

function generateFakeExternalId(releaseId: string) {
  return `mock_${releaseId}_${Date.now()}`;
}

export class MockLabelGridClient implements LabelGridClient {
  async listAvailableDsps(): Promise<DspInfo[]> {
    return MOCK_DSPS;
  }

  async submitRelease(input: SubmitReleaseInput): Promise<{ externalId: string }> {
    return { externalId: generateFakeExternalId(input.releaseId) };
  }

  async getReleaseStatus(externalId: string): Promise<ReleaseStatusInfo> {
    return {
      externalId,
      status: "in_delivery",
      updatedAt: new Date().toISOString(),
    };
  }

  async fetchMonthlyReport(period: string): Promise<MonthlyReportEntry[]> {
    return [
      {
        trackIsrc: "FRXXX0000001",
        dsp: "spotify",
        countryCode: "CD",
        period,
        streams: 1240,
        revenue: 3.42,
        currency: "USD",
      },
    ];
  }
}
