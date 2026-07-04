import { getTranslations, setRequestLocale } from "next-intl/server";
import { Rocket, ClipboardList, Palette, LineChart, Tent, Clapperboard } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { createSeoMetadata } from "@/lib/seo";

export const generateMetadata = createSeoMetadata("Seo.consulting");

const FEATURES = [
  { key: "launch" as const, icon: Rocket },
  { key: "career" as const, icon: ClipboardList },
  { key: "brand" as const, icon: Palette },
  { key: "analytics" as const, icon: LineChart },
  { key: "tours" as const, icon: Tent },
  { key: "production" as const, icon: Clapperboard },
];

export default async function ConsultingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Consulting");

  return (
    <>
      <PageHero
        tag={t("tag")}
        description={t("description")}
        renderTitle={(tags) => t.rich("title", tags)}
      />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <section className="mx-auto max-w-2xl px-4 pb-20 text-center sm:px-6">
        <p className="text-body text-muted-foreground">{t("closingText")}</p>
        <Button size="lg" className="mt-6" render={<Link href="/contact">{t("ctaButton")}</Link>} />
      </section>
    </>
  );
}
