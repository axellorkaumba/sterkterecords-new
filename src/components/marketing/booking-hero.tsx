"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { GrainOverlay } from "./grain-overlay";

/**
 * Hero de la page Booking (§ demande Axel : ambiance événementielle,
 * projecteurs, profondeur). Constat honnête fait dans le brief : aucune
 * vraie photo de concert/scène n'existe dans `IMAGES/` — seulement des
 * photos de séances studio. Plutôt qu'une photo de stock, la photo réelle
 * disponible à l'éclairage le plus cinématographique
 * (`seance-ambiance.avif`) sert de texture d'arrière-plan discrète (opacité
 * réduite, désaturée), et l'énergie "spectacle" vient de la composition :
 * deux faisceaux lumineux diagonaux + deux halos (mêmes teintes de marque
 * cerise/or que le reste du site, jamais de couleur hors charte) qui
 * dérivent lentement, plus le grain partagé. Sciemment plus dense que le
 * halo unique de Distribution ou le duo discret de Studio — cette page a
 * la composition la plus "spectacle" du site, à dessein.
 */
export function BookingHero() {
  const t = useTranslations("Booking");
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/booking/seance-ambiance.avif"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-35 grayscale-[0.35]"
          priority
        />

        <motion.div
          className="from-cerise-500/25 absolute -top-1/3 left-[18%] h-[160%] w-48 -rotate-12 bg-gradient-to-b via-transparent to-transparent blur-3xl"
          animate={shouldReduceMotion ? undefined : { x: [0, 24, -12, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="from-or-400/20 absolute -top-1/3 right-[14%] h-[160%] w-40 rotate-[10deg] bg-gradient-to-b via-transparent to-transparent blur-3xl"
          animate={shouldReduceMotion ? undefined : { x: [0, -20, 14, 0] }}
          transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="bg-cerise-700/20 absolute top-[8%] left-[6%] size-[30rem] rounded-full blur-[140px]" />
        <div className="bg-or-400/10 absolute right-[8%] bottom-[-12%] size-[26rem] rounded-full blur-[130px]" />

        <GrainOverlay opacity={0.06} />
        <div className="from-noir-950/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
      </div>

      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
        <span className="border-border text-caption text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 backdrop-blur">
          <span className="bg-primary size-1.5 rounded-full" />
          {t("tag")}
        </span>
        <h1 className="text-display font-display">
          {t.rich("title", {
            gold: (chunks) => <span className="text-or-400">{chunks}</span>,
          })}
        </h1>
        <p className="text-body-lg text-muted-foreground">{t("description")}</p>
        <Button
          variant="premium"
          size="lg"
          render={<a href="#reservation">{t("reserveButton")}</a>}
          nativeButton={false}
        />
      </div>
    </section>
  );
}
