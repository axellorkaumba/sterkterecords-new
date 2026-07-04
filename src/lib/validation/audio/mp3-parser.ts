/**
 * Parsing du premier frame header MPEG audio valide d'un fichier MP3 —
 * donne sample rate/bitrate/canaux. Le MP3 n'a pas de "bit depth" au sens
 * WAV/FLAC (codec à pertes) : les DSP le tolèrent mais le CDC le classe
 * en dernier choix ("WAV recommandé, FLAC, MP3 également acceptés").
 *
 * Durée estimée via `tailleFichier / bitrate` : exacte pour un MP3 CBR,
 * approximative pour un VBR (une lecture précise nécessiterait de scanner
 * tous les frames ou l'en-tête Xing/VBRI — hors scope, documenté comme tel).
 *
 * Référence tables bitrate/samplerate : http://www.mp3-tech.org/programmer/frame_header.html
 */
export interface Mp3HeaderInfo {
  valid: boolean;
  sampleRateHz: number | null;
  bitrateKbps: number | null;
  channels: number | null;
  estimatedDurationSeconds: number | null;
  /** Vrai si un en-tête Xing/VBRI a été repéré (bitrate probablement variable). */
  likelyVbr: boolean;
}

const BITRATE_TABLE_V1_L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
const SAMPLE_RATE_TABLE_MPEG1 = [44100, 48000, 32000, 0];

export function parseMp3Header(buffer: ArrayBuffer): Mp3HeaderInfo {
  const invalid: Mp3HeaderInfo = {
    valid: false,
    sampleRateHz: null,
    bitrateKbps: null,
    channels: null,
    estimatedDurationSeconds: null,
    likelyVbr: false,
  };

  const bytes = new Uint8Array(buffer);
  let offset = 0;

  // ID3v2 éventuel en tête de fichier : sauté via sa taille déclarée (synchsafe).
  if (bytes.length > 10 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    const size =
      ((bytes[6]! & 0x7f) << 21) |
      ((bytes[7]! & 0x7f) << 14) |
      ((bytes[8]! & 0x7f) << 7) |
      (bytes[9]! & 0x7f);
    offset = 10 + size;
  }

  for (; offset < bytes.length - 4; offset += 1) {
    if (bytes[offset] !== 0xff || (bytes[offset + 1]! & 0xe0) !== 0xe0) continue;

    const b2 = bytes[offset + 1]!;
    const b3 = bytes[offset + 2]!;
    const b4 = bytes[offset + 3]!;

    const versionBits = (b2 >> 3) & 0x03;
    const layerBits = (b2 >> 1) & 0x03;
    if (versionBits === 1 || layerBits === 0) continue; // combinaisons réservées

    const isMpeg1 = versionBits === 3;
    const isLayer3 = layerBits === 1;

    const bitrateIndex = (b3 >> 4) & 0x0f;
    const sampleRateIndex = (b3 >> 2) & 0x03;
    if (bitrateIndex === 0 || bitrateIndex === 15 || sampleRateIndex === 3) continue;

    const bitrateKbps = isMpeg1 && isLayer3 ? BITRATE_TABLE_V1_L3[bitrateIndex]! : null;
    const baseSampleRate = SAMPLE_RATE_TABLE_MPEG1[sampleRateIndex]!;
    const sampleRateHz = isMpeg1 ? baseSampleRate : baseSampleRate / 2;

    if (!bitrateKbps || !sampleRateHz) continue;

    const channelMode = (b4 >> 6) & 0x03;
    const channels = channelMode === 3 ? 1 : 2;

    const likelyVbr =
      bytes.length > offset + 40 &&
      ["Xing", "Info", "VBRI"].some((tag) =>
        Array.from(tag).every((char, i) => bytes[offset + 4 + i] === char.charCodeAt(0)),
      );

    const estimatedDurationSeconds = (bytes.length * 8) / (bitrateKbps * 1000);

    return {
      valid: true,
      sampleRateHz,
      bitrateKbps,
      channels,
      estimatedDurationSeconds,
      likelyVbr,
    };
  }

  return invalid;
}
