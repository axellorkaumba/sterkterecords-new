"use client";

import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHasMounted } from "@/hooks/use-has-mounted";

/**
 * Bascule sombre/clair (§9 du CDC). `useHasMounted` évite un mismatch
 * d'hydratation : le thème résolu côté client (localStorage) n'est connu
 * qu'après montage.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHasMounted();

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Passer en thème clair" : "Passer en thème sombre"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {mounted ? (
        isDark ? (
          <SunIcon aria-hidden="true" />
        ) : (
          <MoonIcon aria-hidden="true" />
        )
      ) : (
        <span className="size-4" />
      )}
    </Button>
  );
}
