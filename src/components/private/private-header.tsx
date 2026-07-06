import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoWordmark } from "@/components/marketing/logo-wordmark";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(private)/actions";

/**
 * Barre minimale de la zone privée (§11.2) — nom du compte, lien Paramètres,
 * déconnexion, thème. PAS la navigation complète du dashboard/back-office
 * (sélecteur d'artiste, notifications...) : celle-ci arrive au Sprint 4
 * (§11.3, §11.10). `Link`/`redirect` ici viennent de `next/navigation`, pas
 * de `@/i18n/navigation` : `/app` et `/admin` ne sont jamais préfixés par une
 * locale (voir docs/adr/0002-i18n-routing.md).
 */
export async function PrivateHeader() {
  const t = await getTranslations("PrivateHeader");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-border flex h-14 items-center justify-between border-b px-4 sm:px-6">
      <Link href="/app" className="flex items-center">
        <LogoWordmark height={22} />
      </Link>
      <div className="flex items-center gap-2">
        {user?.email ? (
          <span className="text-small text-muted-foreground hidden sm:inline">{user.email}</span>
        ) : null}
        <Button variant="ghost" size="sm" render={<Link href="/app/parametres" />}>
          {t("settingsLink")}
        </Button>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm">
            {t("logoutButton")}
          </Button>
        </form>
        <ThemeToggle />
      </div>
    </header>
  );
}
