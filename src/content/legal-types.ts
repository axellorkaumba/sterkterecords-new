/**
 * Modèle de contenu pour les documents légaux (CGU, confidentialité,
 * mentions). Volontairement séparé du système de messages next-intl
 * (`src/i18n/messages/*.json`) : ce sont des articles longs, pas des
 * chaînes d'UI courtes — les mélanger aurait rendu le fichier de messages
 * illisible et aurait cassé l'ergonomie de `pnpm i18n:check`.
 *
 * Portée volontairement FR/EN uniquement (pas de lingala) : un document
 * juridique nécessite une traduction fidèle et validée juridiquement,
 * contrairement au contenu marketing — voir docs/adr/0006.
 *
 * Un paragraphe commençant par "• " est rendu comme item de liste par
 * `LegalDocumentView` plutôt que comme texte courant.
 */
export interface LegalTable {
  headers: string[];
  rows: string[][];
}

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  table?: LegalTable;
}

export interface LegalDocument {
  paragraphs?: string[];
  sections: LegalSection[];
}

export type LegalDocumentByLocale = Record<"fr" | "en", LegalDocument>;
