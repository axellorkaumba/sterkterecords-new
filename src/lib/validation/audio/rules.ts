import type { ValidationIssue, ValidationRule } from "../types";
import type { AudioValidationContext } from "./context";
import { detectAbnormalPeaks, estimateLoudness } from "./signal-analysis";

const ACCEPTED_FORMATS = new Set(["wav", "flac", "mp3"]);
const MIN_RECOMMENDED_SAMPLE_RATE_HZ = 44100;
const MIN_RECOMMENDED_BIT_DEPTH = 16;
const MIN_DURATION_SECONDS = 1;
const DURATION_CONSISTENCY_TOLERANCE_SECONDS = 2;

function rule(
  id: string,
  check: ValidationRule<AudioValidationContext>["check"],
): ValidationRule<AudioValidationContext> {
  return { id, category: "audio", enabled: true, check };
}

export const AUDIO_RULES: Array<ValidationRule<AudioValidationContext>> = [
  rule("audio.format", (ctx) => {
    if (ACCEPTED_FORMATS.has(ctx.format)) return [];
    return [
      {
        ruleId: "audio.format",
        severity: "error",
        messageKey: "audio.format.message",
        explanationKey: "audio.format.explanation",
        suggestionKey: "audio.format.suggestion",
      },
    ];
  }),

  rule("audio.codec", (ctx) => {
    if (ctx.format !== "wav" || ctx.pcmFormatCode === null) return [];
    // 1 = PCM, 0xFFFE = WAVE_FORMAT_EXTENSIBLE (généralement du PCM aussi).
    if (ctx.pcmFormatCode === 1 || ctx.pcmFormatCode === 0xfffe) return [];
    return [
      {
        ruleId: "audio.codec",
        severity: "warning",
        messageKey: "audio.codec.message",
        explanationKey: "audio.codec.explanation",
        suggestionKey: "audio.codec.suggestion",
      },
    ];
  }),

  rule("audio.sampleRate", (ctx) => {
    if (ctx.sampleRateHz === null) return [];
    if (ctx.sampleRateHz >= MIN_RECOMMENDED_SAMPLE_RATE_HZ) return [];
    return [
      {
        ruleId: "audio.sampleRate",
        severity: "warning",
        messageKey: "audio.sampleRate.message",
        messageValues: { value: ctx.sampleRateHz },
        explanationKey: "audio.sampleRate.explanation",
        suggestionKey: "audio.sampleRate.suggestion",
      },
    ];
  }),

  rule("audio.bitDepth", (ctx) => {
    if (ctx.bitDepth === null || ctx.format === "mp3") return [];
    if (ctx.bitDepth >= MIN_RECOMMENDED_BIT_DEPTH) return [];
    return [
      {
        ruleId: "audio.bitDepth",
        severity: "warning",
        messageKey: "audio.bitDepth.message",
        messageValues: { value: ctx.bitDepth },
        explanationKey: "audio.bitDepth.explanation",
        suggestionKey: "audio.bitDepth.suggestion",
      },
    ];
  }),

  rule("audio.duration", (ctx) => {
    const duration = ctx.decodedDurationSeconds ?? ctx.declaredDurationSeconds;
    if (duration === null) return [];
    if (duration < MIN_DURATION_SECONDS) {
      return [
        {
          ruleId: "audio.duration",
          severity: "error",
          messageKey: "audio.duration.tooShort.message",
          explanationKey: "audio.duration.tooShort.explanation",
          suggestionKey: "audio.duration.tooShort.suggestion",
        },
      ];
    }
    return [];
  }),

  rule("audio.abnormalPeaks", (ctx) => {
    if (!ctx.samples || !ctx.sampleRateHz) return [];
    const count = detectAbnormalPeaks(ctx.samples, ctx.sampleRateHz);
    if (count === 0) return [];
    return [
      {
        ruleId: "audio.abnormalPeaks",
        severity: "warning",
        messageKey: "audio.abnormalPeaks.message",
        messageValues: { count },
        explanationKey: "audio.abnormalPeaks.explanation",
        suggestionKey: "audio.abnormalPeaks.suggestion",
      },
    ];
  }),

  rule("audio.loudness", (ctx) => {
    if (!ctx.samples) return [];
    const { rmsDbfs } = estimateLoudness(ctx.samples);
    const issues: ValidationIssue[] = [];
    if (rmsDbfs < -35) {
      issues.push({
        ruleId: "audio.loudness",
        severity: "warning",
        messageKey: "audio.loudness.tooQuiet.message",
        messageValues: { value: rmsDbfs.toFixed(1) },
        explanationKey: "audio.loudness.tooQuiet.explanation",
        suggestionKey: "audio.loudness.tooQuiet.suggestion",
      });
    } else if (rmsDbfs > -6) {
      issues.push({
        ruleId: "audio.loudness",
        severity: "warning",
        messageKey: "audio.loudness.tooLoud.message",
        messageValues: { value: rmsDbfs.toFixed(1) },
        explanationKey: "audio.loudness.tooLoud.explanation",
        suggestionKey: "audio.loudness.tooLoud.suggestion",
      });
    }
    return issues;
  }),

  rule("audio.duplicateInBatch", (ctx) => {
    if (ctx.siblingHashes.includes(ctx.sha256Hash)) {
      return [
        {
          ruleId: "audio.duplicateInBatch",
          severity: "error",
          messageKey: "audio.duplicateInBatch.message",
          explanationKey: "audio.duplicateInBatch.explanation",
          suggestionKey: "audio.duplicateInBatch.suggestion",
        },
      ];
    }
    return [];
  }),

  rule("audio.duplicateInCatalog", (ctx) => {
    if (ctx.catalogHashes.includes(ctx.sha256Hash)) {
      return [
        {
          ruleId: "audio.duplicateInCatalog",
          severity: "warning",
          messageKey: "audio.duplicateInCatalog.message",
          explanationKey: "audio.duplicateInCatalog.explanation",
          suggestionKey: "audio.duplicateInCatalog.suggestion",
        },
      ];
    }
    return [];
  }),

  rule("audio.integrity", (ctx) => {
    if (!ctx.decodeError) return [];
    return [
      {
        ruleId: "audio.integrity",
        severity: "error",
        messageKey: "audio.integrity.message",
        explanationKey: "audio.integrity.explanation",
        suggestionKey: "audio.integrity.suggestion",
      },
    ];
  }),

  rule("audio.durationConsistency", (ctx) => {
    if (ctx.declaredDurationSeconds === null || ctx.decodedDurationSeconds === null) return [];
    const delta = Math.abs(ctx.declaredDurationSeconds - ctx.decodedDurationSeconds);
    if (delta <= DURATION_CONSISTENCY_TOLERANCE_SECONDS) return [];
    return [
      {
        ruleId: "audio.durationConsistency",
        severity: "warning",
        messageKey: "audio.durationConsistency.message",
        explanationKey: "audio.durationConsistency.explanation",
        suggestionKey: "audio.durationConsistency.suggestion",
      },
    ];
  }),
];

/**
 * Règles envisagées mais volontairement non construites ce sprint (validé
 * avec Axel) : elles concernent l'audio (empreinte acoustique/fingerprinting
 * pour repérer un remix ou un sample non déclaré) et nécessiteraient un
 * service tiers spécialisé (type Chromaprint/AcoustID). Pas de stub
 * simulé — voir docs/adr/0009-distribution-module.md.
 */
