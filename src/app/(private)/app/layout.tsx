import { AppSidebarNav } from "@/components/private/app-sidebar-nav";
import { AppMobileNav } from "@/components/private/app-mobile-nav";

/**
 * Coquille du dashboard artiste (§11.3, §8 du CDC) — nav complète avec
 * badges "Bientôt disponible" pour les modules pas encore construits
 * (validé par Axel, voir docs/adr/0008-dashboard-artiste.md). Sélecteur
 * d'artistes (managers, forfait Label) et notifications en en-tête
 * arriveront avec les comptes équipe multi-artistes (§7.2, V1).
 */
export default function ArtistDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      <aside className="border-border hidden w-60 shrink-0 border-r p-4 lg:block">
        <AppSidebarNav />
      </aside>
      <div className="flex flex-1 flex-col">
        <div className="border-border flex h-12 items-center border-b px-4 lg:hidden">
          <AppMobileNav />
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
