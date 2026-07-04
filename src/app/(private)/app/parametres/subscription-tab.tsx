import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export async function SubscriptionTab() {
  const t = await getTranslations("Account.subscription");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-small text-muted-foreground">{t("currentPlanLabel")}</p>
          <Badge variant="outline">{t("freePlanName")}</Badge>
        </div>
        <p className="text-small text-muted-foreground">{t("description")}</p>
        <Button
          variant="outline"
          className="w-fit"
          render={<Link href="/tarifs" />}
          nativeButton={false}
        >
          {t("viewPlansCta")}
        </Button>
      </CardContent>
    </Card>
  );
}
