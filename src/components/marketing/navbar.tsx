"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LocaleSwitcher } from "@/components/marketing/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Nav principale volontairement limitée à 6 entrées (§9.4 mobile-first :
 * une navbar à 10 items ne tient pas sur mobile). Featuring et Consulting
 * restent accessibles depuis les cartes de services de l'accueil et le
 * footer — les pages existent, seule leur mise en avant en nav change.
 */
const NAV_LINKS = [
  { href: "/distribution" as const, key: "distribution" as const },
  { href: "/studio" as const, key: "studio" as const },
  { href: "/booking" as const, key: "booking" as const },
  { href: "/tarifs" as const, key: "pricing" as const },
  { href: "/a-propos" as const, key: "about" as const },
  { href: "/contact" as const, key: "contact" as const },
];

export function Navbar() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-border bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-h3 font-display font-semibold">
          Sterkte <span className="text-primary">Records</span>
        </Link>

        <ul className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "text-small hover:text-foreground transition-colors",
                  pathname === link.href ? "text-foreground font-medium" : "text-muted-foreground",
                )}
              >
                {t(link.key)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <LocaleSwitcher />
          <ThemeToggle />
          <Button
            render={<Link href="/connexion">{t("login")}</Link>}
            nativeButton={false}
            variant="ghost"
            size="sm"
          />
          <Button
            render={<Link href="/inscription">{t("signup")}</Link>}
            nativeButton={false}
            size="sm"
          />
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label={t("openMenu")}>
                  <MenuIcon aria-hidden="true" />
                </Button>
              }
            />
            <SheetContent side="right">
              <SheetTitle className="sr-only">{t("openMenu")}</SheetTitle>
              <nav className="mt-8 flex flex-col gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "text-body rounded-md px-3 py-2.5",
                      pathname === link.href
                        ? "bg-muted text-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {t(link.key)}
                  </Link>
                ))}
                <div className="border-border mt-4 flex flex-col gap-2 border-t px-3 pt-4">
                  <LocaleSwitcher />
                  <Button
                    render={
                      <Link href="/connexion" onClick={() => setMobileOpen(false)}>
                        {t("login")}
                      </Link>
                    }
                    nativeButton={false}
                    variant="outline"
                  />
                  <Button
                    render={
                      <Link href="/inscription" onClick={() => setMobileOpen(false)}>
                        {t("signup")}
                      </Link>
                    }
                    nativeButton={false}
                  />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
