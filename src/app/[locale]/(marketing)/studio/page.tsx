import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckIcon } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudioForm } from "./studio-form";
import { createSeoMetadata } from "@/lib/seo";

export const generateMetadata = createSeoMetadata("Seo.studio");

const PLAN_KEYS = ["recording", "mixMaster", "mobile"] as const;

export default async function StudioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Studio");

  return (
    <>
      <PageHero
        tag={t("tag")}
        description={t("description")}
        renderTitle={(tags) => t.rich("title", tags)}
      />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PLAN_KEYS.map((key) => {
            const items = t.raw(`plans.${key}.items`) as string[];
            const isFeatured = key === "mixMaster";
            return (
              <Card key={key} className={isFeatured ? "ring-primary ring-2" : undefined}>
                <CardHeader>
                  <CardTitle>{t(`plans.${key}.title`)}</CardTitle>
                  <p className="mt-2">
                    <span className="font-display text-h1">{t(`plans.${key}.price`)}</span>
                    <span className="text-small text-muted-foreground">
                      {t(`plans.${key}.unit`)}
                    </span>
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <ul className="flex flex-col gap-2">
                    {items.map((item) => (
                      <li
                        key={item}
                        className="text-small text-muted-foreground flex items-start gap-2"
                      >
                        <CheckIcon
                          className="text-primary mt-0.5 size-4 shrink-0"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button variant={isFeatured ? "default" : "outline"}>{t("reserveButton")}</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 pb-20 sm:px-6">
        <h2 className="text-h2 font-display mb-6">{t("formTitle")}</h2>
        <StudioForm />
      </section>
    </>
  );
}
