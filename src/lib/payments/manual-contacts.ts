/**
 * Coordonnées mobile money affichées aux artistes pour le paiement manuel
 * (§ ADR 0026, fournies directement par Axel — jamais inventées). PayPal reste
 * disponible en checkout automatisé (`getPaymentProvider("paypal")`) ET en
 * preuve manuelle ici (l'artiste peut envoyer sur le compte PayPal de Sterkte
 * Records et uploader une capture, au choix). Constantes plutôt qu'une table
 * de config : deux valeurs statiques, pas un catalogue amené à grandir avec
 * des devises/régions (contrairement à `plan_prices`).
 */
export const MANUAL_PAYMENT_METHODS = [
  {
    id: "airtel_money",
    label: "Airtel Money",
    accountName: "STERKTE RECORDS",
    contact: "+243 976 613 219",
  },
  {
    id: "orange_money",
    label: "Orange Money",
    accountName: "STERKTE RECORDS",
    contact: "+243 836 703 927",
  },
] as const;

export type ManualPaymentMethodId = (typeof MANUAL_PAYMENT_METHODS)[number]["id"] | "paypal_manual";
