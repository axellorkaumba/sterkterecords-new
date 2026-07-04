import { parseJpegSof } from "./jpeg-parser";
import {
  loadAndDownsampleImage,
  computeBlurVariance,
  computePixelVariance,
  detectMargins,
} from "./pixel-analysis";

export interface ArtworkValidationContext {
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  widthPx: number;
  heightPx: number;
  /** JPEG uniquement : 1 = gris, 3 = RVB/YCbCr, 4 = CMJN/YCCK. */
  colorComponents: number | null;
  hasAdobeCmykMarker: boolean;
  blurVariance: number;
  pixelVariance: number;
  whiteMarginRatio: number;
  transparentMarginRatio: number;
  bytesPerPixel: number;
  decodeError: boolean;
}

export async function buildArtworkValidationContext(file: File): Promise<ArtworkValidationContext> {
  try {
    const { fullWidth, fullHeight, downsampled } = await loadAndDownsampleImage(file);

    let colorComponents: number | null = null;
    let hasAdobeCmykMarker = false;
    if (file.type === "image/jpeg") {
      const buffer = await file.arrayBuffer();
      const sof = parseJpegSof(buffer);
      colorComponents = sof.colorComponents;
      hasAdobeCmykMarker = sof.hasAdobeCmykMarker;
    }

    return {
      fileName: file.name,
      mimeType: file.type,
      fileSizeBytes: file.size,
      widthPx: fullWidth,
      heightPx: fullHeight,
      colorComponents,
      hasAdobeCmykMarker,
      blurVariance: computeBlurVariance(downsampled),
      pixelVariance: computePixelVariance(downsampled),
      whiteMarginRatio: detectMargins(downsampled).whiteMarginRatio,
      transparentMarginRatio: detectMargins(downsampled).transparentMarginRatio,
      bytesPerPixel: file.size / Math.max(1, fullWidth * fullHeight),
      decodeError: false,
    };
  } catch {
    return {
      fileName: file.name,
      mimeType: file.type,
      fileSizeBytes: file.size,
      widthPx: 0,
      heightPx: 0,
      colorComponents: null,
      hasAdobeCmykMarker: false,
      blurVariance: 0,
      pixelVariance: 0,
      whiteMarginRatio: 0,
      transparentMarginRatio: 0,
      bytesPerPixel: 0,
      decodeError: true,
    };
  }
}
