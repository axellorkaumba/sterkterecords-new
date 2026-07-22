import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import { Providers } from "@/components/providers";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Validations — Sterkte Records", template: "%s — Validations Sterkte Records" },
  robots: { index: false, follow: false },
};

/**
 * Racine de layout n°3, dédiée à `/validations` (dashboard de validation des
 * paiements, ADR 0026) — séparée de `(private)` (`/app`, `/admin`) car cette
 * zone n'utilise PAS Supabase Auth : `PrivateHeader` (celui de `(private)`)
 * suppose une session Supabase (email, lien `/app/parametres`, `signOut`
 * Supabase) qui n'existe pas ici. Pas de `NextIntlClientProvider` non plus :
 * outil interne pour l'équipe Sterkte Records uniquement (jamais vu par un
 * artiste), texte en français en dur — voir docs/adr/0026 pour la
 * justification de cette exception au principe "zéro texte en dur" (§21, qui
 * vise le contenu produit destiné aux artistes/visiteurs, pas les écrans
 * internes réservés à l'équipe).
 */
export default function ValidationsRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fontVariables} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
