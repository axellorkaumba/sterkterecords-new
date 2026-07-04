#!/usr/bin/env node
/**
 * Détecte les variables CSS custom properties auto-référencées
 * (`--x: var(--x);`) dans src/app/globals.css.
 *
 * Ce motif est silencieusement invalide en CSS : le navigateur ignore la
 * déclaration sans erreur de build, donc le bug ne se voit qu'à l'usage
 * (couleur/rayon manquant). Rencontré deux fois pendant le Sprint 0/1
 * (polices, puis rayons/ombres, puis `--info`) — d'où ce garde-fou
 * automatique plutôt qu'une simple vérification visuelle a posteriori.
 *
 * Utilisé par `pnpm css:check`, branché en pre-commit et en CI.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSS_FILE = path.join(__dirname, "..", "src", "app", "globals.css");

const content = readFileSync(CSS_FILE, "utf-8");
const declarationPattern = /--([a-zA-Z0-9-]+)\s*:\s*var\(--([a-zA-Z0-9-]+)\)/g;

const selfReferences = [];
let match;
while ((match = declarationPattern.exec(content)) !== null) {
  const [, declaredName, referencedName] = match;
  if (declaredName === referencedName) {
    const line = content.slice(0, match.index).split("\n").length;
    selfReferences.push({ line, name: declaredName });
  }
}

if (selfReferences.length > 0) {
  console.error("✗ Variables CSS auto-référencées trouvées dans globals.css :\n");
  for (const { line, name } of selfReferences) {
    console.error(`  - ligne ${line} : --${name}: var(--${name});`);
  }
  console.error(
    "\n[css:check] Une déclaration `--x: var(--x)` est silencieusement invalide " +
      "(le navigateur l'ignore sans erreur). Renomme soit la variable de marque " +
      "brute, soit le token sémantique, pour qu'ils diffèrent.",
  );
  process.exit(1);
}

console.log("✓ Aucune variable CSS auto-référencée dans globals.css.");
