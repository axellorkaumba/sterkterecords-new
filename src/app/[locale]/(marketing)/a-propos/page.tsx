import { getTranslations, setRequestLocale } from "next-intl/server";
import { GemIcon, AwardIcon, Globe2Icon, RocketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { createSeoMetadata } from "@/lib/seo";
import { AboutHero } from "@/components/marketing/about-hero";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { PartnerGrid } from "@/components/marketing/partner-grid";
import { AmbientSection } from "@/components/marketing/ambient-section";
import { StatStrip, type StatStripItem } from "@/components/marketing/stat-strip";
import { Timeline } from "@/components/marketing/timeline";

export const generateMetadata = createSeoMetadata("Seo.about");

const TEAM_KEYS = ["axel", "abigail", "diademe"] as const;
const VALUE_KEYS = ["integrity", "excellence", "openness", "innovation"] as const;
const VALUE_ICONS = {
  integrity: GemIcon,
  excellence: AwardIcon,
  openness: Globe2Icon,
  innovation: RocketIcon,
};
const HISTORY_YEARS = ["2021", "2022", "2023", "2024", "2025"] as const;
const INTRO_PARAGRAPH_COUNT = 3;

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Page À propos (§11.1 du CDC) — troisième passe. Axel a partagé des
 * captures d'écran d'une version de référence du site (le lien fourni
 * précédemment n'était pas accessible par fetch — page cliente sans
 * rendu serveur) : structure et contenu repris fidèlement plutôt que
 * réinterprétés à l'aveugle. Changements notables par rapport à la
 * version précédente de cette page :
 * - Vision/Mission repassent en texte côte à côte (pas d'`ImageTextRow`
 *   sur cette page) — la référence est volontairement dense en texte ici,
 *   le rythme visuel vient des chiffres/valeurs/timeline plutôt que de
 *   photos, contrairement au principe général "plus d'images" appliqué
 *   ailleurs sur le site.
 * - Année de fondation corrigée : 2020 → 2021 (la référence est explicite
 *   et cohérente en plusieurs endroits — stat "Année de création" et
 *   premier jalon de la timeline).
 * - Nouvelle timeline "Notre histoire" (2021-2025) : contenu réel fourni
 *   par Axel via la référence (artistes signés, jalons de streams,
 *   expansion géographique, partenariats) — transcrit tel quel, aucun
 *   fait inventé.
 * - Nouvelle grille "Nos valeurs fondamentales" (Intégrité/Excellence/
 *   Ouverture/Innovation).
 * - Avatars d'équipe en dégradé cerise→or (au lieu des anneaux colorés
 *   précédents) — toujours des initiales, `IMAGES/` ne contenant aucune
 *   vraie photo de ces 3 personnes.
 * - Bande statistique (`StatStrip`, déjà utilisé sur Distribution)
 *   réutilisée telle quelle pour Année de création/Plateformes/Streams/Pays.
 */
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");

  const introParagraphs = Array.from({ length: INTRO_PARAGRAPH_COUNT }, (_, i) =>
    t(`introParagraphs.${i}`),
  );
  const visionParagraphs = t.raw("visionParagraphs") as string[];
  const missionParagraphs = t.raw("missionParagraphs") as string[];

  const stats: StatStripItem[] = [
    { icon: GemIcon, value: 2021, display: "2021", label: t("stats.founded") },
    { icon: Globe2Icon, value: 150, display: "150+", label: t("stats.platforms") },
    { icon: RocketIcon, value: 1_000_000, display: "1M+", label: t("stats.streams") },
    { icon: AwardIcon, value: 30, display: "+30", label: t("stats.countries") },
  ];

  const historyEntries = HISTORY_YEARS.map((year) => ({
    year,
    title: t(`history.${year}.title`),
    description: t(`history.${year}.description`),
  }));

  return (
    <>
      <AboutHero />

      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <ScrollReveal className="flex flex-col gap-5">
          {introParagraphs.map((paragraph, index) => (
            <p key={index} className="text-body text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </ScrollReveal>
      </section>

      <StatStrip items={stats} />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
          <ScrollReveal>
            <p className="text-caption text-or-400 font-medium tracking-wide uppercase">
              {t("visionLabel")}
            </p>
            <div className="mt-3 flex flex-col gap-4">
              {visionParagraphs.map((paragraph, index) => (
                <p key={index} className="text-body text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-caption text-or-400 font-medium tracking-wide uppercase">
              {t("missionLabel")}
            </p>
            <div className="mt-3 flex flex-col gap-4">
              {missionParagraphs.map((paragraph, index) => (
                <p key={index} className="text-body text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <AmbientSection tint="or">
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <ScrollReveal className="mb-10 text-center">
            <h2 className="text-h1 font-display">{t("values.title")}</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_KEYS.map((key, index) => {
              const Icon = VALUE_ICONS[key];
              return (
                <ScrollReveal key={key} delay={index * 0.06}>
                  <div className="border-border bg-card relative h-full overflow-hidden rounded-lg border p-6">
                    <div className="bg-or-400 absolute inset-x-0 top-0 h-1" />
                    <div className="bg-noir-900 mb-4 flex size-12 items-center justify-center rounded-lg">
                      <Icon className="text-or-400 size-5" aria-hidden="true" />
                    </div>
                    <h3 className="font-medium">{t(`values.items.${key}.title`)}</h3>
                    <p className="text-small text-muted-foreground mt-2">
                      {t(`values.items.${key}.description`)}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <ScrollReveal className="mb-10">
            <p className="text-caption text-or-400 font-medium tracking-wide uppercase">
              {t("history.tag")}
            </p>
          </ScrollReveal>
          <Timeline entries={historyEntries} />
        </section>
      </AmbientSection>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <ScrollReveal className="mb-2 text-center">
          <h2 className="text-caption text-or-400 font-medium tracking-wide uppercase">
            {t("teamLabel")}
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.05} className="mb-10 text-center">
          <p className="text-body text-muted-foreground">{t("teamSubtitle")}</p>
        </ScrollReveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {TEAM_KEYS.map((key, index) => {
            const name = t(`team.${key}.name`);
            return (
              <ScrollReveal key={key} delay={index * 0.08}>
                <div className="border-border flex h-full flex-col items-center gap-3 rounded-lg border p-6 text-center">
                  <div className="from-cerise-500 to-or-400 font-display text-h3 flex size-20 items-center justify-center rounded-full bg-gradient-to-br text-white">
                    {initialsOf(name)}
                  </div>
                  <div>
                    <p className="text-foreground font-medium">{name}</p>
                    <p className="text-small text-or-400 font-medium uppercase">
                      {t(`team.${key}.role`)}
                    </p>
                  </div>
                  <p className="text-small text-muted-foreground">{t(`team.${key}.description`)}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      <PartnerGrid tag={t("partners.tag")} title={t("partners.title")} />

      <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <ScrollReveal>
          <h2 className="text-h1 font-display">{t("cta.title")}</h2>
          <p className="text-body text-muted-foreground mt-4">{t("cta.description")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              variant="premium"
              size="lg"
              render={<Link href="/inscription">{t("cta.primary")}</Link>}
              nativeButton={false}
            />
            <Button
              variant="outline"
              size="lg"
              render={<Link href="/contact">{t("cta.secondary")}</Link>}
              nativeButton={false}
            />
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
