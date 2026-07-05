/** Signature minimale compatible avec le retour de `createTranslator` (next-intl), sans dépendre de son type exact dans chaque gabarit. */
export type EmailTranslator = (key: string, values?: Record<string, string | number>) => string;

export interface BaseEmailProps {
  locale: string;
  t: EmailTranslator;
}
