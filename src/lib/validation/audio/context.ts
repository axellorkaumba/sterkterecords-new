import { parseWavHeader } from "./wav-parser";
import { parseFlacHeader } from "./flac-parser";
import { parseMp3Header } from "./mp3-parser";

export type AudioFormat = "wav" | "flac" | "mp3" | "unknown";

export interface AudioValidationContext {
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  format: AudioFormat;
  /** `1` = PCM non compressé (WAV) — `null` si non applicable/détecté (§11.4 : vérification du codec). */
  pcmFormatCode: number | null;
  sampleRateHz: number | null;
  bitDepth: number | null;
  channels: number | null;
  /** Durée lue depuis l'en-tête/le frame — pas depuis le décodage complet. */
  declaredDurationSeconds: number | null;
  /** Durée réelle après décodage Web Audio API — sert à la cohérence déclarée/réelle. */
  decodedDurationSeconds: number | null;
  /** Échantillons du premier canal, pour l'analyse du signal — `null` si le décodage a échoué. */
  samples: Float32Array | null;
  sha256Hash: string;
  /** Hashes des autres pistes déjà ajoutées dans le même tunnel (doublons intra-envoi). */
  siblingHashes: string[];
  /** Hashes déjà présents dans le catalogue de l'artiste (doublons inter-sorties, via requête serveur). */
  catalogHashes: string[];
  decodeError: boolean;
  likelyVbr: boolean;
}

function detectFormat(file: File): AudioFormat {
  const name = file.name.toLowerCase();
  if (file.type === "audio/wav" || file.type === "audio/x-wav" || name.endsWith(".wav"))
    return "wav";
  if (file.type === "audio/flac" || name.endsWith(".flac")) return "flac";
  if (file.type === "audio/mpeg" || file.type === "audio/mp3" || name.endsWith(".mp3"))
    return "mp3";
  return "unknown";
}

async function sha256(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Construit le contexte d'analyse pour une piste (§11.4 étape 2). Tourne
 * côté client dès qu'un fichier est sélectionné — donne un retour immédiat
 * avant même que l'upload ne démarre.
 */
export async function buildAudioValidationContext(
  file: File,
  siblingHashes: string[],
  catalogHashes: string[],
): Promise<AudioValidationContext> {
  const buffer = await file.arrayBuffer();
  const format = detectFormat(file);

  let pcmFormatCode: number | null = null;
  let sampleRateHz: number | null = null;
  let bitDepth: number | null = null;
  let channels: number | null = null;
  let declaredDurationSeconds: number | null = null;
  let likelyVbr = false;

  if (format === "wav") {
    const header = parseWavHeader(buffer);
    if (header.valid) {
      pcmFormatCode = header.audioFormat;
      sampleRateHz = header.sampleRateHz;
      bitDepth = header.bitDepth;
      channels = header.channels;
      declaredDurationSeconds = header.durationSeconds;
    }
  } else if (format === "flac") {
    const header = parseFlacHeader(buffer);
    if (header.valid) {
      sampleRateHz = header.sampleRateHz;
      bitDepth = header.bitDepth;
      channels = header.channels;
      declaredDurationSeconds = header.durationSeconds;
    }
  } else if (format === "mp3") {
    const header = parseMp3Header(buffer);
    if (header.valid) {
      sampleRateHz = header.sampleRateHz;
      channels = header.channels;
      declaredDurationSeconds = header.estimatedDurationSeconds;
      likelyVbr = header.likelyVbr;
    }
  }

  const sha256Hash = await sha256(buffer);

  let samples: Float32Array | null = null;
  let decodedDurationSeconds: number | null = null;
  let decodeError = false;

  try {
    const AudioContextCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) throw new Error("AudioContext non supporté");
    const audioContext = new AudioContextCtor();
    const decoded = await audioContext.decodeAudioData(buffer.slice(0));
    samples = decoded.getChannelData(0);
    decodedDurationSeconds = decoded.duration;
    await audioContext.close();
  } catch {
    decodeError = true;
  }

  return {
    fileName: file.name,
    mimeType: file.type,
    fileSizeBytes: file.size,
    format,
    pcmFormatCode,
    sampleRateHz,
    bitDepth,
    channels,
    declaredDurationSeconds,
    decodedDurationSeconds,
    samples,
    sha256Hash,
    siblingHashes,
    catalogHashes,
    decodeError,
    likelyVbr,
  };
}
