"use client";

import { useTranslations } from "next-intl";
import { GrainOverlay } from "./grain-overlay";

/**
 * Hero de la page Tarifs — volontairement la page la plus sobre du site
 * (clarté du prix > effet, décision actée avec Axel). Un seul halo or très
 * discret (teinte différente de toutes les autres pages : Distribution =
 * cerise, Studio = or+cerise, Booking = composition dense cerise/or) +
 * grain partagé — jamais un fond plat, mais rien qui détourne l'attention
 * du prix. Pas d'animation de texte, pas de CTA ici : le premier choix
 * vient des cartes, pas du Hero.
 */
export function PricingHero() {
  const t = useTranslations("Pricing");

  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-12 sm:px-6 sm:pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="bg-or-400/10 absolute top-[-20%] left-1/2 size-[36rem] -translate-x-1/2 rounded-full blur-[150px]" />
        <GrainOverlay opacity={0.035} />
      </div>

      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <span className="border-border text-caption text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1">
          <span className="bg-or-400 size-1.5 rounded-full" />
          {t("tag")}
        </span>
        <h1 className="text-display font-display">{t("title")}</h1>
        <p className="text-body-lg text-muted-foreground">{t("description")}</p>
      </div>
    </section>
  );
}
