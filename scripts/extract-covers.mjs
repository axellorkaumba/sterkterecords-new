#!/usr/bin/env node
/**
 * Les fichiers de `IMAGES/COVERS/*.svg` ne sont pas de vrais vectoriels :
 * ce sont des JPEG/PNG encodés en base64 et enveloppés dans une balise
 * `<image>` (export brut d'un outil de maquette). `next/image` ne peut pas
 * ré-encoder un raster empaqueté dans du SVG, donc ce script extrait le
 * raster embarqué, le redimensionne à une largeur web raisonnable, et
 * l'écrit dans `public/covers/<slug>.avif`.
 *
 * Redessiné pour être relançable : si Axel ajoute une nouvelle pochette
 * dans `IMAGES/COVERS/`, il suffit d'ajouter son slug dans `COVER_SLUGS`
 * ci-dessous puis de relancer `node scripts/extract-covers.mjs`.
 */
import { readFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SOURCE_DIR = path.join(ROOT, "IMAGES", "COVERS");
const OUTPUT_DIR = path.join(ROOT, "public", "covers");
const MAX_WIDTH = 1200;

/** Nom de fichier source (dans IMAGES/COVERS/) -> slug de sortie propre. */
const COVER_SLUGS = {
  "ARTEAST MUSIC - CYPHER.svg": "arteast-music-cypher",
  "DJ MINHO x HBEATZ - BREAKFAST.svg": "dj-minho-x-hbeatz-breakfast",
  "DREAZY YOUZOU - BOLINGO.svg": "dreazy-youzou-bolingo",
  "DREAZY YOUZOU - NZAMBE.svg": "dreazy-youzou-nzambe",
  "DREAZY x KING DAVE - CHERIE NA NGA _ FLEURS.svg": "dreazy-x-king-dave-cherie-na-nga-fleurs",
  "FEYME - MAMI WATA.svg": "feyme-mami-wata",
  "MAFIA - BELLE_PDLS.svg": "mafia-belle-pdls",
  "MAFIA - KILA SHIKU.svg": "mafia-kila-shiku",
  "MUPHASA - UNPERFECT.svg": "muphasa-unperfect",
  "SKOTY BAHKER - BAT COEUR.svg": "skoty-bahker-bat-coeur",
  "SKOTY BAHKER - FANTOME.svg": "skoty-bahker-fantome",
  "SKOTY BAHKER - MDMA.svg": "skoty-bahker-mdma",
  "STERKTE RECORDS - KULTURRE Vol. 01.svg": "sterkte-records-kulturre-vol-01",
};

function extractEmbeddedRaster(svgContent) {
  const match = svgContent.match(/(?:xlink:href|href)="data:(image\/[a-z]+);base64,([^"]+)"/);
  if (!match) return null;
  return { mime: match[1], buffer: Buffer.from(match[2], "base64") };
}

async function run() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const entries = Object.entries(COVER_SLUGS);
  let ok = 0;
  for (const [filename, slug] of entries) {
    const sourcePath = path.join(SOURCE_DIR, filename);
    let svgContent;
    try {
      svgContent = readFileSync(sourcePath, "utf8");
    } catch {
      console.error(`✗ Introuvable : ${filename}`);
      continue;
    }

    const raster = extractEmbeddedRaster(svgContent);
    if (!raster) {
      console.error(`✗ Aucun raster embarqué trouvé dans : ${filename}`);
      continue;
    }

    const outputPath = path.join(OUTPUT_DIR, `${slug}.avif`);
    await sharp(raster.buffer)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .avif({ quality: 62 })
      .toFile(outputPath);

    ok += 1;
    console.log(`✓ ${filename} → public/covers/${slug}.avif`);
  }

  console.log(`\n${ok}/${entries.length} pochettes extraites avec succès.`);
  if (ok !== entries.length) process.exitCode = 1;
}

run();
