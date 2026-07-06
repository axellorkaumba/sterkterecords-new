"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useReducedMotion, animate } from "motion/react";

interface AnimatedCounterProps {
  value: number;
  /** Texte déjà formaté (ex. "150+", "1M+") — prioritaire sur `value` pour l'affichage final si fourni. */
  display?: string;
  durationSeconds?: number;
}

/**
 * Compteur progressif au scroll-into-view (§ demande Axel : "compteur
 * progressif, léger effet de glow, aucune animation excessive"). N'anime
 * qu'une seule fois (`once: true`) — un compteur qui recompte à chaque
 * scroll serait justement l'effet "gadget" à éviter.
 *
 * `prefers-reduced-motion` : affiche directement la valeur finale, pas de
 * décompte (motion.animate respecte nativement ce cas via `useReducedMotion`
 * ici vérifié explicitement plutôt que suivi implicitement par le SDK).
 */
export function AnimatedCounter({ value, display, durationSeconds = 1.8 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const shouldReduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);

  useEffect(() => {
    if (!isInView) return;
    if (!ref.current) return;

    if (shouldReduceMotion) {
      ref.current.textContent = display ?? value.toLocaleString();
      return;
    }

    const controls = animate(motionValue, value, {
      duration: durationSeconds,
      ease: "easeOut",
      onUpdate(latest) {
        if (ref.current) {
          ref.current.textContent = Math.round(latest).toLocaleString();
        }
      },
      onComplete() {
        if (ref.current && display) {
          ref.current.textContent = display;
        }
      },
    });

    return () => controls.stop();
  }, [isInView, value, display, durationSeconds, shouldReduceMotion, motionValue]);

  return (
    <span ref={ref} className="tabular-nums">
      0
    </span>
  );
}
