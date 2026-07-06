import Image from "next/image";
import { partners } from "@/content/partners";
import { ScrollReveal } from "./scroll-reveal";

/**
 * Section "Nos partenaires" — grille institutionnelle statique (§ demande
 * Axel : inspiration Stripe/Apple/Notion, jamais un simple alignement de
 * logos, jamais un défilement — le bandeau DSP de la Home reste inchangé
 * et distinct). Bande sombre dédiée (`bg-noir-950`, indépendante du thème
 * clair/sombre global) : les logos sources sont des monochromes blancs sur
 * fond noir plein (vérifié à l'extraction) — `mix-blend-mode: screen` fait
 * disparaître le noir source dans le noir de la bande, ne laissant que le
 * tracé blanc, sans dépendre d'un filtre CSS approximatif sur un raster.
 *
 * Hauteur visuelle égale pour chaque logo (`object-contain` dans une boîte
 * de hauteur fixe), jamais de logo déformé. Animation strictement limitée
 * à l'apparition au scroll + un léger agrandissement au survol (2-3%) —
 * pas de rotation, pas de rebond, la grille reste fixe pour renforcer son
 * aspect institutionnel.
 */
export function PartnerGrid({ tag, title }: { tag: string; title: string }) {
  return (
    <section className="bg-noir-950 relative overflow-hidden py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <ScrollReveal className="mx-auto mb-14 max-w-xl text-center">
          <p className="text-caption font-medium tracking-wide text-white/50 uppercase">{tag}</p>
          <h2 className="text-h1 font-display mt-2 text-white">{title}</h2>
        </ScrollReveal>

        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
          {partners.map((partner, index) => (
            <ScrollReveal
              key={partner.slug}
              delay={index * 0.05}
              className="flex h-14 items-center justify-center"
            >
              <div className="relative h-full w-full transition-transform duration-300 hover:scale-[1.03]">
                <Image
                  src={partner.logoSrc}
                  alt={partner.name}
                  fill
                  sizes="160px"
                  className="object-contain mix-blend-screen"
                />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
