import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSubscriptionActive } from "@/lib/subscriptions/gate";
import { CancelSubscriptionButton } from "./cancel-subscription-button";

const STATUS_BADGE_VARIANT = {
  active: "success",
  past_due: "warning",
  canceled: "outline",
  incomplete: "outline",
} as const;

/** Onglet Abonnement (§11.2, §5) — statut réel : Label (sur mesure, back-office) ou SOLO self-service. */
export async function SubscriptionTab() {
  const t = await getTranslations("Account.subscription");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: labelArtist }, { data: subscription }] = await Promise.all([
    supabase
      .from("artists")
      .select("id")
      .eq("owner_id", user.id)
      .eq("plan", "label")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("plan_id, period, status, current_period_end")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (labelArtist) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-small text-muted-foreground">{t("currentPlanLabel")}</p>
            <Badge variant="gold">{t("labelPlanName")}</Badge>
          </div>
          <p className="text-small text-muted-foreground">{t("labelPlanDescription")}</p>
        </CardContent>
      </Card>
    );
  }

  const isActive = isSubscriptionActive(subscription?.status, subscription?.current_period_end);

  if (!subscription || !isActive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-small text-muted-foreground">{t("currentPlanLabel")}</p>
            <Badge variant="outline">{t("noPlanName")}</Badge>
          </div>
          <p className="text-small text-muted-foreground">{t("noPlanDescription")}</p>
          <Button className="w-fit" render={<Link href="/app/abonnement" />} nativeButton={false}>
            {t("choosePlanCta")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-small text-muted-foreground">{t("currentPlanLabel")}</p>
          <Badge variant={STATUS_BADGE_VARIANT[subscription.status]}>
            {t(`statusLabels.${subscription.status}`)}
          </Badge>
        </div>
        <p>
          <span className="font-display text-h3">{t("soloPlanName")}</span>
          <span className="text-muted-foreground text-small">
            {" "}
            — {t(`period.${subscription.period}`)}
          </span>
        </p>
        {subscription.current_period_end && (
          <p className="text-small text-muted-foreground">
            {t("renewsOn", {
              date: new Date(subscription.current_period_end).toLocaleDateString(),
            })}
          </p>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/app/abonnement" />}
            nativeButton={false}
          >
            {t("changePlanCta")}
          </Button>
          <CancelSubscriptionButton />
        </div>
      </CardContent>
    </Card>
  );
}
