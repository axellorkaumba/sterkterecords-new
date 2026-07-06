"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { GrainOverlay } from "./grain-overlay";

interface AmbientSectionProps {
  children: ReactNode;
  /** Teinte dominante — jamais la même sur deux zones adjacentes d'une page (cf. principe "jamais deux fonds identiques"). */
  tint?: "cerise" | "or";
  className?: string;
}

/**
 * Enveloppe plusieurs sections consécutives dans un même fond vivant
 * partagé — au lieu que chaque section ait (ou n'ait pas) son propre
 * traitement isolé, ce qui crée l'effet "bloc qui commence, bloc qui finit"
 * qu'Axel a explicitement écarté. Un seul halo diffus, positionné en
 * valeurs fixes (pas en pourcentage) pour rester cohérent quelle que soit
 * la hauteur totale du contenu enveloppé, plus le grain partagé
 * (`GrainOverlay`). Beaucoup plus discret que les halos de Hero — ceci
 * habille des sections de contenu (texte/cartes), pas un Hero.
 *
 * Réutilisable : la Home l'utilise pour Services+CTA final (la moitié de
 * page qui n'avait auparavant aucun traitement de fond après le Hero).
 */
export function AmbientSection({ children, tint = "cerise", className }: AmbientSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const haloClass = tint === "or" ? "bg-or-400/8" : "bg-cerise-500/8";

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className={`absolute top-0 left-1/2 size-[44rem] -translate-x-1/2 rounded-full blur-[160px] ${haloClass}`}
          animate={shouldReduceMotion ? undefined : { y: [0, 40, 0] }}
          transition={{ duration: 42, repeat: Infinity, ease: "easeInOut" }}
        />
        <GrainOverlay opacity={0.03} />
      </div>
      {children}
    </div>
  );
}
