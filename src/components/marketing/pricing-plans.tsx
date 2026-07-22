"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckIcon, RocketIcon, SparklesIcon, Building2Icon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "./scroll-reveal";
import { cn } from "@/lib/utils";

type PlanId = "solo" | "pro" | "label";
type Period = "monthly" | "annual";

const PLAN_IDS: PlanId[] = ["solo", "pro", "label"];
const PLAN_ICONS = { solo: RocketIcon, pro: SparklesIcon, label: Building2Icon } as const;
const PLAN_FEATURE_KEYS: Record<PlanId, readonly string[]> = {
  solo: ["unlimitedReleases", "allDsps", "hundredPercentRoyalties", "monthlyStats", "emailSupport"],
  pro: ["unlimitedReleases", "allDsps", "hundredPercentRoyalties", "monthlyStats", "emailSupport"],
  label: [
    "unlimitedReleases",
    "allDsps",
    "hundredPercentRoyalties",
    "monthlyStats",
    "multiArtist",
    "prioritySupport",
  ],
};

/**
 * Grille des 3 forfaits self-service (Solo/Pro/Label, ADR 0026 — Label n'est
 * plus sur devis). Toggle mensuel/annuel partagé entre les 3 cartes (motif
 * SaaS courant) ; le tarif Afrique reste affiché en note fixe sous chaque
 * carte (annuel uniquement, comme sur `/app/abonnement`) plutôt que dans un
 * second toggle — ADR 0010 : pas de tarif mensuel Afrique inventé.
 */
export function PricingPlans() {
  const t = useTranslations("Pricing");
  const [period, setPeriod] = useState<Period>("monthly");

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-muted mx-auto flex w-fit gap-1 rounded-lg p-1">
        {(["monthly", "annual"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setPeriod(option)}
            className={cn(
              "text-small rounded-md px-4 py-1.5 font-medium",
              period === option
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            {t(`period.${option}`)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLAN_IDS.map((planId, index) => {
          const Icon = PLAN_ICONS[planId];
          const isFeatured = planId === "pro";
          return (
            <ScrollReveal key={planId} delay={index * 0.08}>
              <Card className={cn("h-full", isFeatured && "ring-primary ring-2")}>
                <CardHeader>
                  <Icon className="text-primary mb-2 size-6" aria-hidden="true" />
                  <Badge variant="gold" className="mb-2 w-fit">
                    {t(`plans.${planId}.badge`)}
                  </Badge>
                  <CardTitle>{t(`plans.${planId}.name`)}</CardTitle>
                  <CardDescription>{t(`plans.${planId}.description`)}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <p>
                    <span className="font-display text-h1">
                      {t(
                        period === "monthly"
                          ? `plans.${planId}.monthlyPrice`
                          : `plans.${planId}.annualPrice`,
                      )}
                    </span>
                    <span className="text-small text-muted-foreground">
                      {period === "monthly" ? t("perMonth") : t("perYear")}
                    </span>
                  </p>
                  <p className="text-small text-muted-foreground">
                    {t("africaNote", { price: t(`plans.${planId}.africaAnnualPrice`) })}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {PLAN_FEATURE_KEYS[planId].map((feature) => (
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
                  <Button
                    variant={isFeatured ? "premium" : "outline"}
                    render={<Link href="/inscription" />}
                  >
                    {t(`plans.${planId}.cta`)}
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>
          );
        })}
      </div>

      <p className="text-caption text-muted-foreground text-center">{t("africaEligibilityNote")}</p>
    </div>
  );
}
