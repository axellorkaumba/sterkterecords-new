/**
 * Parsing réel du bloc STREAMINFO d'un fichier FLAC (premier bloc de
 * métadonnées, toujours présent) — donne sample rate/bit depth/canaux/durée
 * exacts sans décoder l'audio. Structure bit-à-bit non alignée sur l'octet,
 * voir la spec FLAC : https://xiph.org/flac/format.html#metadata_block_streaminfo
 */
export interface FlacHeaderInfo {
  valid: boolean;
  channels: number | null;
  sampleRateHz: number | null;
  bitDepth: number | null;
  totalSamples: number | null;
  durationSeconds: number | null;
}

function readBits(bytes: Uint8Array, bitOffset: number, bitLength: number): number {
  let result = 0;
  for (let i = 0; i < bitLength; i += 1) {
    const byteIndex = Math.floor((bitOffset + i) / 8);
    const bitIndexInByte = 7 - ((bitOffset + i) % 8);
    const bit = (bytes[byteIndex]! >> bitIndexInByte) & 1;
    result = result * 2 + bit;
  }
  return result;
}

export function parseFlacHeader(buffer: ArrayBuffer): FlacHeaderInfo {
  const invalid: FlacHeaderInfo = {
    valid: false,
    channels: null,
    sampleRateHz: null,
    bitDepth: null,
    totalSamples: null,
    durationSeconds: null,
  };

  const bytes = new Uint8Array(buffer);
  if (bytes.length < 4 + 4 + 34) return invalid;

  const magic = String.fromCharCode(bytes[0]!, bytes[1]!, bytes[2]!, bytes[3]!);
  if (magic !== "fLaC") return invalid;

  // Premier bloc de métadonnées : 1 octet (dernier ? + type), 3 octets de longueur.
  const blockType = bytes[4]! & 0x7f;
  if (blockType !== 0) return invalid; // STREAMINFO doit être le premier bloc.

  const streamInfoStart = 8; // après "fLaC" (4) + en-tête de bloc (4)
  const streamInfo = bytes.subarray(streamInfoStart, streamInfoStart + 34);
  if (streamInfo.length < 18) return invalid;

  const sampleRateHz = readBits(streamInfo, 80, 20);
  const channels = readBits(streamInfo, 100, 3) + 1;
  const bitDepth = readBits(streamInfo, 103, 5) + 1;
  const totalSamples = readBits(streamInfo, 108, 36);

  const durationSeconds = sampleRateHz > 0 ? totalSamples / sampleRateHz : null;

  return {
    valid: true,
    channels,
    sampleRateHz,
    bitDepth,
    totalSamples,
    durationSeconds,
  };
}
