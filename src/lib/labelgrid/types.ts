/**
 * Contrat de l'adaptateur LabelGrid (§13.1 du CDC).
 *
 * "Le mapping exact des endpoints/champs se fera contre la documentation
 * live LabelGrid lors de l'intégration (onboarding en cours)." — ce fichier
 * définit donc l'interface CIBLE côté produit Sterkte Records, pas le
 * contrat réel de l'API LabelGrid (encore inconnu). Une fois la doc
 * obtenue, seule `RealLabelGridClient` (à créer, voir index.ts) doit
 * changer — jamais le code qui consomme `LabelGridClient`.
 */

export interface DspInfo {
  /** Identifiant DSP côté LabelGrid (ex. "spotify", "apple_music"). */
  id: string;
  name: string;
  category: "streaming" | "social" | "video" | "afrique";
  logoUrl: string;
}

export interface SubmitReleaseTrackInput {
  position: number;
  title: string;
  /** Fourni par l'artiste ou généré par LabelGrid si absent. */
  isrc?: string;
  audioFileUrl: string;
  explicit: boolean;
  contributors: Array<{ name: string; role: string; splitPct: number }>;
}

export interface SubmitReleaseInput {
  releaseId: string;
  type: "single" | "ep" | "album";
  title: string;
  /** Fourni par le label ou généré par LabelGrid si absent. */
  upc?: string;
  genre: string;
  language: string;
  explicit: boolean;
  artworkUrl: string;
  releaseDate: string; // ISO 8601
  selectedDsps: string[];
  tracks: SubmitReleaseTrackInput[];
}

export type LabelGridDeliveryStatus =
  "pending" | "in_delivery" | "delivered" | "error" | "takedown_requested" | "taken_down";

export interface ReleaseStatusInfo {
  externalId: string;
  status: LabelGridDeliveryStatus;
  updatedAt: string; // ISO 8601
  errorMessage?: string;
}

export interface MonthlyReportEntry {
  trackIsrc: string;
  dsp: string;
  countryCode: string;
  period: string; // "YYYY-MM"
  streams: number;
  revenue: number;
  currency: string;
}

/**
 * Contrat implémenté par le vrai client (une fois la doc API disponible) et
 * par le client mock (utilisé partout tant que l'onboarding LabelGrid n'est
 * pas terminé).
 */
export interface LabelGridClient {
  listAvailableDsps(): Promise<DspInfo[]>;
  submitRelease(input: SubmitReleaseInput): Promise<{ externalId: string }>;
  getReleaseStatus(externalId: string): Promise<ReleaseStatusInfo>;
  fetchMonthlyReport(period: string): Promise<MonthlyReportEntry[]>;
}
