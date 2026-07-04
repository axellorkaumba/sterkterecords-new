/**
 * Parsing réel de l'en-tête WAV (RIFF/WAVE) — lit les octets du fichier
 * directement (pas de décodage complet), donne le sample rate/bit depth
 * exacts déclarés par le fichier. Nécessaire car `AudioContext.decodeAudioData`
 * rééchantillonne souvent vers la fréquence native du contexte, ce qui fait
 * perdre l'information d'origine (§11.4 étape 2 : "vérification du format
 * / codec / fréquence d'échantillonnage / profondeur de bits").
 *
 * Référence structure RIFF/WAVE : http://soundfile.sapp.org/doc/WaveFormat/
 */
export interface WavHeaderInfo {
  valid: boolean;
  audioFormat: number | null;
  channels: number | null;
  sampleRateHz: number | null;
  bitDepth: number | null;
  dataChunkBytes: number | null;
  durationSeconds: number | null;
}

export function parseWavHeader(buffer: ArrayBuffer): WavHeaderInfo {
  const invalid: WavHeaderInfo = {
    valid: false,
    audioFormat: null,
    channels: null,
    sampleRateHz: null,
    bitDepth: null,
    dataChunkBytes: null,
    durationSeconds: null,
  };

  if (buffer.byteLength < 44) return invalid;

  const view = new DataView(buffer);
  const readAscii = (offset: number, length: number) => {
    let text = "";
    for (let i = 0; i < length; i += 1) text += String.fromCharCode(view.getUint8(offset + i));
    return text;
  };

  if (readAscii(0, 4) !== "RIFF" || readAscii(8, 4) !== "WAVE") {
    return invalid;
  }

  let offset = 12;
  let audioFormat: number | null = null;
  let channels: number | null = null;
  let sampleRateHz: number | null = null;
  let bitDepth: number | null = null;
  let dataChunkBytes: number | null = null;

  while (offset + 8 <= view.byteLength) {
    const chunkId = readAscii(offset, 4);
    const chunkSize = view.getUint32(offset + 4, true);
    const chunkDataStart = offset + 8;

    if (chunkId === "fmt " && chunkDataStart + 16 <= view.byteLength) {
      audioFormat = view.getUint16(chunkDataStart, true);
      channels = view.getUint16(chunkDataStart + 2, true);
      sampleRateHz = view.getUint32(chunkDataStart + 4, true);
      bitDepth = view.getUint16(chunkDataStart + 14, true);
    }

    if (chunkId === "data") {
      dataChunkBytes = chunkSize;
    }

    // Les chunks sont alignés sur 2 octets (padding si taille impaire).
    offset = chunkDataStart + chunkSize + (chunkSize % 2);
  }

  if (!audioFormat || !channels || !sampleRateHz || !bitDepth) {
    return invalid;
  }

  const durationSeconds =
    dataChunkBytes && sampleRateHz && channels && bitDepth
      ? dataChunkBytes / (sampleRateHz * channels * (bitDepth / 8))
      : null;

  return {
    valid: true,
    audioFormat,
    channels,
    sampleRateHz,
    bitDepth,
    dataChunkBytes,
    durationSeconds,
  };
}
