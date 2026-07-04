/**
 * Analyse de pixels pour la pochette (§11.4 étape 5) — flou, image vide,
 * marges blanches/transparentes. Tourne sur une version réduite (300 px de
 * long côté max) de l'image plutôt que sur l'original (jusqu'à 3000×3000) :
 * une vraie convolution pixel par pixel sur 9 millions de pixels serait
 * lente dans le thread principal du navigateur pour un gain de précision
 * négligeable pour ces heuristiques. Les vérifications de dimensions/ratio
 * utilisent, elles, les dimensions réelles (voir `context.ts`).
 */
export interface DownsampledImage {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export interface LoadedImage {
  fullWidth: number;
  fullHeight: number;
  downsampled: DownsampledImage;
}

export async function loadAndDownsampleImage(file: File, maxSize = 300): Promise<LoadedImage> {
  const bitmap = await createImageBitmap(file);
  const fullWidth = bitmap.width;
  const fullHeight = bitmap.height;

  const scale = Math.min(1, maxSize / Math.max(fullWidth, fullHeight));
  const width = Math.max(1, Math.round(fullWidth * scale));
  const height = Math.max(1, Math.round(fullHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("canvas_unsupported");
  }
  context.drawImage(bitmap, 0, 0, width, height);
  const imageData = context.getImageData(0, 0, width, height);
  bitmap.close();

  return { fullWidth, fullHeight, downsampled: { width, height, data: imageData.data } };
}

function toGrayscale(image: DownsampledImage): Float32Array {
  const gray = new Float32Array(image.width * image.height);
  for (let i = 0; i < gray.length; i += 1) {
    const offset = i * 4;
    const r = image.data[offset]!;
    const g = image.data[offset + 1]!;
    const b = image.data[offset + 2]!;
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }
  return gray;
}

/**
 * Variance du Laplacien (méthode classique de détection de flou par
 * variance des contours) — une image nette a beaucoup de contours marqués
 * (variance élevée), une image floue en a peu (variance faible). Seuils
 * calibrés empiriquement, documentés comme approximatifs dans les règles.
 */
export function computeBlurVariance(image: DownsampledImage): number {
  const gray = toGrayscale(image);
  const { width, height } = image;
  let sum = 0;
  let sumSquares = 0;
  let count = 0;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const idx = y * width + x;
      const value =
        -4 * gray[idx]! + gray[idx - 1]! + gray[idx + 1]! + gray[idx - width]! + gray[idx + width]!;
      sum += value;
      sumSquares += value * value;
      count += 1;
    }
  }

  if (count === 0) return 0;
  const mean = sum / count;
  return sumSquares / count - mean * mean;
}

/** Variance globale des niveaux de gris — proche de 0 = image quasi unie (vide/placeholder). */
export function computePixelVariance(image: DownsampledImage): number {
  const gray = toGrayscale(image);
  const mean = gray.reduce((total, value) => total + value, 0) / gray.length;
  return gray.reduce((total, value) => total + (value - mean) ** 2, 0) / gray.length;
}

export interface MarginDetectionResult {
  whiteMarginRatio: number;
  transparentMarginRatio: number;
}

/** Échantillonne une bande en bordure de l'image pour détecter des marges blanches/transparentes. */
export function detectMargins(
  image: DownsampledImage,
  marginFraction = 0.04,
): MarginDetectionResult {
  const { width, height, data } = image;
  const marginPx = Math.max(1, Math.round(Math.min(width, height) * marginFraction));
  let whiteCount = 0;
  let transparentCount = 0;
  let total = 0;

  const checkPixel = (x: number, y: number) => {
    const idx = (y * width + x) * 4;
    const r = data[idx]!;
    const g = data[idx + 1]!;
    const b = data[idx + 2]!;
    const a = data[idx + 3]!;
    total += 1;
    if (a < 10) transparentCount += 1;
    else if (r > 245 && g > 245 && b > 245) whiteCount += 1;
  };

  for (let x = 0; x < width; x += 1) {
    for (let m = 0; m < marginPx; m += 1) {
      checkPixel(x, m);
      checkPixel(x, height - 1 - m);
    }
  }
  for (let y = 0; y < height; y += 1) {
    for (let m = 0; m < marginPx; m += 1) {
      checkPixel(m, y);
      checkPixel(width - 1 - m, y);
    }
  }

  return {
    whiteMarginRatio: total > 0 ? whiteCount / total : 0,
    transparentMarginRatio: total > 0 ? transparentCount / total : 0,
  };
}
