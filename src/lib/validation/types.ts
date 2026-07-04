/**
 * Moteur de validation modulaire (§11.4 du CDC — validation automatique en
 * direct des pistes, pochettes et métadonnées). Décision produit (validée
 * par Axel, voir docs/adr/0009-distribution-module.md) : chaque règle est un
 * objet indépendant, activable/désactivable sans toucher au reste du
 * système, et le moteur ne connaît que cette interface — jamais la logique
 * métier d'une règle précise.
 *
 * Aucun message ne contient de texte en dur : les règles renvoient des CLÉS
 * i18n (`messageKey`/`explanationKey`/`suggestionKey`), jamais de chaînes
 * anglaises/françaises brutes — le composant d'affichage
 * (`ValidationReportView`) les traduit via `useTranslations("Validation")`.
 * Objectif explicite : aucun message du type "Validation Error", toujours
 * compréhensible par un artiste débutant.
 */

export type ValidationSeverity = "ok" | "warning" | "error";

export interface ValidationIssue {
  /** Identifiant stable de la règle qui a produit ce résultat (ex. "audio.clipping"). */
  ruleId: string;
  severity: ValidationSeverity;
  /** Clé i18n sous `Validation.messages.*`. */
  messageKey: string;
  /** Variables interpolées dans le message (ex. { detected: "3200×3198" }). */
  messageValues?: Record<string, string | number>;
  /** Clé i18n sous `Validation.explanations.*` — pourquoi cette règle existe. */
  explanationKey?: string;
  /** Clé i18n sous `Validation.suggestions.*` — comment corriger. */
  suggestionKey?: string;
  /** Lien vers la règle DSP correspondante (aide contextuelle), si pertinent. */
  ruleUrl?: string;
}

export interface ValidationReport {
  status: ValidationSeverity;
  issues: ValidationIssue[];
  ranAt: string;
}

export interface ValidationRule<TContext> {
  id: string;
  category: string;
  /** Une règle désactivée n'est jamais exécutée — bascule sans supprimer de code. */
  enabled: boolean;
  check: (context: TContext) => Promise<ValidationIssue[]> | ValidationIssue[];
}

function worstSeverity(issues: ValidationIssue[]): ValidationSeverity {
  if (issues.some((issue) => issue.severity === "error")) return "error";
  if (issues.some((issue) => issue.severity === "warning")) return "warning";
  return "ok";
}

/**
 * Exécute un ensemble de règles contre un contexte donné. Générique sur
 * `TContext` : le même moteur sert l'audio, la pochette et les métadonnées,
 * chacun avec son propre jeu de règles et son propre contexte.
 */
export async function runValidation<TContext>(
  rules: Array<ValidationRule<TContext>>,
  context: TContext,
): Promise<ValidationReport> {
  const issues: ValidationIssue[] = [];

  for (const rule of rules) {
    if (!rule.enabled) continue;
    const result = await rule.check(context);
    issues.push(...result);
  }

  return { status: worstSeverity(issues), issues, ranAt: new Date().toISOString() };
}
