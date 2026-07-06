"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { UploadIcon, ShieldCheckIcon, Share2Icon, RadioIcon, CoinsIcon } from "lucide-react";
import { catalogueReleases } from "@/content/catalogue";

const STAGES = [
  { key: "upload", Icon: UploadIcon },
  { key: "validation", Icon: ShieldCheckIcon },
  { key: "distribution", Icon: Share2Icon },
  { key: "streaming", Icon: RadioIcon },
  { key: "royalties", Icon: CoinsIcon },
] as const;

const LOOP_SECONDS = 9;
const PACKET_SIZE = 36;

/**
 * Section signature de la page Distribution (moment "wow" #2 du plan de
 * refonte) : le parcours réel d'une sortie, Upload → Validation →
 * Distribution → Streaming → Royalties. Un point lumineux portant une
 * vraie pochette voyage le long du tracé en boucle lente ; chaque étape
 * s'illumine brièvement à son passage. Conçu pour être réutilisé tel quel
 * plus tard dans le Dashboard Artiste (état réel d'une sortie en cours).
 *
 * Le déplacement du point est un `transform: translateX` calculé en pixels
 * (mesure du conteneur via ResizeObserver) — jamais une animation de
 * `left` en pourcentage, qui ne serait pas accélérée GPU et créerait du
 * layout thrash sur une animation en boucle infinie (contrainte Perf §9).
 */
export function ReleasePipeline() {
  const t = useTranslations("Distribution.pipeline");
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [releaseIndex, setReleaseIndex] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const id = setInterval(() => {
      setReleaseIndex((current) => (current + 1) % catalogueReleases.length);
    }, LOOP_SECONDS * 1000);
    return () => clearInterval(id);
  }, [shouldReduceMotion]);

  const stageCount = STAGES.length;
  const positions = Array.from(
    { length: stageCount },
    (_, index) => (width * index) / (stageCount - 1) - PACKET_SIZE / 2,
  );
  const release = catalogueReleases[releaseIndex];

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-4xl py-6">
      <div className="bg-border absolute top-1/2 right-0 left-0 h-px -translate-y-1/2" />

      {!shouldReduceMotion && width > 0 && release ? (
        <motion.div
          className="shadow-glow-cerise border-cerise-500/50 absolute top-1/2 z-10 size-9 -translate-y-1/2 overflow-hidden rounded-full border-2"
          animate={{ x: positions }}
          transition={{
            duration: LOOP_SECONDS,
            repeat: Infinity,
            ease: "linear",
            times: STAGES.map((_, index) => index / (stageCount - 1)),
          }}
        >
          <Image
            src={release.coverSrc}
            alt=""
            fill
            sizes={`${PACKET_SIZE}px`}
            className="object-cover"
          />
        </motion.div>
      ) : null}

      <div className="relative flex items-center justify-between">
        {STAGES.map(({ key, Icon }, index) => (
          <div key={key} className="flex flex-col items-center gap-2">
            <motion.div
              className="border-border bg-card flex size-12 items-center justify-center rounded-full border"
              animate={shouldReduceMotion ? undefined : { opacity: [0.6, 1, 0.6] }}
              transition={{
                duration: LOOP_SECONDS,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.max(0, (index / (stageCount - 1)) * LOOP_SECONDS - 0.4),
              }}
            >
              <Icon className="text-primary size-5" aria-hidden="true" />
            </motion.div>
            <span className="text-caption text-muted-foreground whitespace-nowrap">
              {t(`stages.${key}`)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
