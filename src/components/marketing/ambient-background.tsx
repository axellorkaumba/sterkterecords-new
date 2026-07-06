"use client";

import { motion, useReducedMotion } from "motion/react";
import { GrainOverlay } from "./grain-overlay";

/**
 * Fond vivant de la Home (direction artistique premium demandée par Axel) :
 * halos lumineux qui dérivent très lentement (transform/opacity uniquement
 * — GPU, jamais `filter`/`box-shadow` animés en continu), gradient discret,
 * grain cinématique très léger (texture SVG statique, pas de coût CPU/GPU).
 *
 * Scopé à la Home : les autres pages du site public gardent le fond uni,
 * cohérent avec leur contenu plus dense (texte long, tableaux CGU...).
 * `position: absolute` dans un parent `relative overflow-hidden` — jamais
 * `fixed` (éviterait de créer un nouveau contexte de scroll/repaint sur
 * toute la page).
 */
export function AmbientBackground() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Halo cerise */}
      <motion.div
        className="bg-cerise-500/25 absolute top-[-10%] left-[10%] size-[36rem] rounded-full blur-[120px]"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, 40, -20, 0],
                y: [0, 30, 60, 0],
              }
        }
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Halo or, plus discret */}
      <motion.div
        className="bg-or-400/10 absolute top-[20%] right-[-5%] size-[28rem] rounded-full blur-[100px]"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, -30, 10, 0],
                y: [0, 40, -20, 0],
              }
        }
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Halo cerise, bas de page, très discret */}
      <motion.div
        className="bg-cerise-700/15 absolute bottom-[-15%] left-[30%] size-[32rem] rounded-full blur-[130px]"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, 25, -35, 0],
                y: [0, -25, 15, 0],
              }
        }
        transition={{ duration: 46, repeat: Infinity, ease: "easeInOut" }}
      />

      <GrainOverlay opacity={0.05} />

      {/* Gradient de base très discret, du haut vers le bas */}
      <div className="from-cerise-900/10 absolute inset-0 bg-gradient-to-b via-transparent to-transparent" />
    </div>
  );
}
