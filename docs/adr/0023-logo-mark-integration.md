# ADR 0023 — Intégration du vrai logo (médaillon `IMAGES/Logo SR 1|2.svg`)

**Statut :** Implémenté et vérifié (typecheck/lint/i18n/css, navigateur).

## Contexte

Axel a demandé la mise à jour du logo du site à partir de deux fichiers
réels du dossier `IMAGES/` : `Logo SR 1.svg` (version couleur, fond blanc)
et `Logo SR 2.svg` (version monochrome, fond noir), en laissant le
traitement à mon appréciation ("utilise ça à bon escient"). Jusqu'ici, tout
le chrome du site (navbar, footer, en-tête privé, en-tête auth, favicon)
affichait uniquement le nom "Sterkte Records" en texte — aucune image de
marque.

## Constat technique sur les fichiers source

Les deux SVG ne sont pas de vrais vecteurs : ce sont des rasters (JPEG/PNG)
encodés en base64 et intégrés dans une balise `<image>`, à l'intérieur d'un
cadre SVG 400×120 qui n'est qu'un letterboxing autour d'un raster carré
1200×1200 (confirmé en rendant le SVG complet via `sharp`, pas seulement le
raster extrait — le motif carré est simplement recentré avec du
remplissage, pas un vrai recadrage horizontal). Le raster complet est un
lockup vertical en deux lignes ("Sterkte" / "Records") avec un médaillon
circulaire porte-note de musique près du "S" — pas directement utilisable
tel quel dans une navbar horizontale fine.

## Décisions

### 1. Médaillon seul, à côté du texte existant — pas le lockup complet en image

Plutôt que de remplacer le texte "Sterkte Records" par une image (perte de
sémantique/SEO, et le lockup vertical ne se prête pas à un espace
horizontal fin), j'ai extrait uniquement le médaillon circulaire
porte-note (`{left:263, top:340, width:75, height:75}` sur le raster
1200×1200 source) et je l'affiche devant le texte, qui reste du vrai texte.

### 2. Détourage circulaire par masque alpha, pas par chroma-key

Le médaillon contient à la fois du noir ET du blanc en son sein (le cercle
et la note contrastante) : une transparence par couleur-clé aurait aussi
effacé une partie du motif. Détourage fait via un masque SVG circulaire
composé avec `sharp` (`blend: 'dest-in'`), qui donne un vrai cercle à coins
transparents, réutilisable sur n'importe quel fond.

### 3. Deux exports statiques, un par thème, plutôt qu'un seul asset recoloré

- `public/brand/icon-mark-dark.png` — médaillon blanc/note noire (extrait
  de `Logo SR 2.svg`), utilisé sur le thème sombre (thème par défaut du
  site, §9).
- `public/brand/icon-mark-light.png` — médaillon noir/note blanche (extrait
  de `Logo SR 1.svg`), utilisé sur le thème clair.

Nouveau composant partagé `src/components/marketing/logo-mark.tsx`
(`"use client"`, lit `resolvedTheme` via `next-themes` + `useHasMounted`
pour éviter un mismatch d'hydratation) qui bascule automatiquement entre
les deux assets. Utilisé dans `navbar.tsx`, `footer.tsx`,
`private-header.tsx` et `(auth)/layout.tsx` — les quatre endroits où le nom
du label apparaissait en texte seul.

### 4. Favicon : convention `src/app/icon.png`, pas de `.ico` fait main

`sharp` ne sait pas encoder de `.ico`. Plutôt qu'ajouter une dépendance
dédiée pour un besoin ponctuel, j'utilise la convention de fichier spécial
Next.js App Router (`src/app/icon.png`) qui génère automatiquement les
balises `<link rel="icon">` nécessaires. L'ancien `src/app/favicon.ico`
reste en place tel quel (fallback legacy) ; Next.js expose les deux — le
`icon.png` (médaillon noir/fond transparent, lisible sur la plupart des
chromes de navigateur, généralement clairs) prend le rôle principal.

### 5. Correction connexe : JSON-LD Organization (`structured-data.tsx`)

En cherchant toutes les références à un logo dans le code, j'ai trouvé que
le schéma `Organization` (`src/components/marketing/structured-data.tsx`)
pointait vers `https://www.sterkterecords.com/logo.png` — un fichier qui
n'a jamais existé. Corrigé vers le médaillon réel
(`/brand/icon-mark-light.png`). Au passage, `foundingDate` affichait encore
"2020" (même incohérence que celle corrigée sur la page À propos par l'ADR
0022, qui établit 2021 comme année de fondation réelle) — corrigé en
"2021" pour rester cohérent avec le reste du site.

## Vérification

- `pnpm typecheck` / `pnpm lint` / `pnpm i18n:check` (1071 clés, parité
  FR/EN/LN inchangée) / `pnpm css:check` : tous verts. `pnpm build` non
  relancé en parallèle du serveur `next dev` actif, pour éviter l'incident
  de corruption `.next/` déjà documenté (ADR 0022).
- Vérification navigateur (serveur de dev) : le médaillon s'affiche dans la
  navbar et le footer (requête `/_next/image` en 200), bascule
  correctement entre `icon-mark-dark.png` et `icon-mark-light.png` en
  cliquant le bouton de thème, `/icon.png` répond 200, `<link rel="icon">`
  présent pour `favicon.ico` (legacy) et `icon.png` (principal).
- **Non vérifié** : rendu visuel réel via capture d'écran (outil
  indisponible dans cet environnement, même limitation que les ADR
  précédents) ; `private-header.tsx` et `(auth)/layout.tsx` vérifiés par
  lecture du code rendu (DOM), pas par navigation interactive complète
  (zones authentifiées).
