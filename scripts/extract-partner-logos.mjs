#!/usr/bin/env node
/**
 * Les logos partenaires de `IMAGES/` suivent le même schéma que les
 * pochettes (`extract-covers.mjs`) : un raster encodé en base64 enveloppé
 * dans une balise `<image>` d'un SVG — sauf qu'ici le raster est déjà un
 * monochrome blanc sur fond noir plein cadre (vérifié visuellement).
 * Ce script extrait le raster, recadre le padding noir (`.trim()`) pour ne
 * garder que le tracé du logo, et exporte en PNG (pas AVIF : le rendu
 * `mix-blend-mode: screen` en CSS a besoin d'un fond réellement noir
 * `#000000`, qu'AVIF peut légèrement altérer par compression avec perte).
 */
import { readFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SOURCE_DIR = path.join(ROOT, "IMAGES");
const OUTPUT_DIR = path.join(ROOT, "public", "partners");
const MAX_HEIGHT = 240;

const LOGO_SLUGS = {
  "Logo ARTEAST 1.svg": "arteast",
  "Logo GC 1.svg": "gc",
  "Logo IF 1.svg": "if",
  "Logo MP 1.svg": "mp",
  "Logo ReedSIGNATURE.svg": "reedsignature",
  "Logo Reservo 1.svg": "reservo",
  "Logo SV 1.svg": "sv",
};

function extractEmbeddedRaster(svgContent) {
  const match = svgContent.match(/(?:xlink:href|href)="data:(image\/[a-z]+);base64,([^"]+)"/);
  if (!match) return null;
  return { mime: match[1], buffer: Buffer.from(match[2], "base64") };
}

async function run() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  let ok = 0;
  const entries = Object.entries(LOGO_SLUGS);
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

    const outputPath = path.join(OUTPUT_DIR, `${slug}.png`);
    await sharp(raster.buffer)
      .trim({ background: "#000000", threshold: 10 })
      .resize({ height: MAX_HEIGHT, withoutEnlargement: true })
      .png()
      .toFile(outputPath);

    ok += 1;
    console.log(`✓ ${filename} → public/partners/${slug}.png`);
  }

  console.log(`\n${ok}/${entries.length} logos partenaires extraits avec succès.`);
  if (ok !== entries.length) process.exitCode = 1;
}

run();
