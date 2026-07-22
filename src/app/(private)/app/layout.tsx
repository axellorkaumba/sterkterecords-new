import { AppSidebarNav } from "@/components/private/app-sidebar-nav";
import { AppMobileNav } from "@/components/private/app-mobile-nav";
import { createClient } from "@/lib/supabase/server";
import { fetchUserRole } from "@/lib/supabase/profile";

/**
 * Coquille du dashboard artiste (§11.3, §8 du CDC) — nav complète avec
 * badges "Bientôt disponible" pour les modules pas encore construits
 * (validé par Axel, voir docs/adr/0008-dashboard-artiste.md). Le sélecteur
 * d'artistes (forfait Label, jusqu'à 5) vit dans `OverviewHeader`/
 * `ArtistSwitcher`, voir docs/adr/0027-multi-artistes-label.md. Le lien
 * "Vue Label" (`/app/label`, ADR 0029 Phase 3) n'apparaît que pour un
 * compte `profiles.role = 'manager'` — d'où la requête ici, seul point de
 * ce layout qui touche la base.
 */
export default async function ArtistDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = user ? await fetchUserRole(supabase, user.id) : null;
  const isLabelAccount = role === "manager";

  return (
    <div className="flex flex-1">
      <aside className="border-border hidden w-60 shrink-0 border-r p-4 lg:block">
        <AppSidebarNav isLabelAccount={isLabelAccount} />
      </aside>
      <div className="flex flex-1 flex-col">
        <div className="border-border flex h-12 items-center border-b px-4 lg:hidden">
          <AppMobileNav isLabelAccount={isLabelAccount} />
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
