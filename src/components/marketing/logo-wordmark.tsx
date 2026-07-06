"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { cn } from "@/lib/utils";

const NATURAL_WIDTH = 1200;
const NATURAL_HEIGHT = 183;

/**
 * Lockup horizontal complet "Sterkte Records" (extrait de
 * `IMAGES/logo.header.svg`, voir `scripts/extract-header-logo.mjs`),
 * remplace le texte de marque dans le chrome du site (navbar, footer,
 * en-têtes privé/auth). L'artwork source a un fond noir plein cadre : deux
 * exports statiques (couleur/blanc) au lieu d'un seul, aucune version
 * unique ne se lisant correctement sur les deux thèmes — on bascule selon
 * le thème résolu (`next-themes`). Avant hydratation, on suppose le thème
 * sombre (thème par défaut du site, §9).
 */
export function LogoWordmark({ height = 28, className }: { height?: number; className?: string }) {
  const { resolvedTheme } = useTheme();
  const mounted = useHasMounted();
  const isLight = mounted && resolvedTheme === "light";
  const width = Math.round((height / NATURAL_HEIGHT) * NATURAL_WIDTH);

  return (
    <Image
      src={isLight ? "/brand/logo-header-light.png" : "/brand/logo-header-dark.png"}
      alt="Sterkte Records"
      width={width}
      height={height}
      priority
      className={cn("w-auto", className)}
      style={{ height }}
    />
  );
}
