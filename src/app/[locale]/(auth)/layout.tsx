import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/marketing/locale-switcher";
import { LogoWordmark } from "@/components/marketing/logo-wordmark";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthVisualPanel } from "./auth-visual-panel";

/**
 * Chrome des pages d'authentification (§11.2) — chemins localisés comme le
 * site public (`/connexion`, `/en/login`...), voir docs/adr/0002. En-tête
 * minimal : logo (retour à l'accueil), langue, thème — pas la navbar
 * marketing complète, pour garder le focus sur le formulaire.
 *
 * Écran divisé (retouche demandée par Axel, référence TuneCore) : formulaire
 * à gauche, mosaïque du catalogue à droite (`AuthVisualPanel`) — masquée
 * sous `lg`, le panneau visuel n'a jamais de raison d'exister sur un écran
 * trop étroit pour laisser de la place au formulaire.
 *
 * `setRequestLocale` ici aussi (même leçon que `(marketing)/layout.tsx`,
 * voir README "Notes importantes") : sans lui, Next.js perd l'info de
 * rendu statique pour toute la route group dès qu'un layout partagé ne
 * fixe pas explicitement la locale.
 */
export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-1 flex-col lg:grid lg:grid-cols-2">
      <div className="flex flex-1 flex-col lg:flex-none">
        <header className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-10">
          <Link href="/" className="flex items-center">
            <LogoWordmark height={24} className="[--logo-h:18px]! sm:[--logo-h:24px]!" />
          </Link>
          <div className="flex items-center gap-1">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center p-4 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
      <AuthVisualPanel />
    </div>
  );
}
