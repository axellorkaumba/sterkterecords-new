import { getTranslations } from "next-intl/server";

// Placeholder — tableau de bord global back-office (§11.10 du CDC).
export default async function AdminDashboardPage() {
  const t = await getTranslations("Admin");
  return <p className="text-sm text-neutral-500">{t("placeholder")}</p>;
}
