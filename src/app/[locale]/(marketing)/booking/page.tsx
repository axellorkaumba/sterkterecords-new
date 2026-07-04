import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/marketing/page-hero";
import { BookingForm } from "./booking-form";
import { createSeoMetadata } from "@/lib/seo";

export const generateMetadata = createSeoMetadata("Seo.booking");

export default async function BookingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Booking");

  return (
    <>
      <PageHero
        tag={t("tag")}
        description={t("description")}
        renderTitle={(tags) => t.rich("title", tags)}
      />
      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <BookingForm />
      </section>
    </>
  );
}
