import { z } from "zod";

/**
 * Saisie manuelle d'un relevé DSP (§11.5, module Royalties) — en attendant
 * une vraie ingestion automatisée LabelGrid (hors périmètre, voir
 * docs/adr/0032-module-royalties.md). Pas de `trackId` : attribué au niveau
 * artiste, pas piste par piste — plus simple pour une saisie manuelle, au
 * prix de ne pas alimenter le "Top titres" du dashboard pour ces lignes.
 */
export const recordRoyaltyStatementSchema = z.object({
  artistId: z.string().uuid(),
  period: z.string().min(1),
  dsp: z.string().min(1),
  country: z.string().length(2).optional().or(z.literal("")),
  streams: z.coerce.number().int().nonnegative(),
  revenue: z.coerce.number().nonnegative(),
});
export type RecordRoyaltyStatementValues = z.infer<typeof recordRoyaltyStatementSchema>;
