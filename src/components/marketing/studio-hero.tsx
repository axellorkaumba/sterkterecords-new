"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { GrainOverlay } from "./grain-overlay";

/** Hauteurs de repos des barres (px) — le pouls animé multiplie ces valeurs. */
const WAVEFORM_BARS = [10, 18, 26, 16, 22, 12, 20, 14] as const;

/**
 * Hero de la page Studio (§ demande Axel : immense photographie
 * immersive, ambiance cinématographique). Contrainte réelle des assets :
 * aucune photo `IMAGES/` n'est au format large — un plein-cadre horizontal
 * forcerait un recadrage agressif. Choix : split asymétrique (texte à
 * gauche, comme la Home, mais avec une vraie photo verticale à droite —
 * `PC MIX.avif`, thématiquement la console de mixage) plutôt qu'une bande
 * large qui mutilerait le cadrage d'origine.
 *
 * Effet Ken Burns (zoom très lent, `transform: scale` sur un enfant
 * `position: absolute` dédié — jamais sur l'élément qui contient l'`Image`
 * `fill` lui-même, pour ne pas perturber son calcul de taille), petit
 * accent "ondes sonores" (barres qui pulsent en `scaleY`, GPU). Un seul
 * moment signature ici — le reste de la page reste sobre.
 *
 * Fond propre à cette page (jamais un simple fond uni, cf. principe
 * "chaque page son propre arrière-plan") : halo or chaud + halo cerise très
 * discrets qui dérivent lentement, plus le grain cinématique partagé
 * (`GrainOverlay`) — teinte différente du halo unique cerise de
 * Distribution, pour ne pas donner l'impression d'un fond recyclé.
 */
export function StudioHero() {
  const t = useTranslations("Studio");
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-12 sm:px-6 sm:pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="bg-or-400/10 absolute top-[-15%] left-[-8%] size-[34rem] rounded-full blur-[130px]"
          animate={shouldReduceMotion ? undefined : { x: [0, 30, -10, 0], y: [0, 20, 40, 0] }}
          transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="bg-cerise-700/10 absolute right-[-10%] bottom-[-20%] size-[28rem] rounded-full blur-[120px]"
          animate={shouldReduceMotion ? undefined : { x: [0, -20, 15, 0], y: [0, -15, 25, 0] }}
          transition={{ duration: 44, repeat: Infinity, ease: "easeInOut" }}
        />
        <GrainOverlay opacity={0.045} />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-5">
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

          <div className="mt-1 flex items-end gap-1" aria-hidden="true">
            {WAVEFORM_BARS.map((height, index) => (
              <motion.span
                key={index}
                className="bg-primary/50 w-1 rounded-full"
                style={{ height }}
                animate={shouldReduceMotion ? undefined : { scaleY: [1, 1.8, 1] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.1,
                }}
              />
            ))}
          </div>

          <Button
            variant="premium"
            size="lg"
            render={<a href="#reservation">{t("reserveButton")}</a>}
            nativeButton={false}
          />
        </div>

        <motion.div
          className="shadow-elevated relative h-[420px] overflow-hidden rounded-2xl sm:h-[520px]"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="absolute inset-0"
            animate={shouldReduceMotion ? undefined : { scale: [1, 1.08] }}
            transition={{ duration: 22, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          >
            <Image
              src="/studio/pc-mix.avif"
              alt={t("heroImageAlt")}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          </motion.div>
          <div className="from-noir-950/50 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
