import "server-only";

import { createWorker } from "tesseract.js";

export interface PaymentProofOcrResult {
  text: string | null;
  amount: number | null;
}

/**
 * OCR best-effort (Tesseract.js, gratuit/open-source) sur une capture de
 * paiement mobile money/PayPal — indice affiché à l'équipe de validation
 * (§ ADR 0026 : "si tu as un système de vérification automatique ça nous
 * aidera aussi"), JAMAIS utilisé pour auto-approuver. Échoue silencieusement
 * (réseau, image illisible...) : une preuve sans indice OCR reste
 * entièrement validable manuellement, ce n'est jamais un chemin bloquant.
 */
export async function extractPaymentProofText(imageBuffer: Buffer): Promise<PaymentProofOcrResult> {
  try {
    const worker = await createWorker("eng");
    const {
      data: { text },
    } = await worker.recognize(imageBuffer);
    await worker.terminate();

    const trimmed = text?.trim() || null;
    return { text: trimmed, amount: trimmed ? guessAmount(trimmed) : null };
  } catch {
    return { text: null, amount: null };
  }
}

/**
 * Devine le montant le plus plausible dans un texte OCR de reçu mobile
 * money/PayPal : le plus grand nombre décimal sous un plafond raisonnable
 * (au-delà, plus probablement un numéro de téléphone/référence de
 * transaction qu'un montant en RDC/international) — heuristique volontairement
 * simple, l'équipe vérifie toujours la capture elle-même.
 */
function guessAmount(text: string): number | null {
  const matches = text.match(/\d[\d.,\s]{0,12}\d|\d/g);
  if (!matches) return null;

  const AMOUNT_CEILING = 100_000;
  let best: number | null = null;

  for (const match of matches) {
    const normalized = match
      .replace(/\s/g, "")
      .replace(/,(?=\d{3}\b)/g, "")
      .replace(",", ".");
    const value = Number.parseFloat(normalized);
    if (Number.isFinite(value) && value > 0 && value < AMOUNT_CEILING) {
      if (best === null || value > best) best = value;
    }
  }

  return best;
}
