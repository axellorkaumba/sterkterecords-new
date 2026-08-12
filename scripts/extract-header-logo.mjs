#!/usr/bin/env node
/**
 * Source (mise à jour par Axel, 2026-08-13) : deux fichiers séparés dans
 * `IMAGES/` au lieu de l'ancien `logo.header.svg` (un seul fichier à deux
 * rasters embarqués, voir git history si besoin de comparer) —
 * `STERKTE RECORDS HEADER BLACK.svg` (lockup complet couleur, avec slogan
 * "Distribute. Discover. Connect.") et `STERKTE RECORDS HEADER WHITE.svg`.
 *
 * Le fichier WHITE fourni est cassé (vérifié au rendu réel dans Chrome, pas
 * seulement via sharp/librsvg) : il ne contient qu'une fraction du lockup
 * ("STERKTE" + le rond jaune, sans "RECORDS" ni le slogan) et pas en blanc.
 * Faute de export correct, la version blanche (thème sombre) est donc
 * dérivée ici du fichier BLACK (qui, lui, est correct) : on garde son alpha
 * (donc la silhouette exacte du logo) et on force le RGB à blanc pur. Si un
 * export WHITE.svg correct arrive un jour, retirer `deriveWhite()` et
 * rasteriser directement ce fichier comme pour BLACK.
 */
import { readFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SOURCE = path.join(ROOT, "IMAGES", "STERKTE RECORDS HEADER BLACK.svg");
const OUTPUT_DIR = path.join(ROOT, "public", "brand");
const MAX_WIDTH = 1200;
const RENDER_DENSITY = 300;

async function deriveWhite(colorPngPath, outFile) {
  const { data, info } = await sharp(colorPngPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  for (let i = 0; i < width * height; i += 1) {
    data[i * channels] = 255;
    data[i * channels + 1] = 255;
    data[i * channels + 2] = 255;
    // canal alpha (data[i * channels + 3]) inchangé — on garde la silhouette.
  }
  await sharp(data, { raw: { width, height, channels } }).png().toFile(outFile);
}

async function run() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const svgBuffer = readFileSync(SOURCE);
  const lightPath = path.join(OUTPUT_DIR, "logo-header-light.png");
  const darkPath = path.join(OUTPUT_DIR, "logo-header-dark.png");

  await sharp(svgBuffer, { density: RENDER_DENSITY })
    .trim()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .png()
    .toFile(lightPath);

  await deriveWhite(lightPath, darkPath);

  console.log("✓ STERKTE RECORDS HEADER BLACK.svg → public/brand/logo-header-light.png");
  console.log("✓ (blanc dérivé)                  → public/brand/logo-header-dark.png");
  console.log(
    "  Penser à mettre à jour NATURAL_WIDTH/NATURAL_HEIGHT dans logo-wordmark.tsx si l'aspect ratio a changé.",
  );
}

run();
