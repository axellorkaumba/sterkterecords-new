import { getTranslations } from "next-intl/server";

// Placeholder — vue d'ensemble artiste (§11.3). Protection par auth + RLS
// branchée au Sprint 3, contenu réel au Sprint 4.
export default async function ArtistDashboardPage() {
  const t = await getTranslations("Dashboard");
  return <p className="text-sm text-neutral-500">{t("placeholder")}</p>;
}
