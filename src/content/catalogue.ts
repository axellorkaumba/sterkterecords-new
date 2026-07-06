import type { CatalogueRelease } from "@/content/catalogue-types";

/**
 * Les 13 vraies pochettes disponibles dans IMAGES/COVERS/ (extraites et
 * optimisées en AVIF par scripts/extract-covers.mjs → public/covers/).
 * Pour ajouter une sortie : déposer le fichier source dans IMAGES/COVERS/,
 * l'ajouter à COVER_SLUGS dans scripts/extract-covers.mjs, relancer
 * `pnpm covers:extract`, puis ajouter une entrée ici. Aucun composant à
 * modifier.
 */
export const catalogueReleases: CatalogueRelease[] = [
  {
    slug: "feyme-mami-wata",
    title: "Mami Wata",
    artist: "Feyme",
    coverSrc: "/covers/feyme-mami-wata.avif",
  },
  {
    slug: "dreazy-youzou-bolingo",
    title: "Bolingo",
    artist: "Dreazy Youzou",
    coverSrc: "/covers/dreazy-youzou-bolingo.avif",
  },
  {
    slug: "mafia-kila-shiku",
    title: "Kila Shiku",
    artist: "Mafia",
    coverSrc: "/covers/mafia-kila-shiku.avif",
  },
  {
    slug: "skoty-bahker-fantome",
    title: "Fantôme",
    artist: "Skoty Bahker",
    coverSrc: "/covers/skoty-bahker-fantome.avif",
  },
  {
    slug: "arteast-music-cypher",
    title: "Cypher",
    artist: "Arteast Music",
    coverSrc: "/covers/arteast-music-cypher.avif",
  },
  {
    slug: "dreazy-youzou-nzambe",
    title: "Nzambe",
    artist: "Dreazy Youzou",
    coverSrc: "/covers/dreazy-youzou-nzambe.avif",
  },
  {
    slug: "mafia-belle-pdls",
    title: "Belle (PDLS)",
    artist: "Mafia",
    coverSrc: "/covers/mafia-belle-pdls.avif",
  },
  {
    slug: "skoty-bahker-bat-coeur",
    title: "Bat Cœur",
    artist: "Skoty Bahker",
    coverSrc: "/covers/skoty-bahker-bat-coeur.avif",
  },
  {
    slug: "skoty-bahker-mdma",
    title: "MDMA",
    artist: "Skoty Bahker",
    coverSrc: "/covers/skoty-bahker-mdma.avif",
  },
  {
    slug: "dreazy-x-king-dave-cherie-na-nga-fleurs",
    title: "Chérie Na Nga / Fleurs",
    artist: "Dreazy x King Dave",
    coverSrc: "/covers/dreazy-x-king-dave-cherie-na-nga-fleurs.avif",
  },
  {
    slug: "muphasa-unperfect",
    title: "Unperfect",
    artist: "Muphasa",
    coverSrc: "/covers/muphasa-unperfect.avif",
  },
  {
    slug: "dj-minho-x-hbeatz-breakfast",
    title: "Breakfast",
    artist: "DJ Minho x HBeatz",
    coverSrc: "/covers/dj-minho-x-hbeatz-breakfast.avif",
  },
  {
    slug: "sterkte-records-kulturre-vol-01",
    title: "Kulturre Vol. 01",
    artist: "Sterkte Records",
    coverSrc: "/covers/sterkte-records-kulturre-vol-01.avif",
    isCompilation: true,
  },
];
