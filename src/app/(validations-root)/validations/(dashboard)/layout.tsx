import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth/session";
import { LogoWordmark } from "@/components/marketing/logo-wordmark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { logoutAdmin } from "./actions";

/**
 * Garde défensive en plus de `src/proxy.ts` (déjà garant qu'aucune requête
 * n'atteint `/validations/*` sans session admin valide) — filet de sécurité
 * si ce layout est un jour rendu par un chemin qui contourne le middleware.
 */
export default async function ValidationsDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/validations/connexion");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-border flex h-14 items-center justify-between border-b px-4 sm:px-6">
        <LogoWordmark height={22} />
        <div className="flex items-center gap-3">
          <span className="text-small text-muted-foreground hidden sm:inline">
            {session.displayName}
          </span>
          <form action={logoutAdmin}>
            <Button type="submit" variant="ghost" size="sm">
              Déconnexion
            </Button>
          </form>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
}
