import Image from "next/image";
import type { ReactNode } from "react";
import { ScrollReveal } from "./scroll-reveal";

interface ImageTextRowProps {
  src: string;
  alt: string;
  eyebrow: string;
  children: ReactNode;
  /** Inverse l'ordre (image à droite plutôt qu'à gauche) — alterne d'une section à l'autre. */
  reverse?: boolean;
}

/**
 * Bloc éditorial image + texte en alternance — composant de la
 * bibliothèque premium (réutilisable). Casse la répétition d'une simple
 * liste de paragraphes empilés : une vraie photo à chaque section, l'ordre
 * s'inverse d'un bloc à l'autre pour un rythme de lecture qui change.
 */
export function ImageTextRow({ src, alt, eyebrow, children, reverse = false }: ImageTextRowProps) {
  return (
    <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-12">
      <ScrollReveal className={reverse ? "lg:order-2" : undefined}>
        <div className="shadow-elevated relative aspect-[4/5] overflow-hidden rounded-2xl">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </ScrollReveal>
      <ScrollReveal delay={0.1} className={reverse ? "lg:order-1" : undefined}>
        <p className="text-caption text-or-400 font-medium tracking-wide uppercase">{eyebrow}</p>
        <div className="text-body text-muted-foreground mt-3">{children}</div>
      </ScrollReveal>
    </div>
  );
}
