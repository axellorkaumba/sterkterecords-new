import type { ValidationRule } from "../types";
import type { ArtworkValidationContext } from "./context";

const MIN_DIMENSION_PX = 3000;
const RATIO_TOLERANCE = 0.01;
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = new Set(["image/jpeg", "image/png"]);
const MIN_BYTES_PER_PIXEL_BEFORE_WARNING = 0.08;
/** Variance du Laplacien (300 px de long côté) — voir pixel-analysis.ts. Seuil approximatif. */
const BLUR_VARIANCE_WARNING_THRESHOLD = 40;
/** Variance des niveaux de gris — en dessous, l'image est quasiment unie. */
const EMPTY_IMAGE_VARIANCE_THRESHOLD = 4;
const MARGIN_RATIO_WARNING_THRESHOLD = 0.6;

function rule(
  id: string,
  check: ValidationRule<ArtworkValidationContext>["check"],
): ValidationRule<ArtworkValidationContext> {
  return { id, category: "artwork", enabled: true, check };
}

export const ARTWORK_RULES: Array<ValidationRule<ArtworkValidationContext>> = [
  rule("artwork.integrity", (ctx) => {
    if (!ctx.decodeError) return [];
    return [
      {
        ruleId: "artwork.integrity",
        severity: "error",
        messageKey: "artwork.integrity.message",
        explanationKey: "artwork.integrity.explanation",
        suggestionKey: "artwork.integrity.suggestion",
      },
    ];
  }),

  rule("artwork.format", (ctx) => {
    if (ctx.decodeError || ACCEPTED_MIME_TYPES.has(ctx.mimeType)) return [];
    return [
      {
        ruleId: "artwork.format",
        severity: "error",
        messageKey: "artwork.format.message",
        explanationKey: "artwork.format.explanation",
        suggestionKey: "artwork.format.suggestion",
      },
    ];
  }),

  rule("artwork.dimensions", (ctx) => {
    if (ctx.decodeError) return [];
    if (ctx.widthPx >= MIN_DIMENSION_PX && ctx.heightPx >= MIN_DIMENSION_PX) return [];
    return [
      {
        ruleId: "artwork.dimensions",
        severity: "error",
        messageKey: "artwork.dimensions.message",
        messageValues: { width: ctx.widthPx, height: ctx.heightPx, min: MIN_DIMENSION_PX },
        explanationKey: "artwork.dimensions.explanation",
        suggestionKey: "artwork.dimensions.suggestion",
      },
    ];
  }),

  rule("artwork.ratio", (ctx) => {
    if (ctx.decodeError || ctx.widthPx === 0 || ctx.heightPx === 0) return [];
    const ratio = ctx.widthPx / ctx.heightPx;
    if (Math.abs(ratio - 1) <= RATIO_TOLERANCE) return [];
    return [
      {
        ruleId: "artwork.ratio",
        severity: "error",
        messageKey: "artwork.ratio.message",
        explanationKey: "artwork.ratio.explanation",
        suggestionKey: "artwork.ratio.suggestion",
      },
    ];
  }),

  rule("artwork.fileSize", (ctx) => {
    if (ctx.fileSizeBytes <= MAX_FILE_SIZE_BYTES) return [];
    return [
      {
        ruleId: "artwork.fileSize",
        severity: "warning",
        messageKey: "artwork.fileSize.message",
        messageValues: { megabytes: (ctx.fileSizeBytes / (1024 * 1024)).toFixed(1) },
        explanationKey: "artwork.fileSize.explanation",
        suggestionKey: "artwork.fileSize.suggestion",
      },
    ];
  }),

  rule("artwork.colorProfile", (ctx) => {
    if (ctx.decodeError) return [];
    const isCmyk = ctx.colorComponents === 4 || ctx.hasAdobeCmykMarker;
    if (!isCmyk) return [];
    return [
      {
        ruleId: "artwork.colorProfile",
        severity: "error",
        messageKey: "artwork.colorProfile.message",
        explanationKey: "artwork.colorProfile.explanation",
        suggestionKey: "artwork.colorProfile.suggestion",
      },
    ];
  }),

  rule("artwork.overCompressed", (ctx) => {
    if (ctx.decodeError || ctx.bytesPerPixel >= MIN_BYTES_PER_PIXEL_BEFORE_WARNING) return [];
    return [
      {
        ruleId: "artwork.overCompressed",
        severity: "warning",
        messageKey: "artwork.overCompressed.message",
        explanationKey: "artwork.overCompressed.explanation",
        suggestionKey: "artwork.overCompressed.suggestion",
      },
    ];
  }),

  rule("artwork.blur", (ctx) => {
    if (ctx.decodeError || ctx.blurVariance >= BLUR_VARIANCE_WARNING_THRESHOLD) return [];
    return [
      {
        ruleId: "artwork.blur",
        severity: "warning",
        messageKey: "artwork.blur.message",
        explanationKey: "artwork.blur.explanation",
        suggestionKey: "artwork.blur.suggestion",
      },
    ];
  }),

  rule("artwork.empty", (ctx) => {
    if (ctx.decodeError || ctx.pixelVariance >= EMPTY_IMAGE_VARIANCE_THRESHOLD) return [];
    return [
      {
        ruleId: "artwork.empty",
        severity: "error",
        messageKey: "artwork.empty.message",
        explanationKey: "artwork.empty.explanation",
        suggestionKey: "artwork.empty.suggestion",
      },
    ];
  }),

  rule("artwork.margins", (ctx) => {
    if (ctx.decodeError) return [];
    if (
      ctx.whiteMarginRatio < MARGIN_RATIO_WARNING_THRESHOLD &&
      ctx.transparentMarginRatio < MARGIN_RATIO_WARNING_THRESHOLD
    ) {
      return [];
    }
    return [
      {
        ruleId: "artwork.margins",
        severity: "warning",
        messageKey: "artwork.margins.message",
        explanationKey: "artwork.margins.explanation",
        suggestionKey: "artwork.margins.suggestion",
      },
    ];
  }),
];

/**
 * Règles envisagées avec Axel mais volontairement NON automatisées ce
 * sprint : détection de texte/logos de plateformes/URLs/QR codes/contenu
 * explicite/nudité/violence/filigrane et de pochettes déjà distribuées
 * ailleurs. Nécessitent OCR/vision par ordinateur (aucune fausse détection
 * simulée ici). L'architecture (`ValidationRule<ArtworkValidationContext>`)
 * n'a besoin d'aucun changement pour les activer plus tard : il suffira
 * d'ajouter un objet à `ARTWORK_RULES` dont le `check` appelle le service
 * de vision choisi. En attendant, `artwork-self-declaration.tsx`
 * (étape 5 du tunnel) fait cocher ces règles à l'artiste. Voir
 * docs/adr/0009-distribution-module.md.
 */
