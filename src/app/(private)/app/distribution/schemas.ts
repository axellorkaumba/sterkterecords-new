import { z } from "zod";

export const releaseTypeSchema = z.enum(["single", "ep", "album"]);
export type ReleaseTypeValue = z.infer<typeof releaseTypeSchema>;

/** Nombre de pistes attendu par type de sortie (§11.4 étape 1). */
export const TRACK_COUNT_RANGE: Record<ReleaseTypeValue, { min: number; max: number }> = {
  single: { min: 1, max: 3 },
  ep: { min: 4, max: 6 },
  album: { min: 7, max: 99 },
};

export const releaseMetadataSchema = z.object({
  title: z.string().trim().min(1).max(200),
  genre: z.string().trim().min(1).max(80),
  subGenre: z.string().trim().max(80).optional().or(z.literal("")),
  language: z.string().trim().min(1).max(40),
  explicit: z.boolean(),
  recordingDate: z.string().optional().or(z.literal("")),
  copyrightP: z.string().trim().max(120).optional().or(z.literal("")),
  copyrightC: z.string().trim().max(120).optional().or(z.literal("")),
});
export type ReleaseMetadataValues = z.infer<typeof releaseMetadataSchema>;

export const trackMetadataSchema = z.object({
  title: z.string().trim().min(1).max(200),
  version: z.string().trim().max(80).optional().or(z.literal("")),
  isrc: z.string().trim().max(20).optional().or(z.literal("")),
  explicit: z.boolean(),
});
export type TrackMetadataValues = z.infer<typeof trackMetadataSchema>;

export const contributorRoleSchema = z.enum([
  "main_artist",
  "featuring",
  "composer",
  "author",
  "producer",
  "mixing",
  "mastering",
]);

export const contributorSchema = z.object({
  role: contributorRoleSchema,
  name: z.string().trim().min(1).max(120),
  splitPct: z.number().min(0).max(100),
});
export type ContributorValues = z.infer<typeof contributorSchema>;

export const scheduleSchema = z.object({
  releaseDate: z.string().min(1),
  releaseTime: z.string().optional().or(z.literal("")),
  releaseTimezone: z.string().min(1),
});
export type ScheduleValues = z.infer<typeof scheduleSchema>;

/** Délai minimum recommandé pour maximiser les chances de playlists éditoriales (§11.4 étape 7). */
export const RECOMMENDED_MIN_LEAD_DAYS = 7;
