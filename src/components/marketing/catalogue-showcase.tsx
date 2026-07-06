"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { catalogueReleases } from "@/content/catalogue";
import { ScrollReveal } from "./scroll-reveal";

/**
 * Section "Notre catalogue" (§ demande Axel : prouver dès l'arrivée sur le
 * site que Sterkte Records distribue déjà de vraies sorties). Carrousel
 * horizontal en CSS scroll-snap natif — pas de librairie de carrousel :
 * coût JS quasi nul, swipe tactile natif, comportement clavier natif
 * (focus + flèches du navigateur sur les boutons). Les flèches ne sont
 * qu'un raccourci desktop au-dessus du scroll natif, jamais la seule façon
 * de naviguer.
 */
export function CatalogueShowcase() {
  const t = useTranslations("Home.catalogue");
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByCards = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>("[data-catalogue-card]")?.offsetWidth ?? 224;
    el.scrollBy({ left: direction * (cardWidth + 16) * 2, behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <ScrollReveal className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-2 text-center">
        <p className="text-caption text-primary font-medium tracking-wide uppercase">{t("tag")}</p>
        <h2 className="text-h1 font-display">{t("title")}</h2>
        <p className="text-body text-muted-foreground">{t("description")}</p>
      </ScrollReveal>

      <div className="relative">
        <div className="pointer-events-none absolute top-[40%] right-0 left-0 z-10 hidden -translate-y-1/2 justify-between sm:flex">
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            aria-label={t("scrollPrev")}
            className="border-border bg-background/90 shadow-card pointer-events-auto -ml-4 flex size-9 items-center justify-center rounded-full border backdrop-blur transition hover:scale-105"
          >
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            aria-label={t("scrollNext")}
            className="border-border bg-background/90 shadow-card pointer-events-auto -mr-4 flex size-9 items-center justify-center rounded-full border backdrop-blur transition hover:scale-105"
          >
            <ChevronRightIcon className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto scroll-smooth pb-4 [&::-webkit-scrollbar]:hidden"
        >
          {catalogueReleases.map((release) => (
            <div key={release.slug} data-catalogue-card className="group w-56 shrink-0 snap-start">
              <div className="shadow-card group-hover:shadow-elevated relative aspect-square overflow-hidden rounded-xl transition-[box-shadow,transform] duration-300 group-hover:-translate-y-1 group-hover:scale-[1.02]">
                <Image
                  src={release.coverSrc}
                  alt={`${release.artist} — ${release.title}`}
                  fill
                  sizes="224px"
                  className="object-cover"
                />
                {release.isCompilation ? (
                  <span className="bg-gold text-gold-foreground text-caption absolute top-2 right-2 rounded-full px-2 py-0.5 font-medium">
                    {t("compilationBadge")}
                  </span>
                ) : null}
              </div>
              <div className="mt-2">
                <p className="text-small text-foreground truncate font-medium">{release.title}</p>
                <p className="text-caption text-muted-foreground truncate">{release.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
