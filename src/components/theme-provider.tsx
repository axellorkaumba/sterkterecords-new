"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Dark mode par défaut, light mode disponible en bascule manuelle (§9 du
 * CDC : "Deux thèmes : sombre (par défaut, identité forte) et clair").
 * `enableSystem={false}` : on ne suit pas la préférence OS, le choix reste
 * celui de l'utilisateur (persisté en localStorage par next-themes) avec le
 * sombre comme défaut assumé de la marque.
 */
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
