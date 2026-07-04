import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/marketing/page-hero";
import { LegalDocumentView } from "@/components/marketing/legal-document-view";
import { legalNotice } from "@/content/legal-notice";
import { createSeoMetadata } from "@/lib/seo";

export const generateMetadata = createSeoMetadata("Seo.legalNotice");

export default async function LegalNoticePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Legal.notice");
  const content = legalNotice[locale === "en" ? "en" : "fr"];

  return (
    <>
      <PageHero tag={t("tag")} description={t("lastUpdated")} renderTitle={() => t("title")} />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <LegalDocumentView document={content} />
      </section>
    </>
  );
}
