"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { GlobeIcon } from "lucide-react";

const LOCALE_LABELS: Record<string, string> = {
  fr: "Français",
  en: "English",
  ln: "Lingala",
};

/** Sélecteur de langue (§21 du CDC) — change la locale en gardant la même page. */
export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Nav");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" aria-label={t("changeLanguage")}>
            <GlobeIcon aria-hidden="true" />
            {locale.toUpperCase()}
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {routing.locales.map((availableLocale) => (
          <DropdownMenuItem
            key={availableLocale}
            onClick={() => router.replace(pathname, { locale: availableLocale })}
          >
            {LOCALE_LABELS[availableLocale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
