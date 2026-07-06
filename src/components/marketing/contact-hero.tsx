"use client";

import { useTranslations } from "next-intl";
import { GrainOverlay } from "./grain-overlay";

/**
 * Hero de la page Contact — la plus sobre du site (§ demande Axel : "la
 * page la plus sobre — hero minimal"). Un seul halo cerise très faible,
 * quasiment imperceptible, plutôt qu'un fond totalement plat.
 */
export function ContactHero() {
  const t = useTranslations("ContactPage");

  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-8 sm:px-6 sm:pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="bg-cerise-500/8 absolute top-[-20%] right-[10%] size-[30rem] rounded-full blur-[140px]" />
        <GrainOverlay opacity={0.03} />
      </div>

      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <span className="border-border text-caption text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1">
          <span className="bg-primary size-1.5 rounded-full" />
          {t("tag")}
        </span>
        <h1 className="text-display font-display">
          {t.rich("title", {
            gold: (chunks) => <span className="text-or-400">{chunks}</span>,
          })}
        </h1>
        <p className="text-body-lg text-muted-foreground">{t("description")}</p>
      </div>
    </section>
  );
}
