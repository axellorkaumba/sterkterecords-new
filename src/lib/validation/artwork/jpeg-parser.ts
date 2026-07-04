/**
 * Parsing réel du marqueur SOF (Start Of Frame) d'un JPEG — le nombre de
 * composantes couleur (1 = niveaux de gris, 3 = RVB/YCbCr, 4 = CMJN/YCCK)
 * n'est exposé nulle part par les API navigateur (`Image`, `Canvas`) : il
 * faut lire les octets du fichier. Sert à détecter un CMJN (interdit par
 * les DSP, qui attendent du sRGB — §11.4 étape 5).
 *
 * Référence structure JPEG : https://www.w3.org/Graphics/JPEG/itu-t81.pdf (§B.2.2)
 */
export interface JpegSofInfo {
  found: boolean;
  widthPx: number | null;
  heightPx: number | null;
  colorComponents: number | null;
  /** Vrai si un marqueur Adobe APP14 indique une transformation CMJN/YCCK. */
  hasAdobeCmykMarker: boolean;
}

export function parseJpegSof(buffer: ArrayBuffer): JpegSofInfo {
  const invalid: JpegSofInfo = {
    found: false,
    widthPx: null,
    heightPx: null,
    colorComponents: null,
    hasAdobeCmykMarker: false,
  };

  const bytes = new Uint8Array(buffer);
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return invalid;

  let offset = 2;
  let hasAdobeCmykMarker = false;

  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1]!;

    // Marqueurs sans segment de données (bourrage, RST, SOI/EOI).
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      offset += 2;
      continue;
    }

    const segmentLength = (bytes[offset + 2]! << 8) | bytes[offset + 3]!;

    // APP14 "Adobe" : le champ transform (dernier octet) indique 2 = YCCK (CMJN).
    if (marker === 0xee && segmentLength >= 12) {
      const isAdobe =
        bytes[offset + 4] === 0x41 && // 'A'
        bytes[offset + 5] === 0x64 && // 'd'
        bytes[offset + 6] === 0x6f && // 'o'
        bytes[offset + 7] === 0x62 && // 'b'
        bytes[offset + 8] === 0x65; // 'e'
      if (isAdobe) {
        const transform = bytes[offset + 4 + segmentLength - 2 - 5];
        hasAdobeCmykMarker = transform === 2 || transform === 0;
      }
    }

    const isSof =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) {
      const precision = bytes[offset + 4];
      const height = (bytes[offset + 5]! << 8) | bytes[offset + 6]!;
      const width = (bytes[offset + 7]! << 8) | bytes[offset + 8]!;
      const components = bytes[offset + 9];
      void precision;
      return {
        found: true,
        widthPx: width,
        heightPx: height,
        colorComponents: components ?? null,
        hasAdobeCmykMarker,
      };
    }

    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }

    offset += 2 + segmentLength;
  }

  return { ...invalid, hasAdobeCmykMarker };
}
