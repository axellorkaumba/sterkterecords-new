/**
 * Analyse du signal décodé (Web Audio API) — silence, écrêtage, pics
 * anormaux, niveau sonore global (§11.4 étape 2). Fonctions pures, réutilisées
 * par les règles (`rules.ts`) et testables indépendamment.
 */

const SILENCE_THRESHOLD_LINEAR = 0.0032; // environ -50 dBFS
const CLIPPING_THRESHOLD_LINEAR = 0.999; // ~-0.01 dBFS, quasi pleine échelle

export function linearToDbfs(linear: number): number {
  if (linear <= 0) return -Infinity;
  return 20 * Math.log10(linear);
}

/** Durée du silence en tête (secondes), au sens amplitude sous le seuil. */
export function detectLeadingSilenceSeconds(samples: Float32Array, sampleRateHz: number): number {
  let index = 0;
  while (index < samples.length && Math.abs(samples[index]!) < SILENCE_THRESHOLD_LINEAR) {
    index += 1;
  }
  return index / sampleRateHz;
}

/** Durée du silence en fin (secondes). */
export function detectTrailingSilenceSeconds(samples: Float32Array, sampleRateHz: number): number {
  let index = samples.length - 1;
  while (index >= 0 && Math.abs(samples[index]!) < SILENCE_THRESHOLD_LINEAR) {
    index -= 1;
  }
  return (samples.length - 1 - index) / sampleRateHz;
}

export interface ClippingResult {
  clippedSampleCount: number;
  clippedPercent: number;
}

/** Compte les échantillons à (quasi) pleine échelle — signe d'écrêtage. */
export function detectClipping(samples: Float32Array): ClippingResult {
  let clippedSampleCount = 0;
  for (let i = 0; i < samples.length; i += 1) {
    if (Math.abs(samples[i]!) >= CLIPPING_THRESHOLD_LINEAR) clippedSampleCount += 1;
  }
  return {
    clippedSampleCount,
    clippedPercent: samples.length > 0 ? (clippedSampleCount / samples.length) * 100 : 0,
  };
}

export interface LoudnessEstimate {
  rmsDbfs: number;
  peakDbfs: number;
  /** Rapport crête/RMS — un ratio très élevé signale des pics isolés au-dessus du niveau général. */
  crestFactorDb: number;
}

/**
 * Estimation simplifiée du niveau sonore (RMS global → dBFS) et du facteur
 * de crête. Ce n'est PAS un calcul LUFS certifié ITU-R BS.1770 (qui exige un
 * filtre de pondération K + un portillonnage (gating) sur des blocs de
 * 400 ms) — c'est une approximation volontairement documentée comme telle,
 * suffisante pour repérer une piste anormalement faible/forte ou des pics
 * isolés, pas pour une certification broadcast.
 */
export function estimateLoudness(samples: Float32Array): LoudnessEstimate {
  let sumSquares = 0;
  let peak = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const value = samples[i]!;
    sumSquares += value * value;
    const absValue = Math.abs(value);
    if (absValue > peak) peak = absValue;
  }
  const rms = samples.length > 0 ? Math.sqrt(sumSquares / samples.length) : 0;
  const rmsDbfs = linearToDbfs(rms);
  const peakDbfs = linearToDbfs(peak);

  return { rmsDbfs, peakDbfs, crestFactorDb: peakDbfs - rmsDbfs };
}

/**
 * Détecte des pics isolés très au-dessus du RMS local (un "clic"/glitch
 * ponctuel plutôt qu'un signal fort et soutenu) — fenêtre glissante simple,
 * pas un algorithme psychoacoustique complet.
 */
export function detectAbnormalPeaks(samples: Float32Array, sampleRateHz: number): number {
  const windowSize = Math.floor(sampleRateHz * 0.05); // fenêtres de 50 ms
  if (windowSize <= 0) return 0;

  let abnormalWindows = 0;
  for (let start = 0; start < samples.length; start += windowSize) {
    const end = Math.min(start + windowSize, samples.length);
    let sumSquares = 0;
    let peak = 0;
    for (let i = start; i < end; i += 1) {
      const value = samples[i]!;
      sumSquares += value * value;
      const absValue = Math.abs(value);
      if (absValue > peak) peak = absValue;
    }
    const rms = Math.sqrt(sumSquares / (end - start));
    if (rms > 0 && peak / rms > 12 && peak > 0.5) {
      abnormalWindows += 1;
    }
  }
  return abnormalWindows;
}
