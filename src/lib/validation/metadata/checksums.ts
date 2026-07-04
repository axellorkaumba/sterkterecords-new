/** Format ISRC : CC (pays) + XXX (registrant, alphanumérique) + YY (année) + NNNNN (désignation). */
const ISRC_PATTERN = /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/;

export function isValidIsrcFormat(isrc: string): boolean {
  return ISRC_PATTERN.test(isrc.replace(/[-\s]/g, "").toUpperCase());
}

/** UPC-A : 12 chiffres, clé de contrôle mod 10 (norme GS1). */
export function isValidUpcA(upc: string): boolean {
  const digitsOnly = upc.replace(/[-\s]/g, "");
  if (!/^\d{12}$/.test(digitsOnly)) return false;

  const digits = digitsOnly.split("").map(Number);
  const checkDigit = digits[11]!;
  let sumOddPositions = 0;
  let sumEvenPositions = 0;

  for (let i = 0; i < 11; i += 1) {
    if (i % 2 === 0) sumOddPositions += digits[i]!;
    else sumEvenPositions += digits[i]!;
  }

  const calculatedCheckDigit = (10 - ((sumOddPositions * 3 + sumEvenPositions) % 10)) % 10;
  return calculatedCheckDigit === checkDigit;
}
