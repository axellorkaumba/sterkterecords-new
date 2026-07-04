import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/marketing/page-hero";
import { LegalDocumentView } from "@/components/marketing/legal-document-view";
import { legalCgu } from "@/content/legal-cgu";
import { createSeoMetadata } from "@/lib/seo";

export const generateMetadata = createSeoMetadata("Seo.legalCgu");

/**
 * CGU disponibles en FR/EN uniquement (pas de lingala) — voir
 * docs/adr/0006-content-sourcing.md : un document juridique demande une
 * traduction fidèle et validée, pas un brouillon marketing.
 */
export default async function CguPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Legal.cgu");
  const content = legalCgu[locale === "en" ? "en" : "fr"];

  return (
    <>
      <PageHero tag={t("tag")} description={t("lastUpdated")} renderTitle={() => t("title")} />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <LegalDocumentView document={content} />
      </section>
    </>
  );
}
