"use client";

import { useTranslations } from "next-intl";
import { GrainOverlay } from "./grain-overlay";
import { ScrollReveal } from "./scroll-reveal";

/**
 * Hero de la page À propos — narratif, chaleureux (halo or dominant,
 * contrairement au cerise de Distribution/Booking ou au duo or+cerise de
 * Studio) : cette page raconte une histoire humaine, pas un produit.
 *
 * Le texte narratif (`paragraphs`, ex-`introParagraphs` de `page.tsx`) vit
 * maintenant DANS ce hero plutôt que dans une section séparée juste après :
 * la version précédente coupait net le fond ambiant à la fin du hero, puis
 * enchaînait sur un bloc de texte brut sans habillage — visuellement, deux
 * morceaux collés plutôt qu'une seule intro cohérente (retour d'Axel :
 * "trop sale... ne ressemble à rien"). Un seul `intro` en trop (ancien
 * `About.intro`, redondant avec le premier paragraphe de `paragraphs`) a
 * aussi été retiré à cette occasion.
 */
export function AboutHero({ paragraphs }: { paragraphs: string[] }) {
  const t = useTranslations("About");

  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28">
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
      </div>

      <ScrollReveal className="mx-auto mt-10 flex max-w-2xl flex-col gap-4" delay={0.1}>
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-body-lg text-muted-foreground text-center">
            {paragraph}
          </p>
        ))}
      </ScrollReveal>
    </section>
  );
}
