import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/marketing/page-hero";
import { FeaturingForm } from "./featuring-form";
import { createSeoMetadata } from "@/lib/seo";

export const generateMetadata = createSeoMetadata("Seo.featuring");

const STEP_KEYS = ["step1", "step2", "step3"] as const;

export default async function FeaturingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Featuring");

  return (
    <>
      <PageHero
        tag={t("tag")}
        description={t("description")}
        renderTitle={(tags) => t.rich("title", tags)}
      />

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <ol className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STEP_KEYS.map((key, index) => (
            <li key={key} className="border-border rounded-lg border p-5">
              <span className="bg-primary/10 font-display text-primary flex size-8 items-center justify-center rounded-full font-semibold">
                {index + 1}
              </span>
              <h3 className="text-foreground mt-3 font-medium">{t(`steps.${key}.title`)}</h3>
              <p className="text-small text-muted-foreground mt-1">
                {t(`steps.${key}.description`)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-2xl px-4 pb-20 sm:px-6">
        <h2 className="text-h2 font-display mb-6">{t("formTitle")}</h2>
        <FeaturingForm />
      </section>
    </>
  );
}
