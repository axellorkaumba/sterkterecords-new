import { Inter, JetBrains_Mono, Bricolage_Grotesque } from "next/font/google";

/**
 * Polices de la charte (§9.2 du CDC) — chargées une seule fois et partagées
 * entre les deux racines de layout (`src/app/[locale]` et
 * `src/app/(private)`).
 *
 * TODO(licence Fontshare) : le CDC prescrit **Clash Display** (titres) et
 * **Satoshi** (corps/UI), toutes deux distribuées par Fontshare sous licence
 * commerciale gratuite — mais elles ne sont pas hébergées sur Google Fonts
 * et ne peuvent donc pas être chargées via `next/font/google`. En attendant
 * que l'équipe télécharge les fichiers .woff2 depuis fontshare.com et les
 * dépose dans `src/fonts/` (voir `docs/adr/0005-typography-fallback.md`),
 * ce module utilise :
 *   - Inter pour le corps — fallback système explicitement autorisé par le
 *     CDC lui-même ("Satoshi (Fontshare) ou Inter (fallback système)").
 *   - Bricolage Grotesque pour les titres — substitut temporaire au profil
 *     visuel proche (grotesque contemporaine, empattements de displaay),
 *     en attendant Clash Display.
 * Le jour où les fichiers Fontshare sont disponibles, seul ce fichier
 * change (next/font/local au lieu de next/font/google) — aucun composant
 * ne référence directement une police, tout passe par les tokens
 * `font-sans` / `font-display` / `font-mono`.
 */
export const fontSans = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const fontDisplay = Bricolage_Grotesque({
  variable: "--font-display-raw",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  variable: "--font-mono-raw",
  subsets: ["latin"],
  display: "swap",
});

/** Classe combinée à poser sur `<html>` dans chaque root layout. */
export const fontVariables = `${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`;
