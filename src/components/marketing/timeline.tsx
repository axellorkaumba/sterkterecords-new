import { ScrollReveal } from "./scroll-reveal";

export interface TimelineEntry {
  year: string;
  title: string;
  description: string;
}

/**
 * Timeline verticale — composant générique de la bibliothèque premium
 * (réutilisable). Ligne + points dorés, un point par jalon, reveal
 * échelonné au scroll. Utilisée par À propos ("Notre histoire") ; pourra
 * l'être ailleurs (parcours d'un artiste, étapes d'un projet...).
 */
export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <div className="border-or-400/30 flex flex-col gap-10 border-l-2 pl-8">
      {entries.map((entry, index) => (
        <ScrollReveal key={entry.year} delay={index * 0.05} className="relative">
          <span className="bg-or-400 absolute top-1.5 -left-[2.6rem] size-3 rounded-full" />
          <p className="text-or-400 font-display text-h3">{entry.year}</p>
          <h3 className="text-h3 font-display mt-1">{entry.title}</h3>
          <p className="text-body text-muted-foreground mt-2">{entry.description}</p>
        </ScrollReveal>
      ))}
    </div>
  );
}
