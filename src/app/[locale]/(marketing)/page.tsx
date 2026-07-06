import { getTranslations, setRequestLocale } from "next-intl/server";
import { Radio, Mic2, CalendarDays, Users2, TrendingUp, LayoutDashboard } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { AmbientBackground } from "@/components/marketing/ambient-background";
import { HeroVisual } from "@/components/marketing/hero-visual";
import { AnimatedCounter } from "@/components/marketing/animated-counter";
import { PlatformMarquee } from "@/components/marketing/platform-marquee";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { CatalogueShowcase } from "@/components/marketing/catalogue-showcase";
import { AmbientSection } from "@/components/marketing/ambient-section";

const STATS = [
  { key: "platforms" as const, value: 150, display: "150+" },
  { key: "artists" as const, value: 50, display: "50+" },
  { key: "streams" as const, value: 1_000_000, display: "1M+" },
  { key: "countries" as const, value: 15, display: "15+" },
];

const SERVICES = [
  { key: "distribution" as const, href: "/distribution" as const, icon: Radio },
  { key: "studio" as const, href: "/studio" as const, icon: Mic2 },
  { key: "booking" as const, href: "/booking" as const, icon: CalendarDays },
  { key: "featuring" as const, href: "/featuring" as const, icon: Users2 },
  { key: "consulting" as const, href: "/consulting" as const, icon: TrendingUp },
  { key: "artistSpace" as const, href: "/inscription" as const, icon: LayoutDashboard },
];

/** Rendu des balises <gold>/<red> des titres riches (§9.1 : couleurs de statut/accent). */
const richTags = {
  gold: (chunks: React.ReactNode) => <span className="text-or-400">{chunks}</span>,
  red: (chunks: React.ReactNode) => <span className="text-primary">{chunks}</span>,
};

/**
 * Page d'accueil (§11.1 du CDC). Contenu réel repris du site existant (voir
 * docs/adr/0006-content-sourcing.md) : hero, plateformes, 6 services, CTA
 * final — structure et copie inchangées. Direction artistique retravaillée
 * (demande Axel, redesign Home) : fond vivant, composition "Music Ecosystem"
 * dans le Hero (vraies pochettes du catalogue, cf. `cover-composition.tsx`),
 * section "Notre catalogue" (vraies sorties, `catalogue-showcase.tsx`),
 * compteurs progressifs, logos de plateformes réels en défilement, reveal
 * au scroll. Le roster ("Nos artistes") n'est toujours pas repris : prévu
 * dans un chantier dédié (cf. plan de refonte complète), pas cette page.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  return (
    <>
      <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28">
        <AmbientBackground />
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="flex max-w-3xl flex-col items-start gap-6">
            <span className="border-border text-caption text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1">
              <span className="bg-or-400 size-1.5 animate-pulse rounded-full" />
              {t("badge")}
            </span>
            <h1 className="text-display font-display">{t.rich("heroTitle", richTags)}</h1>
            <p className="text-body-lg text-muted-foreground">{t("heroSubtitle")}</p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="premium"
                size="lg"
                render={<Link href="/inscription">{t("ctaPrimary")}</Link>}
                nativeButton={false}
              />
              <Button
                size="lg"
                variant="outline"
                render={<Link href="/distribution">{t("ctaSecondary")}</Link>}
                nativeButton={false}
              />
            </div>
            <div className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
              {STATS.map((stat) => (
                <div key={stat.key}>
                  <div className="font-display text-h2 text-foreground">
                    <AnimatedCounter value={stat.value} display={stat.display} />
                  </div>
                  <div className="text-small text-muted-foreground">{t(`stats.${stat.key}`)}</div>
                </div>
              ))}
            </div>
          </div>

          <HeroVisual />
        </div>
      </section>

      <PlatformMarquee ariaLabel={t("platformsAriaLabel")} />

      <CatalogueShowcase />

      <AmbientSection tint="or">
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <ScrollReveal className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-caption text-primary font-medium tracking-wide uppercase">
              {t("servicesTag")}
            </p>
            <h2 className="text-h1 font-display mt-2">{t("servicesTitle")}</h2>
            <p className="text-body text-muted-foreground mt-3">{t("servicesDescription")}</p>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(({ key, href, icon: Icon }, index) => (
              <ScrollReveal key={key} delay={index * 0.08}>
                <Link href={href}>
                  <Card className="hover:border-primary/40 hover:shadow-elevated hover:bg-muted/50 h-full transition-[background-color,border-color,box-shadow,transform] hover:-translate-y-1">
                    <CardContent className="flex flex-col gap-3">
                      <Icon className="text-primary size-6" aria-hidden="true" />
                      <CardTitle>{t(`services.${key}.title`)}</CardTitle>
                      <p className="text-small text-muted-foreground">
                        {t(`services.${key}.description`)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <ScrollReveal>
            <p className="text-caption text-primary font-medium tracking-wide uppercase">
              {t("ctaFinalTag")}
            </p>
            <h2 className="text-h1 font-display mt-2">{t.rich("ctaFinalTitle", richTags)}</h2>
            <p className="text-body text-muted-foreground mt-4">{t("ctaFinalDescription")}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                variant="gold"
                size="lg"
                render={<Link href="/inscription">{t("ctaFinalPrimary")}</Link>}
                nativeButton={false}
              />
              <Button
                variant="outline"
                size="lg"
                render={<Link href="/contact">{t("ctaFinalSecondary")}</Link>}
                nativeButton={false}
              />
            </div>
          </ScrollReveal>
        </section>
      </AmbientSection>
    </>
  );
}
