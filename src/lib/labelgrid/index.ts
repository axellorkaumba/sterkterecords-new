import "server-only";

import { serverEnv } from "@/lib/env";
import { MockLabelGridClient } from "@/lib/labelgrid/mock-client";
import type { LabelGridClient } from "@/lib/labelgrid/types";

export type { LabelGridClient } from "@/lib/labelgrid/types";
export * from "@/lib/labelgrid/types";

let cachedClient: LabelGridClient | null = null;

/**
 * Point d'entrée unique de l'intégration LabelGrid. Tant que
 * `LABELGRID_API_KEY` n'est pas défini (onboarding en cours, §13.1), on
 * utilise systématiquement le mock — le reste du produit (tunnel de
 * distribution, reporting) code contre l'interface `LabelGridClient` et ne
 * changera pas quand le vrai client sera branché.
 *
 * TODO(intégration LabelGrid) : créer `RealLabelGridClient implements
 * LabelGridClient` dans `real-client.ts` contre la doc API live, puis
 * l'utiliser ici quand `LABELGRID_API_KEY` est présent.
 */
export function getLabelGridClient(): LabelGridClient {
  if (cachedClient) return cachedClient;

  if (!serverEnv.LABELGRID_API_KEY) {
    cachedClient = new MockLabelGridClient();
    return cachedClient;
  }

  throw new Error(
    "[labelgrid] LABELGRID_API_KEY est défini mais aucune implémentation réelle " +
      "n'est encore branchée. Implémente RealLabelGridClient contre la documentation " +
      "API LabelGrid puis mets à jour getLabelGridClient().",
  );
}
