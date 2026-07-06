import { getTranslations, setRequestLocale } from "next-intl/server";
import { BarChart3Icon, CoinsIcon, Globe2Icon, ZapIcon } from "lucide-react";
import { createSeoMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { DistributionHero } from "@/components/marketing/distribution-hero";
import { ReleasePipeline } from "@/components/marketing/release-pipeline";
import { StatStrip, type StatStripItem } from "@/components/marketing/stat-strip";
import { FullBleedImage } from "@/components/marketing/full-bleed-image";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

export const generateMetadata = createSeoMetadata("Seo.distribution");

/**
 * Page Distribution (§11.1 du CDC) — refonte artistique (brief validé par
 * Axel, cadre : plan de refonte complète). Remplace la liste numérotée +
 * grille d'icônes générique par une expérience visuelle : collage de
 * vraies pochettes + statistiques flottantes dans le Hero
 * (`distribution-hero.tsx`), parcours interactif d'une sortie
 * (`release-pipeline.tsx`, moment "wow" signature de cette page), bande de
 * preuve chiffrée (`stat-strip.tsx`), grande photo réelle plein cadre
 * (`full-bleed-image.tsx`) reliant la distribution à un artiste réel, puis
 * CTA. Rythme volontairement non répétitif (jamais deux sections du même
 * type à la suite).
 */
export default async function DistributionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Distribution");

  const proofStats: StatStripItem[] = [
    { icon: Globe2Icon, value: 150, display: "150+", label: t("proof.platforms") },
    { icon: ZapIcon, value: 48, display: "48h", label: t("proof.speed") },
    { icon: CoinsIcon, value: 100, display: "100%", label: t("proof.royalties") },
    { icon: BarChart3Icon, value: 1_000_000, display: "1M+", label: t("proof.streams") },
  ];

  return (
    <>
      <DistributionHero platformsValue={150} platformsDisplay="150+" deliverySpeed="48h" />

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <ScrollReveal className="mx-auto mb-10 max-w-xl text-center">
          <p className="text-caption text-primary font-medium tracking-wide uppercase">
            {t("pipeline.tag")}
          </p>
          <h2 className="text-h1 font-display mt-2">{t("pipeline.title")}</h2>
        </ScrollReveal>
        <ReleasePipeline />
      </section>

      <StatStrip items={proofStats} />

      <section className="py-16">
        <FullBleedImage
          src="/studio/13-a-la-prod.avif"
          alt={t("storySection.imageAlt")}
          caption={t("storySection.caption")}
        />
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20 text-center sm:px-6">
        <ScrollReveal>
          <h2 className="text-h1 font-display">{t("ctaFinalTitle")}</h2>
          <p className="text-body text-muted-foreground mt-3">{t("ctaFinalDescription")}</p>
          <div className="mt-6">
            <Button
              variant="premium"
              size="lg"
              render={<Link href="/inscription">{t("ctaLoggedOut")}</Link>}
              nativeButton={false}
            />
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
