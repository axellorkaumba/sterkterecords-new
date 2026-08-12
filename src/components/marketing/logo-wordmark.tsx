"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { cn } from "@/lib/utils";

const NATURAL_WIDTH = 1121;
const NATURAL_HEIGHT = 135;

/**
 * Lockup horizontal complet "Sterkte Records" + slogan (extrait de
 * `IMAGES/STERKTE RECORDS HEADER BLACK.svg`, voir
 * `scripts/extract-header-logo.mjs` — logo mis à jour par Axel le
 * 2026-08-13, remplace l'ancien `logo.header.svg`), remplace le texte de
 * marque dans le chrome du site (navbar, footer, en-têtes privé/auth). Le
 * slogan reste lisible uniquement à partir d'une hauteur suffisante — aux
 * hauteurs actuelles (22-28px, voir les appels de ce composant), il se lit
 * comme un simple filet sous le wordmark plutôt qu'un texte déchiffrable ;
 * choix assumé par Axel plutôt que la version recadrée sans slogan.
 * Deux exports statiques (couleur/blanc) au lieu d'un seul : la version
 * blanche est dérivée par le script (silhouette identique, RGB forcé en
 * blanc), le fichier WHITE fourni par Axel étant cassé au rendu. Aucune
 * version unique ne se lit correctement sur les deux thèmes — on bascule
 * selon le thème résolu (`next-themes`). Avant hydratation, on suppose le
 * thème sombre (thème par défaut du site, §9).
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
