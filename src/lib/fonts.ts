import { Geist, Geist_Mono } from "next/font/google";

/**
 * Polices chargées une seule fois et partagées entre les deux racines de
 * layout de l'application (`src/app/[locale]` pour le site public/auth et
 * `src/app/(private)` pour le dashboard/back-office — voir
 * docs/adr/0002-i18n-routing.md pour le pourquoi de ces deux racines).
 *
 * Remplacées par Clash Display / Satoshi au Sprint 1 (Design System, §9.2
 * du cahier des charges).
 */
export const fontSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const fontMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
