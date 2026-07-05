"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CheckIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { createSubscriptionCheckoutAction } from "./actions";

interface PlanPrice {
  period: "monthly" | "annual";
  currency: string;
  amount: number;
}

interface SubscriptionPickerProps {
  prices: PlanPrice[];
  currentPlanId: string | null;
  currentPeriod: string | null;
  justSucceeded: boolean;
  justCanceled: boolean;
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
}

export function SubscriptionPicker({
  prices,
  currentPlanId,
  currentPeriod,
  justSucceeded,
  justCanceled,
}: SubscriptionPickerProps) {
  const t = useTranslations("SubscriptionPage");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");

  const hasMonthly = prices.some((p) => p.period === "monthly");
  const [period, setPeriod] = useState<"monthly" | "annual">(hasMonthly ? "monthly" : "annual");

  const selectedPrice = useMemo(() => prices.find((p) => p.period === period), [prices, period]);

  function handleSubscribe() {
    setError(null);
    startTransition(async () => {
      const result = await createSubscriptionCheckoutAction(period, couponCode || undefined);
      if (result?.error) setError(result.error);
    });
  }

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
          {t("alreadyActive", { period: currentPeriod ? t(`period.${currentPeriod}`) : "" })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="ring-primary ring-2">
          <CardHeader>
            <Badge variant="gold" className="mb-2 w-fit">
              {t("solo.badge")}
            </Badge>
            <CardTitle>{t("solo.name")}</CardTitle>
            <CardDescription>{t("solo.description")}</CardDescription>
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
              {(
                ["unlimitedReleases", "allDsps", "hundredPercentRoyalties", "monthlyStats"] as const
              ).map((feature) => (
                <li
                  key={feature}
                  className="text-small text-muted-foreground flex items-start gap-2"
                >
                  <CheckIcon className="text-primary mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {t(`solo.features.${feature}`)}
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

        <Card>
          <CardHeader>
            <CardTitle>{t("label.name")}</CardTitle>
            <CardDescription>{t("label.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-small text-muted-foreground">{t("label.pricingNote")}</p>
            <Button variant="outline" render={<Link href="/contact" />} className="w-full">
              {t("label.cta")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
