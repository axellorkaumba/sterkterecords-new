import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * `twMerge` par défaut ne connaît pas nos tailles de texte custom (définies
 * via `--text-*` dans globals.css, ex. `text-caption`, `text-small`) — il
 * les traite comme des classes de COULEUR de texte inconnues (même préfixe
 * `text-`) et les fait donc entrer en conflit avec `text-muted-foreground`/
 * `text-primary`/etc., en ne gardant que la dernière de la liste. Résultat
 * observé : `cn("text-caption ...", "text-muted-foreground")` supprimait
 * silencieusement `text-caption` — aucune erreur, juste la taille de police
 * jamais appliquée. Déclarer ces tailles dans le groupe `font-size` évite
 * ce faux conflit.
 */
const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-display",
        "text-h1",
        "text-h2",
        "text-h3",
        "text-body-lg",
        "text-body",
        "text-small",
        "text-caption",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
