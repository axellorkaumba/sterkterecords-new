import { getTranslations } from "next-intl/server";
import { TypeSelector } from "./type-selector";

export async function generateMetadata() {
  const t = await getTranslations("DistributionApp.typeStep");
  return { title: t("title") };
}

/** Étape 1 du tunnel de distribution (§11.4) — vit hors de `[releaseId]` : la sortie n'existe pas encore. */
export default function NewReleasePage() {
  return <TypeSelector />;
}
