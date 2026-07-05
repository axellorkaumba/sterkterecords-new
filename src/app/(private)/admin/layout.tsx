import { AdminSidebarNav } from "@/components/private/admin-sidebar-nav";
import { AdminMobileNav } from "@/components/private/admin-mobile-nav";

/**
 * Coquille du back-office (§11.10 du CDC) — même structure que le dashboard
 * artiste (§8, Sprint 4) : nav complète avec badges "Bientôt disponible"
 * pour les modules pas encore construits (Finances, Studio, Booking,
 * Featuring, Consulting, Support, Contenus, Paramètres — hors périmètre du
 * back-office minimal du MVP, §3.1). Voir docs/adr/0012-back-office-minimal.md.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      <aside className="border-border hidden w-60 shrink-0 border-r p-4 lg:block">
        <AdminSidebarNav />
      </aside>
      <div className="flex flex-1 flex-col">
        <div className="border-border flex h-12 items-center border-b px-4 lg:hidden">
          <AdminMobileNav />
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
