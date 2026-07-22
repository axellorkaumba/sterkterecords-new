import { z } from "zod";

export const createArtistSchema = z.object({
  name: z.string().trim().min(2).max(120),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  avatarUrl: z.string().trim().url().optional().or(z.literal("")),
  website: z.string().trim().url().optional().or(z.literal("")),
  instagram: z.string().trim().max(120).optional().or(z.literal("")),
  spotify: z.string().trim().url().optional().or(z.literal("")),
});
export type CreateArtistValues = z.infer<typeof createArtistSchema>;

/** Espace Label (ADR 0029, Phase 1) — créé une fois, avant le premier artiste du compte manager. */
export const createLabelSchema = z.object({
  name: z.string().trim().min(2).max(120),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  avatarUrl: z.string().trim().url().optional().or(z.literal("")),
});
export type CreateLabelValues = z.infer<typeof createLabelSchema>;
