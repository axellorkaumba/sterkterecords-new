import Image from "next/image";
import { ScrollReveal } from "./scroll-reveal";

export interface PhotoMasonryItem {
  src: string;
  alt: string;
  caption?: string;
}

/**
 * Galerie masonry générique (composant de la bibliothèque premium,
 * réutilisable sur Booking/À propos) — mise en page CSS multi-colonnes
 * native (`columns-*` + `break-inside-avoid`), pas de calcul JS de
 * position : les vraies photos (portrait/carré) gardent leur ratio
 * d'origine plutôt que d'être forcées dans une grille uniforme, d'où
 * l'effet "mosaïque" recherché. Légende en surimpression au survol
 * uniquement (jamais visible en permanence — sobriété).
 */
export function PhotoMasonry({ items }: { items: PhotoMasonryItem[] }) {
  return (
    <div className="columns-2 gap-4 sm:columns-3">
      {items.map((item, index) => (
        <ScrollReveal
          key={item.src}
          delay={index * 0.05}
          className="group relative mb-4 break-inside-avoid overflow-hidden rounded-xl"
        >
          <Image
            src={item.src}
            alt={item.alt}
            width={400}
            height={500}
            sizes="(min-width: 640px) 33vw, 50vw"
            className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {item.caption ? (
            <div className="from-noir-950/80 pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="text-blanc text-small p-3 font-medium">{item.caption}</span>
            </div>
          ) : null}
        </ScrollReveal>
      ))}
    </div>
  );
}
