import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckIcon } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { createSeoMetadata } from "@/lib/seo";

export const generateMetadata = createSeoMetadata("Seo.pricing");

const SOLO_FEATURE_KEYS = [
  "unlimitedReleases",
  "allDsps",
  "hundredPercentRoyalties",
  "monthlyStats",
  "emailSupport",
] as const;

/**
 * Page Tarifs (§5.2, §11.1) — modèle SOLO / AFRIQUE / LABEL validé par Axel
 * (voir docs/adr/0010-abonnement-paiements.md), en remplacement du modèle à
 * paliers avec partage de revenus du Sprint 2 (incohérence documentée dans
 * ADR 0006, tranchée ici).
 *
 * Prix affichés en texte statique (i18n), pas lus depuis `plan_prices` :
 * une page marketing publique est prérendue statiquement (SSG, §18 —
 * performance/SEO), ce qui est incompatible avec un appel Supabase pendant
 * le build (et reste un couplage à éviter même avec un projet réel, cf.
 * l'incident constaté en vérification finale). Même précédent que les
 * tarifs Studio (Sprint 2, prix en dur dans Studio.plans). Le moteur de
 * tarification DB-driven reste la source de vérité pour la transaction
 * réelle : `/app/abonnement` (page privée, rendue à la demande) résout le
 * prix exact depuis `plan_prices`/`pricing_regions`. Si un prix change via
 * le futur back-office, cette page nécessite une mise à jour de contenu
 * (ou une revalidation ISR) — compromis assumé, documenté dans ADR 0010.
 */
export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pricing");

  const features = SOLO_FEATURE_KEYS.map((key) => t(`solo.features.${key}`));

  return (
    <>
      <PageHero tag={t("tag")} description={t("description")} renderTitle={() => t("title")} />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="ring-primary ring-2">
            <CardHeader>
              <Badge variant="gold" className="mb-2 w-fit">
                {t("solo.badge")}
              </Badge>
              <CardTitle>{t("solo.name")}</CardTitle>
              <CardDescription>{t("solo.description")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p>
                <span className="font-display text-h1">{t("solo.monthlyPrice")}</span>
                <span className="text-small text-muted-foreground">{t("perMonth")}</span>
              </p>
              <p className="text-small text-muted-foreground">
                {t("orAnnual", { price: t("solo.annualPrice") })}
              </p>
              <ul className="flex flex-col gap-2">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="text-small text-muted-foreground flex items-start gap-2"
                  >
                    <CheckIcon className="text-primary mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button render={<Link href="/inscription" />}>{t("solo.cta")}</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("africa.name")}</CardTitle>
              <CardDescription>{t("africa.description")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p>
                <span className="font-display text-h1">{t("africa.annualPrice")}</span>
                <span className="text-small text-muted-foreground">{t("perYear")}</span>
              </p>
              <p className="text-small text-muted-foreground">{t("africa.eligibilityNote")}</p>
              <ul className="flex flex-col gap-2">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="text-small text-muted-foreground flex items-start gap-2"
                  >
                    <CheckIcon className="text-primary mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant="outline" render={<Link href="/inscription" />}>
                {t("africa.cta")}
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
              <ul className="flex flex-col gap-2">
                {(t.raw("label.features") as string[]).map((feature) => (
                  <li
                    key={feature}
                    className="text-small text-muted-foreground flex items-start gap-2"
                  >
                    <CheckIcon className="text-primary mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant="outline" render={<Link href="/contact" />}>
                {t("label.cta")}
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-small text-muted-foreground mt-8 text-center">{t("royaltiesNote")}</p>
      </section>
    </>
  );
}
