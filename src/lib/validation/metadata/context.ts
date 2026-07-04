export interface MetadataTrackInput {
  title: string;
  isrc: string | null;
  explicit: boolean;
  contributors: Array<{ role: string; name: string; splitPct: number }>;
}

export interface MetadataValidationContext {
  release: {
    title: string;
    genre: string;
    language: string;
    explicit: boolean;
    releaseDate: string | null;
    recordingDate: string | null;
  };
  upc: string | null;
  tracks: MetadataTrackInput[];
  /** Catalogue existant de l'artiste (autres sorties déjà livrées/en cours) — détection de doublons. */
  existingIsrcs: string[];
  existingUpcs: string[];
  existingTitles: string[];
}
