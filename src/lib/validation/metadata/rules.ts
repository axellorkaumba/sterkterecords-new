import type { ValidationIssue, ValidationRule } from "../types";
import type { MetadataValidationContext } from "./context";
import { isValidIsrcFormat, isValidUpcA } from "./checksums";

const FEATURING_TITLE_PATTERN = /\b(feat\.?|ft\.?|featuring)\b/i;

function rule(
  id: string,
  check: ValidationRule<MetadataValidationContext>["check"],
): ValidationRule<MetadataValidationContext> {
  return { id, category: "metadata", enabled: true, check };
}

export const METADATA_RULES: Array<ValidationRule<MetadataValidationContext>> = [
  rule("metadata.requiredFields", (ctx) => {
    const issues: ValidationIssue[] = [];
    if (!ctx.release.title.trim()) {
      issues.push({
        ruleId: "metadata.requiredFields",
        severity: "error",
        messageKey: "metadata.requiredFields.releaseTitle.message",
        suggestionKey: "metadata.requiredFields.releaseTitle.suggestion",
      });
    }
    if (!ctx.release.genre.trim()) {
      issues.push({
        ruleId: "metadata.requiredFields",
        severity: "error",
        messageKey: "metadata.requiredFields.genre.message",
        suggestionKey: "metadata.requiredFields.genre.suggestion",
      });
    }
    if (!ctx.release.language.trim()) {
      issues.push({
        ruleId: "metadata.requiredFields",
        severity: "error",
        messageKey: "metadata.requiredFields.language.message",
        suggestionKey: "metadata.requiredFields.language.suggestion",
      });
    }
    ctx.tracks.forEach((track, index) => {
      if (!track.title.trim()) {
        issues.push({
          ruleId: "metadata.requiredFields",
          severity: "error",
          messageKey: "metadata.requiredFields.trackTitle.message",
          messageValues: { position: index + 1 },
          suggestionKey: "metadata.requiredFields.trackTitle.suggestion",
        });
      }
    });
    return issues;
  }),

  rule("metadata.mainArtistConsistency", (ctx) => {
    const issues: ValidationIssue[] = [];
    ctx.tracks.forEach((track, index) => {
      const hasMainArtist = track.contributors.some((c) => c.role === "main_artist");
      if (!hasMainArtist) {
        issues.push({
          ruleId: "metadata.mainArtistConsistency",
          severity: "error",
          messageKey: "metadata.mainArtistConsistency.message",
          messageValues: { position: index + 1 },
          explanationKey: "metadata.mainArtistConsistency.explanation",
          suggestionKey: "metadata.mainArtistConsistency.suggestion",
        });
      }
    });
    return issues;
  }),

  rule("metadata.featuringConsistency", (ctx) => {
    const issues: ValidationIssue[] = [];
    ctx.tracks.forEach((track, index) => {
      const titleMentionsFeaturing = FEATURING_TITLE_PATTERN.test(track.title);
      const hasFeaturingContributor = track.contributors.some((c) => c.role === "featuring");
      if (titleMentionsFeaturing && !hasFeaturingContributor) {
        issues.push({
          ruleId: "metadata.featuringConsistency",
          severity: "warning",
          messageKey: "metadata.featuringConsistency.message",
          messageValues: { position: index + 1 },
          explanationKey: "metadata.featuringConsistency.explanation",
          suggestionKey: "metadata.featuringConsistency.suggestion",
        });
      }
    });
    return issues;
  }),

  rule("metadata.explicitConsistency", (ctx) => {
    const anyTrackExplicit = ctx.tracks.some((track) => track.explicit);
    if (!anyTrackExplicit || ctx.release.explicit) return [];
    return [
      {
        ruleId: "metadata.explicitConsistency",
        severity: "warning",
        messageKey: "metadata.explicitConsistency.message",
        explanationKey: "metadata.explicitConsistency.explanation",
        suggestionKey: "metadata.explicitConsistency.suggestion",
      },
    ];
  }),

  rule("metadata.dateConsistency", (ctx) => {
    if (!ctx.release.recordingDate || !ctx.release.releaseDate) return [];
    const recording = new Date(ctx.release.recordingDate);
    const release = new Date(ctx.release.releaseDate);
    if (recording.getTime() <= release.getTime()) return [];
    return [
      {
        ruleId: "metadata.dateConsistency",
        severity: "error",
        messageKey: "metadata.dateConsistency.message",
        explanationKey: "metadata.dateConsistency.explanation",
        suggestionKey: "metadata.dateConsistency.suggestion",
      },
    ];
  }),

  rule("metadata.isrcFormat", (ctx) => {
    const issues: ValidationIssue[] = [];
    ctx.tracks.forEach((track, index) => {
      if (!track.isrc) return; // ISRC auto-généré si absent — pas d'erreur.
      if (isValidIsrcFormat(track.isrc)) return;
      issues.push({
        ruleId: "metadata.isrcFormat",
        severity: "error",
        messageKey: "metadata.isrcFormat.message",
        messageValues: { position: index + 1, value: track.isrc },
        explanationKey: "metadata.isrcFormat.explanation",
        suggestionKey: "metadata.isrcFormat.suggestion",
      });
    });
    return issues;
  }),

  rule("metadata.upcFormat", (ctx) => {
    if (!ctx.upc) return []; // UPC auto-généré si absent — pas d'erreur.
    if (isValidUpcA(ctx.upc)) return [];
    return [
      {
        ruleId: "metadata.upcFormat",
        severity: "error",
        messageKey: "metadata.upcFormat.message",
        messageValues: { value: ctx.upc },
        explanationKey: "metadata.upcFormat.explanation",
        suggestionKey: "metadata.upcFormat.suggestion",
      },
    ];
  }),

  rule("metadata.splitsSum", (ctx) => {
    const issues: ValidationIssue[] = [];
    ctx.tracks.forEach((track, index) => {
      if (track.contributors.length === 0) return;
      const sum = track.contributors.reduce((total, c) => total + c.splitPct, 0);
      if (Math.abs(sum - 100) <= 0.01) return;
      issues.push({
        ruleId: "metadata.splitsSum",
        severity: "error",
        messageKey: "metadata.splitsSum.message",
        messageValues: { position: index + 1, sum: sum.toFixed(1) },
        explanationKey: "metadata.splitsSum.explanation",
        suggestionKey: "metadata.splitsSum.suggestion",
      });
    });
    return issues;
  }),

  rule("metadata.duplicateIsrc", (ctx) => {
    const issues: ValidationIssue[] = [];
    ctx.tracks.forEach((track, index) => {
      if (!track.isrc) return;
      if (!ctx.existingIsrcs.includes(track.isrc)) return;
      issues.push({
        ruleId: "metadata.duplicateIsrc",
        severity: "error",
        messageKey: "metadata.duplicateIsrc.message",
        messageValues: { position: index + 1 },
        explanationKey: "metadata.duplicateIsrc.explanation",
        suggestionKey: "metadata.duplicateIsrc.suggestion",
      });
    });
    return issues;
  }),

  rule("metadata.duplicateUpc", (ctx) => {
    if (!ctx.upc || !ctx.existingUpcs.includes(ctx.upc)) return [];
    return [
      {
        ruleId: "metadata.duplicateUpc",
        severity: "error",
        messageKey: "metadata.duplicateUpc.message",
        explanationKey: "metadata.duplicateUpc.explanation",
        suggestionKey: "metadata.duplicateUpc.suggestion",
      },
    ];
  }),

  rule("metadata.duplicateTitle", (ctx) => {
    const normalizedTitle = ctx.release.title.trim().toLowerCase();
    if (!normalizedTitle) return [];
    const isDuplicate = ctx.existingTitles.some(
      (title) => title.trim().toLowerCase() === normalizedTitle,
    );
    if (!isDuplicate) return [];
    return [
      {
        ruleId: "metadata.duplicateTitle",
        severity: "warning",
        messageKey: "metadata.duplicateTitle.message",
        explanationKey: "metadata.duplicateTitle.explanation",
        suggestionKey: "metadata.duplicateTitle.suggestion",
      },
    ];
  }),
];
