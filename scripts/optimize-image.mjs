#!/usr/bin/env node
/**
 * Optimise une photo réelle (studio, artiste, backstage...) depuis
 * IMAGES/ vers public/<dossier>/<slug>.avif — réencodage AVIF, largeur
 * plafonnée pour rester raisonnable côté poids de page (§9 Perf CDC).
 *
 * Usage : node scripts/optimize-image.mjs "IMAGES/13 A LA PROD.jpg" studio 13-a-la-prod
 *         (source, dossier de sortie sous public/, slug de sortie)
 */
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MAX_WIDTH = 2000;

const [, , sourceArg, folderArg, slugArg] = process.argv;

if (!sourceArg || !folderArg || !slugArg) {
  console.error("Usage : node scripts/optimize-image.mjs <source> <dossier public/> <slug>");
  process.exit(1);
}

const sourcePath = path.isAbsolute(sourceArg) ? sourceArg : path.join(ROOT, sourceArg);
const outputDir = path.join(ROOT, "public", folderArg);
const outputPath = path.join(outputDir, `${slugArg}.avif`);

mkdirSync(outputDir, { recursive: true });

await sharp(sourcePath)
  .resize({ width: MAX_WIDTH, withoutEnlargement: true })
  .avif({ quality: 60 })
  .toFile(outputPath);

console.log(`✓ ${sourceArg} → public/${folderArg}/${slugArg}.avif`);
