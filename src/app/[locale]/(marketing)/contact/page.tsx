import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/marketing/page-hero";
import { ContactForm } from "./contact-form";
import { createSeoMetadata } from "@/lib/seo";

export const generateMetadata = createSeoMetadata("Seo.contact");

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ContactPage");

  return (
    <>
      <PageHero
        tag={t("tag")}
        description={t("description")}
        renderTitle={(tags) => t.rich("title", tags)}
      />

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <ContactForm />

        <div className="border-border bg-card h-fit rounded-lg border p-8">
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
      </section>
    </>
  );
}
