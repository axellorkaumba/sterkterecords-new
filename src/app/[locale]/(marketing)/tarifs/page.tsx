import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckIcon } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { createSeoMetadata } from "@/lib/seo";

export const generateMetadata = createSeoMetadata("Seo.pricing");

const PLAN_KEYS = ["free", "artist", "pro", "label"] as const;
const FEATURED_PLAN = "artist";

/**
 * Page Tarifs — modèle à paliers avec partage de revenus (CGU Art. 5.2,
 * 8), retenu comme référence pour ce sprint (voir docs/adr/0006, §"Conflit
 * de modèle de tarification" : à confirmer avec Axel face au §5 du CDC qui
 * décrit un modèle forfaitaire à 100 % de royalties conservées).
 */
export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pricing");

  return (
    <>
      <PageHero tag={t("tag")} description={t("description")} renderTitle={() => t("title")} />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLAN_KEYS.map((key) => {
            const isFeatured = key === FEATURED_PLAN;
            const features = t.raw(`plans.${key}.features`) as string[];
            return (
              <Card key={key} className={isFeatured ? "ring-primary ring-2" : undefined}>
                <CardHeader>
                  {isFeatured && (
                    <Badge variant="gold" className="mb-2 w-fit">
                      {t("mostPopular")}
                    </Badge>
                  )}
                  <CardTitle>{t(`plans.${key}.name`)}</CardTitle>
                  <p>
                    <span className="font-display text-h1">{t(`plans.${key}.price`)}</span>
                    <span className="text-small text-muted-foreground">{t("period")}</span>
                  </p>
                  <p className="text-small text-primary font-medium">{t(`plans.${key}.split`)}</p>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <ul className="flex flex-col gap-2">
                    {features.map((feature) => (
                      <li
                        key={feature}
                        className="text-small text-muted-foreground flex items-start gap-2"
                      >
                        <CheckIcon
                          className="text-primary mt-0.5 size-4 shrink-0"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={isFeatured ? "default" : "outline"}
                    render={<Link href="/inscription" />}
                  >
                    {key === "free" ? t("ctaFree") : t("ctaPaid")}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-small text-muted-foreground mt-8 text-center">{t("feesNote")}</p>
      </section>
    </>
  );
}
