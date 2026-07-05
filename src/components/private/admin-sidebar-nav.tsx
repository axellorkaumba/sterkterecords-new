"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  LayoutDashboardIcon,
  UsersIcon,
  UploadIcon,
  WalletIcon,
  MicIcon,
  CalendarIcon,
  UserPlusIcon,
  BriefcaseIcon,
  LifeBuoyIcon,
  ImageIcon,
  SettingsIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Nav complète de `/admin` (§11.10 du CDC) — même décision que
 * `AppSidebarNav` (Sprint 4, validée par Axel) : toutes les entrées
 * apparaissent dès ce sprint, celles sans page réelle sont grisées avec un
 * badge "Bientôt disponible" plutôt que d'attendre chaque sprint.
 */
const NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboardIcon, key: "overview", available: true },
  { href: "/admin/artistes", icon: UsersIcon, key: "artists", available: true },
  { href: "/admin/sorties", icon: UploadIcon, key: "releases", available: true },
  { href: "/admin/finances", icon: WalletIcon, key: "finances", available: false },
  { href: "/admin/studio", icon: MicIcon, key: "studio", available: false },
  { href: "/admin/booking", icon: CalendarIcon, key: "booking", available: false },
  { href: "/admin/featuring", icon: UserPlusIcon, key: "featuring", available: false },
  { href: "/admin/consulting", icon: BriefcaseIcon, key: "consulting", available: false },
  { href: "/admin/support", icon: LifeBuoyIcon, key: "support", available: false },
  { href: "/admin/contenus", icon: ImageIcon, key: "content", available: false },
  { href: "/admin/parametres", icon: SettingsIcon, key: "settings", available: false },
] as const;

export function AdminSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("AdminNav");
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);

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
