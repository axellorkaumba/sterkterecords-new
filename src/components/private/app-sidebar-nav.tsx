"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  LayoutDashboardIcon,
  Building2Icon,
  UploadIcon,
  BarChart3Icon,
  WalletIcon,
  MicIcon,
  CalendarIcon,
  UsersIcon,
  BriefcaseIcon,
  FileTextIcon,
  UserPlusIcon,
  BellIcon,
  SettingsIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Nav complète de `/app` (§8 du CDC) — décision validée par Axel : tous les
 * liens apparaissent dès le Sprint 4, ceux dont la page n'existe pas encore
 * sont visibles mais désactivés avec un badge "Bientôt disponible" plutôt
 * que d'attendre chaque sprint pour ajouter son entrée (évite les liens
 * morts tout en montrant la structure complète du produit).
 */
const NAV_ITEMS = [
  { href: "/app", icon: LayoutDashboardIcon, key: "overview", available: true },
  {
    href: "/app/label",
    icon: Building2Icon,
    key: "label",
    available: true,
    managerOnly: true,
  },
  { href: "/app/distribution", icon: UploadIcon, key: "distribution", available: true },
  { href: "/app/statistiques", icon: BarChart3Icon, key: "stats", available: false },
  { href: "/app/revenus", icon: WalletIcon, key: "revenue", available: true },
  { href: "/app/studio", icon: MicIcon, key: "studio", available: false },
  { href: "/app/booking", icon: CalendarIcon, key: "booking", available: false },
  { href: "/app/featuring", icon: UsersIcon, key: "featuring", available: false },
  { href: "/app/consulting", icon: BriefcaseIcon, key: "consulting", available: false },
  { href: "/app/contrats", icon: FileTextIcon, key: "contracts", available: false },
  { href: "/app/collaborateurs", icon: UserPlusIcon, key: "team", available: true },
  { href: "/app/notifications", icon: BellIcon, key: "notifications", available: false },
  { href: "/app/parametres", icon: SettingsIcon, key: "settings", available: true },
] as const;

export function AppSidebarNav({
  onNavigate,
  isLabelAccount = false,
}: {
  onNavigate?: () => void;
  /** Compte `profiles.role = 'manager'` (ADR 0029) — affiche "Vue Label". */
  isLabelAccount?: boolean;
}) {
  const t = useTranslations("AppNav");
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.filter(
        (item) => !("managerOnly" in item && item.managerOnly) || isLabelAccount,
      ).map((item) => {
        const isActive =
          item.href === "/app" ? pathname === item.href : pathname.startsWith(item.href);

        if (!item.available) {
          return (
            <div
              key={item.href}
              className="text-muted-foreground flex cursor-not-allowed items-center gap-2.5 rounded-md px-3 py-2 opacity-50"
            >
              <item.icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="text-small flex-1">{t(item.key)}</span>
              <Badge variant="outline" className="text-caption">
                {t("comingSoon")}
              </Badge>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "text-small flex items-center gap-2.5 rounded-md px-3 py-2 transition-colors",
              isActive
                ? "bg-muted text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-4 shrink-0" aria-hidden="true" />
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}
