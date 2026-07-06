"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { catalogueReleases } from "@/content/catalogue";

interface SlotConfig {
  releases: typeof catalogueReleases;
  intervalMs: number;
  rotate: number;
  scale: number;
  opacity: number;
  top: string;
  left: string;
  size: number;
  z: number;
  floatOffset: number;
}

/**
 * Composition éditoriale de vraies pochettes pour le Hero (demande Axel :
 * "jamais une seule pochette en plein écran", superposition légère,
 * rotation 2-4°, ombres réalistes, animation très lente — évoque une
 * campagne Apple Music/Spotify for Artists, pas une galerie).
 *
 * 3 "emplacements" (arrière-gauche, arrière-droite, avant-centre) cycl­ent
 * chacun sur son propre intervalle à travers un sous-ensemble du catalogue
 * réel (`src/content/catalogue.ts`) — le décalage entre les trois horloges
 * évite l'effet "diaporama synchronisé". Un seul fondu à la fois par
 * emplacement (`AnimatePresence mode="wait"`).
 *
 * `prefers-reduced-motion` : aucune rotation automatique (une pochette fixe
 * par emplacement), pas de flottement.
 */
export function CoverComposition() {
  const shouldReduceMotion = useReducedMotion();

  const slots: SlotConfig[] = [
    {
      releases: catalogueReleases.slice(0, 5),
      intervalMs: 8000,
      rotate: -4,
      scale: 0.88,
      opacity: 0.55,
      top: "2%",
      left: "-6%",
      size: 128,
      z: 0,
      floatOffset: 0.4,
    },
    {
      releases: catalogueReleases.slice(4, 9),
      intervalMs: 10500,
      rotate: 4,
      scale: 0.9,
      opacity: 0.65,
      top: "18%",
      left: "34%",
      size: 132,
      z: 5,
      floatOffset: 1,
    },
    {
      releases: catalogueReleases.slice(8, 13),
      intervalMs: 7000,
      rotate: -1.5,
      scale: 1,
      opacity: 1,
      top: "0%",
      left: "10%",
      size: 160,
      z: 10,
      floatOffset: 0,
    },
  ];

  return (
    <div className="relative h-48 w-full">
      {slots.map((slot, index) => (
        <CoverSlot key={index} {...slot} shouldReduceMotion={!!shouldReduceMotion} />
      ))}
    </div>
  );
}

function CoverSlot({
  releases,
  intervalMs,
  rotate,
  scale,
  opacity,
  top,
  left,
  size,
  z,
  floatOffset,
  shouldReduceMotion,
}: SlotConfig & { shouldReduceMotion: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion || releases.length <= 1) return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % releases.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [releases.length, intervalMs, shouldReduceMotion]);

  const release = releases[index];
  if (!release) return null;

  return (
    <motion.div
      className="shadow-elevated absolute overflow-hidden rounded-2xl"
      style={{ top, left, width: size, height: size, zIndex: z }}
      initial={{ opacity: 0, scale: scale - 0.05, rotate }}
      animate={{
        opacity,
        scale,
        rotate,
        y: shouldReduceMotion ? 0 : [0, -10, 0],
      }}
      transition={{
        opacity: { duration: 0.8 },
        scale: { duration: 0.8 },
        y: { duration: 6 + floatOffset, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={release.slug}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={release.coverSrc}
            alt={`${release.artist} — ${release.title}`}
            fill
            sizes="160px"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
