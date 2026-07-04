import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { PlusIcon, BarChart3Icon, BanknoteIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Actions rapides (§11.3). "Nouvelle sortie" est active depuis le module
 * Distribution (Sprint 5, §11.4) ; "Voir les statistiques" et "Demander un
 * retrait" restent désactivées (pages pas encore construites) — même
 * traitement que la nav (`AppSidebarNav`), pas de lien mort.
 */
export async function QuickActionsCard() {
  const t = await getTranslations("Dashboard.quickActions");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button
          variant="outline"
          className="justify-start"
          render={<Link href="/app/distribution/nouvelle" />}
          nativeButton={false}
        >
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
