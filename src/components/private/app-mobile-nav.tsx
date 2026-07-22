"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AppSidebarNav } from "./app-sidebar-nav";

export function AppMobileNav({ isLabelAccount = false }: { isLabelAccount?: boolean }) {
  const t = useTranslations("AppNav");
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={t("openMenu")} className="lg:hidden">
            <MenuIcon aria-hidden="true" />
          </Button>
        }
      />
      <SheetContent side="left">
        <SheetTitle className="sr-only">{t("openMenu")}</SheetTitle>
        <div className="mt-8 px-2">
          <AppSidebarNav onNavigate={() => setOpen(false)} isLabelAccount={isLabelAccount} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
