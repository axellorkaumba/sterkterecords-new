import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "./animated-counter";
import { ScrollReveal } from "./scroll-reveal";

export interface StatStripItem {
  icon: LucideIcon;
  value: number;
  display: string;
  label: string;
}

/**
 * Bande de preuve statistique — composant générique de la bibliothèque
 * premium (réutilisable sur d'autres pages). Rupture de rythme volontaire
 * par rapport à une grille de cartes : une seule bande horizontale, pas de
 * bordures individuelles par carte.
 */
export function StatStrip({ items }: { items: StatStripItem[] }) {
  return (
    <div className="border-border divide-border grid grid-cols-2 divide-x divide-y border sm:grid-cols-4 sm:divide-y-0">
      {items.map((item, index) => (
        <ScrollReveal
          key={item.label}
          delay={index * 0.06}
          className="flex flex-col items-center gap-2 px-4 py-8 text-center"
        >
          <item.icon className="text-primary size-5" aria-hidden="true" />
          <span className="font-display text-h2">
            <AnimatedCounter value={item.value} display={item.display} />
          </span>
          <span className="text-small text-muted-foreground">{item.label}</span>
        </ScrollReveal>
      ))}
    </div>
  );
}
