import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/marketing/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Chrome des pages d'authentification (§11.2) — chemins localisés comme le
 * site public (`/connexion`, `/en/login`...), voir docs/adr/0002. En-tête
 * minimal : logo (retour à l'accueil), langue, thème — pas la navbar
 * marketing complète, pour garder le focus sur le formulaire.
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
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-h3 font-display font-semibold">
          Sterkte <span className="text-primary">Records</span>
        </Link>
        <div className="flex items-center gap-1">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
