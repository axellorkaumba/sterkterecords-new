import type { Metadata } from "next";
import { fontSans, fontMono } from "@/lib/fonts";
import { PostHogProvider } from "@/lib/analytics/posthog-client-provider";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tableau de bord — Sterkte Records",
    template: "%s — Sterkte Records",
  },
  robots: { index: false, follow: false },
};

/**
 * Racine de layout n°2 (dashboard artiste `/app` + back-office `/admin`).
 *
 * Pas de préfixe de locale dans l'URL ici : aucun enjeu SEO pour des pages
 * privées authentifiées. La langue sera résolue via `profiles.locale`
 * (colonne définie au §12 du CDC) dès que l'authentification existe
 * (Sprint 3) — voir docs/adr/0002-i18n-routing.md.
 *
 * TODO(Sprint 3) : brancher le rafraîchissement de session Supabase et la
 * protection des routes ici (garde d'authentification + rôles, §7 du CDC).
 */
export default function PrivateRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fontSans.variable} ${fontMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
