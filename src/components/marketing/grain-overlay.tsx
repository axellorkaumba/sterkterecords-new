interface GrainOverlayProps {
  /** Opacité du grain — rester très faible (0.03-0.07), sinon ça distrait. */
  opacity?: number;
}

/**
 * Texture de grain cinématique — SVG `feTurbulence` statique (pas de coût
 * CPU/GPU d'animation), extrait de `ambient-background.tsx` pour être
 * réutilisé sur toutes les pages qui ont leur propre traitement de fond
 * (chaque page a son propre halo/mesh, mais partage la même texture de
 * grain — cohérence du design system, §6 du plan de refonte).
 */
export function GrainOverlay({ opacity = 0.05 }: GrainOverlayProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 mix-blend-overlay"
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}
