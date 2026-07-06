"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { SiSpotify, SiApplemusic, SiDeezer, SiYoutubemusic } from "@icons-pack/react-simple-icons";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "./animated-counter";
import { catalogueReleases } from "@/content/catalogue";

/** Placements déterministes du collage — jamais recalculés au hasard (pas de layout shift à l'hydratation). */
const COLLAGE_ITEMS = [
  { top: "4%", left: "4%", size: 92, rotate: -6, z: 1, opacity: 0.7 },
  { top: "16%", left: "26%", size: 128, rotate: 4, z: 3, opacity: 1 },
  { top: "0%", left: "48%", size: 104, rotate: -3, z: 2, opacity: 0.85 },
  { top: "20%", left: "68%", size: 116, rotate: 5, z: 2, opacity: 0.9 },
  { top: "2%", left: "86%", size: 84, rotate: -4, z: 1, opacity: 0.65 },
  { top: "48%", left: "12%", size: 96, rotate: 3, z: 1, opacity: 0.7 },
  { top: "50%", left: "56%", size: 88, rotate: -5, z: 1, opacity: 0.6 },
] as const;

const FLOATING_LOGOS = [
  { Icon: SiSpotify, color: "#1ED760", top: "6%", left: "16%" },
  { Icon: SiApplemusic, color: "#FA243C", top: "62%", left: "84%" },
  { Icon: SiDeezer, color: "#A238FF", top: "72%", left: "32%" },
  { Icon: SiYoutubemusic, color: "#FF0000", top: "8%", left: "94%" },
] as const;

interface DistributionHeroProps {
  platformsValue: number;
  platformsDisplay: string;
  deliverySpeed: string;
}

/**
 * Hero de la page Distribution (§ demande Axel : collage de pochettes,
 * statistiques flottantes, visualisation des plateformes, halo rouge très
 * discret, animation des sorties). Distinct du Hero de la Home : un seul
 * halo cerise centré (pas trois), pas de smartphone/timeline — le récit
 * ici est "votre musique voyage", porté par le collage + le pipeline
 * animé plus bas sur la page (`release-pipeline.tsx`).
 *
 * Parallaxe très discret du collage au scroll (`useScroll`/`useTransform`,
 * `transform` uniquement — GPU). Toutes les animations en boucle
 * respectent `useReducedMotion`.
 */
export function DistributionHero({
  platformsValue,
  platformsDisplay,
  deliverySpeed,
}: DistributionHeroProps) {
  const t = useTranslations("Distribution");
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : 36]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden px-4 pt-16 pb-12 sm:px-6 sm:pt-24"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="bg-cerise-500/15 absolute top-[-18%] left-1/2 size-[42rem] -translate-x-1/2 rounded-full blur-[150px]" />
      </div>

      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
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
        <Button
          variant="premium"
          size="lg"
          render={<Link href="/inscription">{t("ctaLoggedOut")}</Link>}
          nativeButton={false}
        />
      </div>

      <motion.div
        style={{ y: parallaxY }}
        className="relative mx-auto mt-14 h-[260px] max-w-4xl sm:h-[320px]"
      >
        {COLLAGE_ITEMS.map((item, index) => {
          const release = catalogueReleases[index % catalogueReleases.length];
          if (!release) return null;
          return (
            <motion.div
              key={index}
              className="shadow-elevated absolute overflow-hidden rounded-xl"
              style={{
                top: item.top,
                left: item.left,
                width: item.size,
                height: item.size,
                zIndex: item.z,
              }}
              initial={{ opacity: 0, scale: 0.9, rotate: item.rotate }}
              animate={{
                opacity: item.opacity,
                scale: 1,
                rotate: item.rotate,
                y: shouldReduceMotion ? 0 : [0, -8, 0],
              }}
              transition={{
                opacity: { duration: 0.7, delay: index * 0.05 },
                scale: { duration: 0.7, delay: index * 0.05 },
                y: { duration: 5 + index * 0.6, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <Image
                src={release.coverSrc}
                alt=""
                fill
                sizes={`${item.size}px`}
                className="object-cover"
              />
            </motion.div>
          );
        })}

        {FLOATING_LOGOS.map(({ Icon, color, top, left }, index) => (
          <motion.div
            key={index}
            className="absolute opacity-25"
            style={{ top, left }}
            animate={shouldReduceMotion ? undefined : { y: [0, -10, 0] }}
            transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon size={24} color={color} />
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="shadow-elevated border-border/50 bg-card/90 absolute top-2 right-2 flex flex-col gap-0.5 rounded-xl border px-4 py-3 backdrop-blur"
        >
          <span className="font-display text-h3">
            <AnimatedCounter value={platformsValue} display={platformsDisplay} />
          </span>
          <span className="text-caption text-muted-foreground">{t("stats.platforms")}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="shadow-elevated border-border/50 bg-card/90 absolute bottom-2 left-2 flex flex-col gap-0.5 rounded-xl border px-4 py-3 backdrop-blur"
        >
          <span className="font-display text-h3">{deliverySpeed}</span>
          <span className="text-caption text-muted-foreground">{t("stats.speed")}</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
