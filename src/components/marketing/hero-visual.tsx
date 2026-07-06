"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion, type TargetAndTransition } from "motion/react";
import { CheckCircle2Icon, TrendingUpIcon, PlayIcon } from "lucide-react";
import {
  SiSpotify,
  SiApplemusic,
  SiDeezer,
  SiYoutubemusic,
  SiTidal,
} from "@icons-pack/react-simple-icons";
import { AnimatedCounter } from "./animated-counter";
import { CoverComposition } from "./cover-composition";

const TIMELINE_STEPS = ["upload", "validation", "distribution", "live"] as const;

const FLOATING_LOGOS = [
  { Icon: SiApplemusic, color: "#FA243C", top: "6%", left: "-6%", size: 34 },
  { Icon: SiDeezer, color: "#A238FF", top: "68%", left: "-10%", size: 30 },
  { Icon: SiYoutubemusic, color: "#FF0000", top: "82%", left: "72%", size: 28 },
  { Icon: SiTidal, color: "#FFFFFF", top: "2%", left: "68%", size: 26 },
] as const;

/**
 * Composition "Music Ecosystem" à droite du Hero (direction artistique
 * validée par Axel) : smartphone + pochette + cartes de statut/statistiques
 * + timeline de distribution + logos de plateformes flottants en arrière-
 * plan très discret. Comprise en moins de 5 secondes, sans lire une ligne.
 *
 * Toutes les animations continues n'utilisent que `transform`/`opacity`
 * (GPU) — jamais de propriété de mise en page animée en boucle. Chaque
 * élément flottant a sa propre durée/déphasage pour éviter un mouvement
 * mécanique "tout synchronisé".
 */
export function HeroVisual() {
  const t = useTranslations("Home.heroVisual");
  const shouldReduceMotion = useReducedMotion();

  const floatAnimation = (offset: number): TargetAndTransition | undefined =>
    shouldReduceMotion
      ? undefined
      : {
          y: [0, -14, 0],
          transition: { duration: 6 + offset, repeat: Infinity, ease: "easeInOut" },
        };

  return (
    <div className="relative mx-auto hidden h-[560px] w-full max-w-md lg:block">
      {/* Logos de plateformes flottants, très discrets */}
      {FLOATING_LOGOS.map(({ Icon, color, top, left, size }, index) => (
        <motion.div
          key={index}
          className="absolute opacity-20"
          style={{ top, left }}
          animate={floatAnimation(index * 1.4)}
        >
          <Icon size={size} color={color} />
        </motion.div>
      ))}

      {/* Composition éditoriale de vraies pochettes (catalogue réel) */}
      <div className="absolute top-6 left-0 h-48 w-64">
        <CoverComposition />
      </div>

      {/* Smartphone — lecture en cours façon Spotify */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25 }}
        className="absolute top-24 left-24"
      >
        <motion.div
          animate={floatAnimation(0.6)}
          className="shadow-elevated border-noir-700 bg-noir-950 w-[220px] rounded-[2.25rem] border-8"
        >
          <div className="bg-noir-900 flex flex-col gap-4 rounded-[1.75rem] p-4">
            <div className="flex items-center justify-between">
              <span className="text-caption text-gris-400">{t("nowPlaying")}</span>
              <SiSpotify size={16} color="#1ED760" />
            </div>
            <div className="aspect-square w-full rounded-xl bg-gradient-to-br from-[var(--or-400)] via-[var(--cerise-500)] to-[var(--noir-900)]" />
            <div>
              <p className="text-small text-blanc font-medium">{t("trackTitle")}</p>
              <p className="text-caption text-gris-400">{t("artistName")}</p>
            </div>
            <div className="bg-noir-700 h-1 w-full overflow-hidden rounded-full">
              <div className="bg-cerise-500 h-full w-2/3 rounded-full" />
            </div>
            <div className="flex items-center justify-center">
              <div className="bg-cerise-500 flex size-9 items-center justify-center rounded-full">
                <PlayIcon className="text-blanc size-4 fill-current" aria-hidden="true" />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Carte "Release Approved" */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.55 }}
        className="absolute top-6 right-0"
      >
        <motion.div
          animate={floatAnimation(1.2)}
          className="shadow-elevated border-border/50 bg-card/90 flex items-center gap-2 rounded-xl border px-4 py-3 backdrop-blur"
        >
          <CheckCircle2Icon className="text-success size-5 shrink-0" aria-hidden="true" />
          <span className="text-small font-medium whitespace-nowrap">{t("releaseApproved")}</span>
        </motion.div>
      </motion.div>

      {/* Carte statistiques de streams */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.75 }}
        className="absolute right-2 bottom-32"
      >
        <motion.div
          animate={floatAnimation(1.8)}
          className="shadow-elevated border-border/50 bg-card/90 flex flex-col gap-1 rounded-xl border px-4 py-3 backdrop-blur"
        >
          <span className="text-caption text-muted-foreground flex items-center gap-1">
            <TrendingUpIcon className="text-success size-3.5" aria-hidden="true" />
            {t("streamsLabel")}
          </span>
          <span className="font-display text-h3">
            <AnimatedCounter value={1245678} />
          </span>
        </motion.div>
      </motion.div>

      {/* Timeline de distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.95 }}
        className="shadow-elevated border-border/50 bg-card/90 absolute bottom-0 left-6 flex flex-col gap-2 rounded-xl border px-4 py-3 backdrop-blur"
      >
        <div className="flex items-center gap-2">
          {TIMELINE_STEPS.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <span
                  className={
                    index === TIMELINE_STEPS.length - 1
                      ? "bg-success size-2 rounded-full"
                      : "bg-success/60 size-2 rounded-full"
                  }
                />
                <span className="text-caption text-muted-foreground whitespace-nowrap">
                  {t(`timeline.${step}`)}
                </span>
              </div>
              {index < TIMELINE_STEPS.length - 1 ? (
                <span className="bg-success/40 mb-4 h-px w-6" />
              ) : null}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
