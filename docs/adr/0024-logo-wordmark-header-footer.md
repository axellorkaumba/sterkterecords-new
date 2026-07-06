# ADR 0024 — Logo complet dans le header/footer (`logo.header.svg`)

**Statut :** Implémenté et vérifié (typecheck/lint/i18n/css, navigateur).

## Contexte

Suite à l'ADR 0023 (médaillon circulaire ajouté à côté du texte "Sterkte
Records"), Axel a fourni un nouveau fichier, `IMAGES/logo.header.svg`, et a
demandé de remplacer entièrement le texte "STERKTE RECORDS" par ce logo
dans le header ET le footer, avec une adaptation automatique des couleurs
selon le fond.

## Constat technique sur le fichier source

`logo.header.svg` est le vrai lockup horizontal une seule ligne
("Sterkte Records", médaillon porte-note intégré dans le "S") — contrairement
aux fichiers `Logo SR 1|2.svg` (empilement vertical sur deux lignes,
inutilisable tel quel dans une navbar fine). Il embarque **deux** rasters
1568×643 en base64 (fond noir plein cadre dans les deux cas) :

- un raster blanc (texte blanc sur fond noir) — utilisé par le SVG source
  uniquement comme pochoir de masquage (via `feColorMatrix` + `<mask>`) ;
- un raster couleur réel (rouge/jaune/noir) — mais son encre noire (le
  texte) est littéralement la même couleur que son propre fond noir, donc
  impossible à isoler par la seule couleur sans le pochoir ci-dessus.

`scripts/extract-header-logo.mjs` (nouveau) reproduit cette même technique
de masquage par luminance à la main (composition de buffers RGBA plutôt que
`sharp().joinChannel()`, qui s'est révélé peu fiable pour attacher un canal
alpha brut à une base RGB à 3 canaux — fonctionnait pour une base 1-canal,
pas pour du RGB, comportement non documenté) : la luminance du raster blanc
devient le canal alpha, appliqué au RGB du raster couleur → logo couleur à
fond réellement transparent. Deux exports produits :

- `public/brand/logo-header-dark.png` — version blanche, pour le thème
  sombre (par défaut du site).
- `public/brand/logo-header-light.png` — version couleur (rouge/jaune/noir),
  pour le thème clair.

## Décisions

### 1. Remplacement complet du texte, pas un ajout à côté

Contrairement à l'ADR 0023 (médaillon + texte conservé), ici le texte
"Sterkte Records" est entièrement retiré du chrome du site : le lockup
importé contient déjà le nom complet en typographie de marque, un texte à
côté serait redondant. `alt="Sterkte Records"` sur l'image porte le nom
accessible (le lien navbar/footer/en-têtes n'a plus de texte visible à côté).

### 2. Nouveau composant `LogoWordmark`, remplace `LogoMark`

`src/components/marketing/logo-wordmark.tsx` (nouveau) — bascule entre les
deux exports selon `resolvedTheme` (`next-themes`), même mécanique que
`LogoMark` (ADR 0023 : `useHasMounted` pour éviter un mismatch
d'hydratation, thème sombre supposé avant montage). `LogoMark` et ses
usages sont supprimés : le médaillon seul n'est plus affiché nulle part
dans le chrome, remplacé par le lockup complet qui l'intègre déjà.

Câblé dans les quatre mêmes emplacements que l'ADR 0023 :
`navbar.tsx`, `footer.tsx`, `private-header.tsx`, `(auth)/layout.tsx` —
hauteurs différentes selon le contexte (28px navbar/footer/auth, 22px
en-tête privé plus compact), largeur calculée depuis le ratio naturel de
l'asset (1200×183).

### 3. JSON-LD `Organization.logo` inchangé

Le schéma `structured-data.tsx` (corrigé en ADR 0023) continue de pointer
vers le médaillon circulaire (`icon-mark-light.png`), pas ce nouveau
lockup : Google recommande un logo carré/proche du carré pour l'affichage
Knowledge Panel, ce que le médaillon satisfait et pas un lockup large
(ratio ~6.5:1).

## Vérification

- `pnpm typecheck` / `pnpm lint` / `pnpm i18n:check` (1071 clés, parité
  inchangée) / `pnpm css:check` : tous verts.
- Vérification navigateur (serveur de dev) : le logo s'affiche dans la
  navbar et le footer (`alt="Sterkte Records"`, requête `/_next/image` en
  200), bascule correctement entre `logo-header-dark.png` et
  `logo-header-light.png` au clic du bouton de thème, aucun débordement
  horizontal en desktop (655px) ni mobile (375px), en-tête `/connexion`
  (zone auth) vérifié par fetch direct du DOM rendu.
- **Non vérifié** : rendu visuel réel via capture d'écran (outil
  indisponible dans cet environnement) ; `private-header.tsx` (zone
  authentifiée `/app`) vérifié par lecture du JSX rendu, pas par navigation
  interactive complète (nécessite une session connectée).
