export interface Partner {
  slug: string;
  name: string;
  /** Chemin sous public/ — PNG (pas AVIF) : fond noir plein `#000000` requis pour le compositing `mix-blend-mode: screen`. */
  logoSrc: string;
}

/**
 * Partenaires réels (logos extraits de `IMAGES/`, `scripts/extract-partner-logos.mjs`).
 * Pour ajouter un partenaire : déposer le fichier source dans `IMAGES/`,
 * l'ajouter à `LOGO_SLUGS` dans le script, relancer
 * `node scripts/extract-partner-logos.mjs`, puis ajouter une entrée ici.
 * Aucun composant à modifier.
 */
export const partners: Partner[] = [
  { slug: "mwezi-partners", name: "Mwezi Partners", logoSrc: "/partners/mp.png" },
  { slug: "reservo", name: "Reservo", logoSrc: "/partners/reservo.png" },
  { slug: "reed-signature", name: "Reed Signature", logoSrc: "/partners/reedsignature.png" },
  { slug: "sofari-vizuri", name: "Sofari Vizuri", logoSrc: "/partners/sv.png" },
  { slug: "arteast", name: "Arteast", logoSrc: "/partners/arteast.png" },
  { slug: "inseme-farm", name: "Inseme Farm", logoSrc: "/partners/if.png" },
  { slug: "gc", name: "GC", logoSrc: "/partners/gc.png" },
];
