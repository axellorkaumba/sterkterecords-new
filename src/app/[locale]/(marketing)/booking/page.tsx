import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookingForm } from "./booking-form";
import { createSeoMetadata } from "@/lib/seo";
import { BookingHero } from "@/components/marketing/booking-hero";
import { ScrollSnapRow } from "@/components/marketing/scroll-snap-row";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

export const generateMetadata = createSeoMetadata("Seo.booking");

const ARTISTS = [
  { name: "Chmarley", photo: "/booking/chmarley.avif" },
  { name: "DJ Daza", photo: "/booking/dj-daza.avif" },
  { name: "Dreazy Youzou", photo: "/booking/dreazy-youzou.avif" },
  { name: "King Dave", photo: "/booking/king-dave.avif" },
  { name: "Feyme", photo: "/booking/feyme.avif" },
];

/**
 * Page Booking (§11.7 du CDC) — refonte artistique (brief validé par Axel,
 * cadre : plan de refonte complète). Aucune photo de concert/scène réelle
 * ne figure dans `IMAGES/` : le Hero (`booking-hero.tsx`) réinterprète
 * honnêtement l'ambiance "spectacle" via composition (halos/faisceaux
 * lumineux + grain) plutôt que d'utiliser une photo de stock. Section
 * "Nos artistes" (carrousel, vraies photos) en aperçu léger du futur
 * chantier "Nos artistes" complet. `BookingForm` (onglets Artiste/Lieu)
 * conservé à l'identique fonctionnellement.
 */
export default async function BookingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Booking");

  return (
    <>
      <BookingHero />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <ScrollReveal className="mx-auto mb-10 max-w-xl text-center">
          <p className="text-caption text-primary font-medium tracking-wide uppercase">
            {t("artistsSection.tag")}
          </p>
          <h2 className="text-h1 font-display mt-2">{t("artistsSection.title")}</h2>
        </ScrollReveal>
        <ScrollSnapRow
          scrollPrevLabel={t("artistsScrollPrev")}
          scrollNextLabel={t("artistsScrollNext")}
        >
          {ARTISTS.map((artist) => (
            <div
              key={artist.name}
              data-scroll-item
              className="group w-40 shrink-0 snap-start text-center sm:w-48"
            >
              <div className="shadow-card group-hover:shadow-elevated relative aspect-square overflow-hidden rounded-xl transition-[box-shadow,transform] duration-300 group-hover:-translate-y-1">
                <Image
                  src={artist.photo}
                  alt={artist.name}
                  fill
                  sizes="192px"
                  className="object-cover"
                />
              </div>
              <p className="text-small mt-2 font-medium">{artist.name}</p>
            </div>
          ))}
        </ScrollSnapRow>
      </section>

      <section id="reservation" className="mx-auto max-w-2xl px-4 pb-20 sm:px-6">
        <h2 className="text-h2 font-display mb-6">{t("formTitle")}</h2>
        <BookingForm />
      </section>
    </>
  );
}
