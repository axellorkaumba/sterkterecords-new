import { getTranslations, setRequestLocale } from "next-intl/server";
import { createSeoMetadata } from "@/lib/seo";
import { PricingHero } from "@/components/marketing/pricing-hero";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const generateMetadata = createSeoMetadata("Seo.pricing");

const FAQ_KEYS = ["change", "africaEligibility", "labelPlan", "cancel"] as const;

/**
 * Page Tarifs (§5.2, §11.1) — 3 forfaits self-service Solo/Pro/Label
 * (ADR 0026 : Label n'est plus "sur devis", plafonné à 5 artistes) — voir
 * `PricingPlans` pour la grille elle-même. Reste la page la plus sobre du
 * site (clarté du prix > effet, cf. `pricing-hero.tsx`).
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
 * (ou une revalidation ISR) — compromis assumé, documenté dans ADR 0010,
 * qui explique aussi pourquoi cette page avait pris du retard sur le
 * modèle réel (voir docs/adr/0028-refonte-page-tarifs.md).
 */
export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pricing");

  return (
    <>
      <PricingHero />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <PricingPlans />
        <p className="text-small text-muted-foreground mt-8 text-center">{t("royaltiesNote")}</p>
      </section>

      <section className="mx-auto max-w-2xl px-4 pb-20 sm:px-6">
        <ScrollReveal className="mb-8 text-center">
          <h2 className="text-h2 font-display">{t("faq.title")}</h2>
        </ScrollReveal>
        <Accordion>
          {FAQ_KEYS.map((key) => (
            <AccordionItem key={key} value={key}>
              <AccordionTrigger className="text-left">
                {t(`faq.items.${key}.question`)}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {t(`faq.items.${key}.answer`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}
