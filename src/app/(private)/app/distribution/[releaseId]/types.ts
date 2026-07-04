import type { Database } from "@/types/database.types";
import type { DspInfo } from "@/lib/labelgrid";

export type ContributorRole = Database["public"]["Enums"]["contributor_role"];

export interface TunnelContributor {
  role: ContributorRole;
  name: string;
  splitPct: number;
}

export interface TunnelTrack {
  id: string;
  position: number;
  title: string;
  version: string;
  isrc: string;
  explicit: boolean;
  duration: number | null;
  audioHash: string;
  contributors: TunnelContributor[];
}

export interface CatalogFingerprint {
  audioHashes: string[];
  isrcs: string[];
  upcs: string[];
  titles: string[];
}

export interface TunnelReleaseData {
  id: string;
  artistId: string;
  type: Database["public"]["Enums"]["release_type"];
  title: string;
  genre: string;
  subGenre: string;
  language: string;
  explicit: boolean;
  recordingDate: string;
  copyrightP: string;
  copyrightC: string;
  labelName: string;
  artworkKey: string | null;
  appleArtworkAddon: boolean;
  releaseDate: string;
  releaseTime: string;
  releaseTimezone: string;
  upc: string | null;
  status: Database["public"]["Enums"]["release_status"];
}

export type { DspInfo };
