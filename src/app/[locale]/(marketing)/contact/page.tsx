import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "./contact-form";
import { createSeoMetadata } from "@/lib/seo";
import { ContactHero } from "@/components/marketing/contact-hero";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

export const generateMetadata = createSeoMetadata("Seo.contact");

/**
 * Page Contact (§11.1 du CDC) — refonte artistique (septième page du
 * plan), volontairement la plus sobre du site (`contact-hero.tsx`, halo
 * quasi imperceptible). La carte d'informations gagne une vraie photo en
 * en-tête (studio réel, déjà utilisée sur Distribution/À propos —
 * réemploi assumé plutôt que surcharger le site de nouvelles images) pour
 * ne plus être une simple boîte texte, sans jamais concurrencer le
 * formulaire qui reste l'élément principal.
 */
export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ContactPage");

  return (
    <>
      <ContactHero />

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <ContactForm />

        <ScrollReveal delay={0.1} className="h-fit">
          <div className="border-border bg-card overflow-hidden rounded-lg border">
            <div className="relative h-36 w-full">
              <Image
                src="/studio/13-a-la-prod.avif"
                alt=""
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
              <div className="from-noir-950/70 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
            </div>
            <div className="p-8">
              <h3 className="text-foreground mb-5 font-medium">{t("infoTitle")}</h3>
              <dl className="flex flex-col gap-4">
                <div>
                  <dt className="text-caption text-muted-foreground tracking-wide uppercase">
                    {t("infoEmail")}
                  </dt>
                  <dd className="mt-1">
                    <a href="mailto:contact.sterkterecords@gmail.com" className="text-primary">
                      contact.sterkterecords@gmail.com
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-caption text-muted-foreground tracking-wide uppercase">
                    {t("infoPhone")}
                  </dt>
                  <dd className="text-foreground mt-1">
                    <a href="tel:+243850510209">+243 850 510 209</a>
                  </dd>
                </div>
                <div>
                  <dt className="text-caption text-muted-foreground tracking-wide uppercase">
                    {t("infoAddress")}
                  </dt>
                  <dd className="text-foreground mt-1">Avenue Mama Yemo, Lubumbashi, RDC</dd>
                </div>
              </dl>
              <a
                href="https://linktr.ee/sterkterecords"
                target="_blank"
                rel="noreferrer"
                className="border-border text-small text-primary mt-6 block border-t pt-5 font-medium hover:underline"
              >
                {t("allSocialLinks")}
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
