import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudioForm } from "./studio-form";
import { createSeoMetadata } from "@/lib/seo";
import { StudioHero } from "@/components/marketing/studio-hero";
import { PhotoMasonry, type PhotoMasonryItem } from "@/components/marketing/photo-masonry";
import { ScrollSnapRow } from "@/components/marketing/scroll-snap-row";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

export const generateMetadata = createSeoMetadata("Seo.studio");

const PLAN_KEYS = ["recording", "mixMaster", "mobile"] as const;

const GALLERY_ITEMS: PhotoMasonryItem[] = [
  { src: "/studio/bush.avif", alt: "Bush en séance", caption: "Bush" },
  { src: "/studio/13-back.avif", alt: "Séance studio", caption: "13" },
  { src: "/studio/mafia-perso-1.avif", alt: "Mafia en studio", caption: "Mafia" },
  { src: "/studio/davtor.avif", alt: "Davtor en studio", caption: "Davtor" },
  { src: "/studio/sam-kaya.avif", alt: "Sam Kaya en studio", caption: "Sam Kaya" },
  { src: "/studio/mafia-perso-2.avif", alt: "Mafia en studio", caption: "Mafia" },
];

export default async function StudioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Studio");

  return (
    <>
      <StudioHero />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <ScrollReveal className="mx-auto mb-10 max-w-xl text-center">
          <p className="text-caption text-primary font-medium tracking-wide uppercase">
            {t("gallery.tag")}
          </p>
          <h2 className="text-h1 font-display mt-2">{t("gallery.title")}</h2>
        </ScrollReveal>
        <PhotoMasonry items={GALLERY_ITEMS} />
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <ScrollReveal className="mx-auto mb-10 max-w-xl text-center">
          <p className="text-caption text-primary font-medium tracking-wide uppercase">
            {t("pricingTag")}
          </p>
        </ScrollReveal>
        <ScrollSnapRow
          scrollPrevLabel={t("pricingScrollPrev")}
          scrollNextLabel={t("pricingScrollNext")}
        >
          {PLAN_KEYS.map((key) => {
            const items = t.raw(`plans.${key}.items`) as string[];
            const isFeatured = key === "mixMaster";
            return (
              <div
                key={key}
                data-scroll-item
                className="w-[280px] shrink-0 snap-start sm:w-[320px]"
              >
                <Card className={isFeatured ? "ring-primary h-full ring-2" : "h-full"}>
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
                    <Button
                      variant={isFeatured ? "premium" : "outline"}
                      render={<a href="#reservation">{t("reserveButton")}</a>}
                      nativeButton={false}
                    />
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </ScrollSnapRow>
      </section>

      <section id="reservation" className="mx-auto max-w-2xl px-4 pb-20 sm:px-6">
        <h2 className="text-h2 font-display mb-6">{t("formTitle")}</h2>
        <StudioForm />
      </section>
    </>
  );
}
