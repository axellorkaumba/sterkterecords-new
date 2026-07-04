#!/usr/bin/env node
/**
 * Vérifie que src/i18n/messages/{fr,en,ln}.json ont exactement les mêmes
 * clés (récursivement). Politique décidée dans
 * docs/adr/0004-i18n-content-policy.md : fr/en servent de référence
 * complète, ln peut avoir des valeurs "TODO(ln): ..." mais JAMAIS une clé
 * en plus ou en moins — sinon useTranslations() plante en silence à
 * l'exécution pour une seule langue, en général découvert en prod.
 *
 * Utilisé par `pnpm i18n:check` et par la CI (.github/workflows/ci.yml).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = path.join(__dirname, "..", "src", "i18n", "messages");
const LOCALES = ["fr", "en", "ln"];
const REFERENCE_LOCALE = "fr";

/** Ignoré dans la comparaison : métadonnée de statut, pas une clé de contenu. */
const IGNORED_TOP_LEVEL_KEYS = new Set(["_status"]);

function collectKeyPaths(value, prefix = "") {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return [prefix];
  }
  return Object.entries(value).flatMap(([key, child]) => {
    if (prefix === "" && IGNORED_TOP_LEVEL_KEYS.has(key)) return [];
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    return collectKeyPaths(child, nextPrefix);
  });
}

function loadKeySet(locale) {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  const content = JSON.parse(readFileSync(filePath, "utf-8"));
  return new Set(collectKeyPaths(content));
}

function diffSets(a, b) {
  return [...a].filter((key) => !b.has(key));
}

const referenceKeys = loadKeySet(REFERENCE_LOCALE);
let hasError = false;

for (const locale of LOCALES) {
  if (locale === REFERENCE_LOCALE) continue;

  const keys = loadKeySet(locale);
  const missing = diffSets(referenceKeys, keys);
  const extra = diffSets(keys, referenceKeys);

  if (missing.length > 0 || extra.length > 0) {
    hasError = true;
    console.error(`\n✗ ${locale}.json ne correspond pas à ${REFERENCE_LOCALE}.json :`);
    if (missing.length > 0) {
      console.error(`  Clés manquantes (${missing.length}) :`);
      for (const key of missing) console.error(`    - ${key}`);
    }
    if (extra.length > 0) {
      console.error(`  Clés en trop (${extra.length}) :`);
      for (const key of extra) console.error(`    - ${key}`);
    }
  }
}

if (hasError) {
  console.error(
    "\n[i18n:check] Échec — voir docs/adr/0004-i18n-content-policy.md. " +
      "Les 3 fichiers de messages doivent avoir exactement les mêmes clés.",
  );
  process.exit(1);
}

console.log(`✓ Parité i18n OK — ${referenceKeys.size} clés identiques dans ${LOCALES.join(", ")}.`);
