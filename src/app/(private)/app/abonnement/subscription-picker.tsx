"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CheckIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createSubscriptionCheckoutAction } from "./actions";
import { ManualPaymentSection } from "./manual-payment-section";
import type { LatestPaymentProofStatus } from "./actions";

type PlanId = "solo" | "pro" | "label";
const PLAN_IDS: PlanId[] = ["solo", "pro", "label"];
const PLAN_FEATURES: Record<PlanId, readonly string[]> = {
  solo: ["unlimitedReleases", "allDsps", "hundredPercentRoyalties", "monthlyStats"],
  pro: ["unlimitedReleases", "allDsps", "hundredPercentRoyalties", "monthlyStats"],
  label: ["unlimitedReleases", "allDsps", "hundredPercentRoyalties", "monthlyStats", "multiArtist"],
};

interface PlanPrice {
  period: "monthly" | "annual";
  currency: string;
  amount: number;
}

interface SubscriptionPickerProps {
  pricesByPlan: Record<PlanId, PlanPrice[]>;
  currentPlanId: PlanId | null;
  currentPeriod: "monthly" | "annual" | null;
  justSucceeded: boolean;
  justCanceled: boolean;
  latestProof: LatestPaymentProofStatus | null;
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
}

export function SubscriptionPicker({
  pricesByPlan,
  currentPlanId,
  currentPeriod,
  justSucceeded,
  justCanceled,
  latestProof: initialLatestProof,
}: SubscriptionPickerProps) {
  const t = useTranslations("SubscriptionPage");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(currentPlanId ?? "solo");
  const [latestProof, setLatestProof] = useState(initialLatestProof);

  const prices = pricesByPlan[selectedPlan];
  const hasMonthly = prices.some((p) => p.period === "monthly");
  const [period, setPeriod] = useState<"monthly" | "annual">(hasMonthly ? "monthly" : "annual");

  const selectedPrice = useMemo(() => prices.find((p) => p.period === period), [prices, period]);

  function handleSelectPlan(planId: string) {
    setSelectedPlan(planId as PlanId);
    const nextHasMonthly = pricesByPlan[planId as PlanId].some((p) => p.period === "monthly");
    setPeriod(nextHasMonthly ? "monthly" : "annual");
  }

  function handleSubscribe() {
    setError(null);
    startTransition(async () => {
      const result = await createSubscriptionCheckoutAction(
        selectedPlan,
        period,
        couponCode || undefined,
      );
      if (result?.error) setError(result.error);
    });
  }

  const pendingForThisSelection =
    latestProof?.status === "pending" &&
    latestProof.planId === selectedPlan &&
    latestProof.period === period;
  const rejectedForThisSelection =
    latestProof?.status === "rejected" &&
    latestProof.planId === selectedPlan &&
    latestProof.period === period;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h2 font-display">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {justSucceeded && (
        <div className="border-success/40 bg-success/10 text-success rounded-lg border p-4 text-sm">
          {t("successBanner")}
        </div>
      )}
      {justCanceled && (
        <div className="border-warning/40 bg-warning/10 rounded-lg border p-4 text-sm">
          {t("canceledBanner")}
        </div>
      )}
      {currentPlanId && (
        <div className="border-primary/40 bg-primary/5 rounded-lg border p-4 text-sm">
          {t("alreadyActive", {
            plan: t(`plans.${currentPlanId}.name`),
            period: currentPeriod ? t(`period.${currentPeriod}`) : "",
          })}
        </div>
      )}

      <Tabs value={selectedPlan} onValueChange={handleSelectPlan}>
        <TabsList>
          {PLAN_IDS.map((planId) => (
            <TabsTrigger key={planId} value={planId}>
              {t(`plans.${planId}.name`)}
            </TabsTrigger>
          ))}
        </TabsList>

        {PLAN_IDS.map((planId) => (
          <TabsContent key={planId} value={planId}>
            <Card
              className={
                planId === selectedPlan && planId === "pro" ? "ring-primary ring-2" : undefined
              }
            >
              <CardHeader>
                <Badge variant="gold" className="mb-2 w-fit">
                  {t(`plans.${planId}.badge`)}
                </Badge>
                <CardTitle>{t(`plans.${planId}.name`)}</CardTitle>
                <CardDescription>{t(`plans.${planId}.description`)}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {hasMonthly && (
                  <div className="bg-muted flex gap-1 rounded-lg p-1">
                    {(["monthly", "annual"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setPeriod(option)}
                        className={
                          period === option
                            ? "bg-background text-foreground text-small flex-1 rounded-md px-3 py-1.5 font-medium shadow-sm"
                            : "text-muted-foreground text-small flex-1 rounded-md px-3 py-1.5 font-medium"
                        }
                      >
                        {t(`period.${option}`)}
                      </button>
                    ))}
                  </div>
                )}

                {selectedPrice ? (
                  <p>
                    <span className="font-display text-h1">
                      {formatAmount(selectedPrice.amount, selectedPrice.currency)}
                    </span>
                    <span className="text-small text-muted-foreground">
                      {" "}
                      / {t(`period.${selectedPrice.period}`).toLowerCase()}
                    </span>
                  </p>
                ) : (
                  <p className="text-muted-foreground text-small">{t("periodUnavailable")}</p>
                )}

                {!hasMonthly && (
                  <p className="text-small text-muted-foreground">{t("annualOnlyNote")}</p>
                )}

                <ul className="flex flex-col gap-2">
                  {PLAN_FEATURES[planId].map((feature) => (
                    <li
                      key={feature}
                      className="text-small text-muted-foreground flex items-start gap-2"
                    >
                      <CheckIcon
                        className="text-primary mt-0.5 size-4 shrink-0"
                        aria-hidden="true"
                      />
                      {t(`features.${feature}`)}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="coupon">{t("couponLabel")}</Label>
                  <Input
                    id="coupon"
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value)}
                    placeholder={t("couponPlaceholder")}
                  />
                </div>

                {error && <p className="text-destructive text-small">{t(`errors.${error}`)}</p>}

                <p className="text-caption text-muted-foreground font-medium uppercase">
                  {t("automatedPaymentTitle")}
                </p>
                <Button
                  disabled={!selectedPrice}
                  loading={isPending}
                  onClick={handleSubscribe}
                  className="w-full"
                >
                  {t("subscribeCta")}
                </Button>
              </CardContent>
            </Card>

            {pendingForThisSelection && latestProof ? (
              <div className="border-warning/40 bg-warning/10 mt-4 rounded-lg border p-4 text-sm">
                <p className="font-medium">{t("proofStatus.pendingTitle")}</p>
                <p className="text-muted-foreground mt-1">
                  {t("proofStatus.pendingDescription", {
                    plan: t(`plans.${latestProof.planId}.name`),
                    period: t(`period.${latestProof.period}`).toLowerCase(),
                  })}
                </p>
              </div>
            ) : (
              <div className="mt-4">
                {rejectedForThisSelection && latestProof?.rejectionReason ? (
                  <div className="border-destructive/40 bg-destructive/10 mb-4 rounded-lg border p-4 text-sm">
                    <p className="font-medium">{t("proofStatus.rejectedTitle")}</p>
                    <p className="text-muted-foreground mt-1">
                      {t("proofStatus.rejectedDescription", {
                        reason: latestProof.rejectionReason,
                      })}
                    </p>
                  </div>
                ) : null}
                <ManualPaymentSection
                  planId={planId}
                  period={period}
                  onSubmitted={() =>
                    setLatestProof({ status: "pending", planId, period, rejectionReason: null })
                  }
                />
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
