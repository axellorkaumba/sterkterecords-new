import { getTranslations, setRequestLocale } from "next-intl/server";
import { BarChart3, Coins, Globe2, Zap } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { createSeoMetadata } from "@/lib/seo";

export const generateMetadata = createSeoMetadata("Seo.distribution");

const STEP_KEYS = ["step1", "step2", "step3", "step4"] as const;
const FEATURES = [
  { key: "reports" as const, icon: BarChart3 },
  { key: "royalties" as const, icon: Coins },
  { key: "platforms" as const, icon: Globe2 },
  { key: "speed" as const, icon: Zap },
];

export default async function DistributionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Distribution");

  return (
    <>
      <PageHero
        tag={t("tag")}
        description={t("description")}
        renderTitle={(tags) => t.rich("title", tags)}
      />

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <ol className="flex flex-col gap-8">
          {STEP_KEYS.map((key, index) => (
            <li key={key} className="flex gap-4">
              <span className="bg-primary/10 font-display text-body text-primary flex size-9 shrink-0 items-center justify-center rounded-full font-semibold">
                {index + 1}
              </span>
              <div>
                <h3 className="text-h3 font-display">{t(`steps.${key}.title`)}</h3>
                <p className="text-small text-muted-foreground mt-1">
                  {t(`steps.${key}.description`)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ key, icon: Icon }) => (
            <div key={key} className="border-border rounded-lg border p-5">
              <Icon className="text-primary size-5" aria-hidden="true" />
              <h3 className="text-foreground mt-3 font-medium">{t(`features.${key}.title`)}</h3>
              <p className="text-small text-muted-foreground mt-1">
                {t(`features.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <Button
          size="lg"
          variant="gold"
          render={<Link href="/inscription">{t("ctaLoggedOut")}</Link>}
        />
      </section>
    </>
  );
}
