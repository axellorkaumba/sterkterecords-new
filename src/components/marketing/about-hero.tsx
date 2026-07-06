"use client";

import { useTranslations } from "next-intl";
import { GrainOverlay } from "./grain-overlay";

/**
 * Hero de la page À propos — narratif, chaleureux (halo or dominant,
 * contrairement au cerise de Distribution/Booking ou au duo or+cerise de
 * Studio) : cette page raconte une histoire humaine, pas un produit.
 */
export function AboutHero() {
  const t = useTranslations("About");

  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-12 sm:px-6 sm:pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="bg-or-400/15 absolute top-[-15%] left-[15%] size-[38rem] rounded-full blur-[140px]" />
        <GrainOverlay opacity={0.04} />
      </div>

      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <span className="border-border text-caption text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1">
          <span className="bg-or-400 size-1.5 rounded-full" />
          {t("tag")}
        </span>
        <h1 className="text-display font-display">
          {t.rich("title", {
            gold: (chunks) => <span className="text-or-400">{chunks}</span>,
          })}
        </h1>
        <p className="text-body-lg text-muted-foreground">{t("intro")}</p>
      </div>
    </section>
  );
}
