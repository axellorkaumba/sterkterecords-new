#!/usr/bin/env node
/**
 * `IMAGES/logo.header.svg` est le vrai lockup horizontal une ligne
 * "Sterkte Records" (avec le médaillon porte-note intégré dans le "S").
 * Contrairement aux autres logos de `IMAGES/` (un seul raster embarqué),
 * ce fichier en embarque DEUX, tous deux 1568x643, fond noir plein cadre :
 *   - raster 0 : version blanche (texte blanc sur fond noir) — sert de
 *     pochoir : sa luminance (blanc=encre, noir=fond) devient le canal
 *     alpha.
 *   - raster 1 : version couleur réelle (rouge/jaune/noir) — mais son
 *     encre noire (le texte) est littéralement la même couleur que son
 *     propre fond noir, donc impossible à isoler par la seule couleur.
 * En combinant le RGB du raster 1 avec l'alpha dérivé du raster 0 (exactement
 * la technique de masquage par luminance déjà utilisée dans le SVG source),
 * on obtient un logo couleur à fond réellement transparent.
 *
 * Deux exports : un blanc (thème sombre, par défaut du site) et un couleur
 * (thème clair) — même logique qu'`extract-covers.mjs`/le médaillon de
 * ADR 0023, la marque n'ayant pas un unique jeu de couleurs qui fonctionne
 * sur les deux fonds.
 */
import { readFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SOURCE = path.join(ROOT, "IMAGES", "logo.header.svg");
const OUTPUT_DIR = path.join(ROOT, "public", "brand");
const MAX_WIDTH = 1200;

function extractEmbeddedRasters(svgContent) {
  const matches = [
    ...svgContent.matchAll(/(?:xlink:href|href)="data:(image\/[a-z]+);base64,([^"]+)"/g),
  ];
  return matches.map((m) => Buffer.from(m[2], "base64"));
}

async function run() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const svgContent = readFileSync(SOURCE, "utf8");
  const [whiteRaster, colorRaster] = extractEmbeddedRasters(svgContent);
  if (!whiteRaster || !colorRaster) {
    console.error("✗ Attendu 2 rasters embarqués dans logo.header.svg, trouvé moins.");
    process.exitCode = 1;
    return;
  }

  const { data: alpha, info } = await sharp(whiteRaster)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixelCount = info.width * info.height;

  // Composition manuelle des canaux (plutôt que `.joinChannel()`/`.composite()`) :
  // testé peu fiable pour attacher un canal alpha brut à une base RGB à 3
  // canaux avec sharp (fonctionnait pour la base 1-canal, pas pour la base
  // RGB — comportement non documenté). Construire le buffer RGBA à la main
  // élimine toute ambiguïté.
  async function buildTransparent(rgbBuffer, outFile) {
    const { data: rgb } = await sharp(rgbBuffer)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const rgba = Buffer.alloc(pixelCount * 4);
    for (let i = 0; i < pixelCount; i += 1) {
      rgba[i * 4] = rgb[i * 3];
      rgba[i * 4 + 1] = rgb[i * 3 + 1];
      rgba[i * 4 + 2] = rgb[i * 3 + 2];
      rgba[i * 4 + 3] = alpha[i];
    }

    await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
      .trim()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .png()
      .toFile(outFile);
  }

  await buildTransparent(whiteRaster, path.join(OUTPUT_DIR, "logo-header-dark.png"));
  await buildTransparent(colorRaster, path.join(OUTPUT_DIR, "logo-header-light.png"));

  console.log("✓ logo.header.svg → public/brand/logo-header-dark.png, logo-header-light.png");
}

run();
