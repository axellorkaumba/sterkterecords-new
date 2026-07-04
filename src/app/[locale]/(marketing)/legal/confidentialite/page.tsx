import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/marketing/page-hero";
import { LegalDocumentView } from "@/components/marketing/legal-document-view";
import { legalPrivacy } from "@/content/legal-privacy";
import { createSeoMetadata } from "@/lib/seo";

export const generateMetadata = createSeoMetadata("Seo.legalPrivacy");

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Legal.privacy");
  const content = legalPrivacy[locale === "en" ? "en" : "fr"];

  return (
    <>
      <PageHero tag={t("tag")} description={t("lastUpdated")} renderTitle={() => t("title")} />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <LegalDocumentView document={content} />
      </section>
    </>
  );
}
