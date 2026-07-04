import { getTranslations } from "next-intl/server";
import { PlusIcon, BarChart3Icon, BanknoteIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Actions rapides (§11.3) — les trois cibles (tunnel de distribution,
 * statistiques détaillées, retraits) ne sont pas encore construites
 * (sprints suivants) : boutons désactivés plutôt que des liens morts, même
 * traitement que la nav (`AppSidebarNav`).
 */
export async function QuickActionsCard() {
  const t = await getTranslations("Dashboard.quickActions");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button variant="outline" disabled className="justify-start">
          <PlusIcon aria-hidden="true" />
          {t("newRelease")}
        </Button>
        <Button variant="outline" disabled className="justify-start">
          <BarChart3Icon aria-hidden="true" />
          {t("viewStats")}
        </Button>
        <Button variant="outline" disabled className="justify-start">
          <BanknoteIcon aria-hidden="true" />
          {t("requestWithdrawal")}
        </Button>
        <p className="text-caption text-muted-foreground">{t("comingSoon")}</p>
      </CardContent>
    </Card>
  );
}
