"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Décalage (secondes) pour échelonner plusieurs éléments d'une même section. */
  delay?: number;
  /** Distance de départ en px — légère par défaut pour rester discret (§8/9). */
  distance?: number;
}

/**
 * Révélation au scroll (§8 : "chaque section doit raconter une histoire").
 * `viewport={{ once: true }}` — ne rejoue jamais en re-scrollant, pour éviter
 * l'effet gadget explicitement écarté par Axel. `prefers-reduced-motion` :
 * apparition instantanée (pas de translation), pas de saut de mise en page
 * (l'espace est déjà réservé par le flux normal, seul `transform`/`opacity`
 * bougent).
 */
export function ScrollReveal({ children, className, delay = 0, distance = 24 }: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
