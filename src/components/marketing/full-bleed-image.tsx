import Image from "next/image";
import { ScrollReveal } from "./scroll-reveal";

interface FullBleedImageProps {
  src: string;
  alt: string;
  caption: string;
}

/**
 * Section "grande image" — composant générique de la bibliothèque premium
 * (réutilisable sur Studio/Booking/À propos). Photo réelle plein cadre,
 * dégradé sombre pour la lisibilité, légende en surimpression. Rupture de
 * rythme volontaire : aucune carte, aucune grille, une seule image qui
 * occupe tout l'espace.
 */
export function FullBleedImage({ src, alt, caption }: FullBleedImageProps) {
  return (
    <ScrollReveal className="relative mx-auto h-[420px] max-w-6xl overflow-hidden px-4 sm:h-[480px] sm:px-6">
      <div className="relative h-full w-full overflow-hidden rounded-2xl">
        <Image src={src} alt={alt} fill sizes="100vw" className="object-cover" />
        <div className="from-noir-950/90 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
        <p className="text-body-lg text-blanc font-display absolute bottom-6 left-6 max-w-lg sm:bottom-10 sm:left-10">
          {caption}
        </p>
      </div>
    </ScrollReveal>
  );
}
