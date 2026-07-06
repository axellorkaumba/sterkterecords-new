# ADR 0014 — Vraies pochettes dans le Hero + section "Notre catalogue"

**Statut :** Implémenté et vérifié (build/typecheck/lint/i18n/DOM) — capture
d'écran non disponible dans cet environnement (outil de preview en panne
depuis la fin de la session précédente, indépendant du code, cf. ADR 0013).

## Contexte

Suite à ADR 0013 (première passe de direction artistique de la Home), Axel
a demandé une refonte beaucoup plus large de tout le site (cf.
`C:\Users\hp\.claude\plans\nifty-kindling-tower.md` pour le cadre complet
validé). La première étape de ce chantier, conformément au workflow "brief
avant code" convenu avec Axel, est la finalisation de la Home : remplacer
les pochettes stylisées génériques du Hero par de vraies pochettes issues
de `IMAGES/COVERS/`, et ajouter une section "Notre catalogue" pour prouver
dès l'arrivée sur le site que Sterkte Records distribue déjà de vraies
sorties.

## Décisions

### 1. Extraction des pochettes : script relançable, pas une manipulation ponctuelle

Les 13 fichiers `.svg` de `IMAGES/COVERS/` ne sont pas de vrais vectoriels —
ce sont des JPEG encodés en base64 et enveloppés dans une balise `<image>`
(export brut d'un outil de maquette), certains pesant jusqu'à 10,7 Mo.
`scripts/extract-covers.mjs` (nouveau, `pnpm covers:extract`) extrait le
raster embarqué de chaque fichier, le redimensionne (largeur max 1200px) et
le réencode en AVIF via `sharp` (nouvelle dépendance) dans
`public/covers/<slug>.avif`. Résultat : les 13 pochettes pèsent maintenant
23 Ko à 106 Ko chacune (contre jusqu'à 10,7 Mo en SVG source) — cohérent
avec la contrainte Performance/Core Web Vitals d'Axel (§9 CDC). Le script
est conçu pour être relancé : ajouter une nouvelle sortie ne nécessite que
d'ajouter son slug dans `COVER_SLUGS` puis de relancer la commande.

### 2. Couche de contenu typée `src/content/catalogue.ts`

Même pattern que `src/content/legal-cgu.ts`/`legal-types.ts` (fichier de
types + fichier de données, séparé du système `next-intl`). Les 13 sorties
réelles sont déclarées avec `year`/`platforms` volontairement optionnels et
omis pour l'instant — pas de données inventées (cohérent avec la politique
déjà appliquée au roster artistes, ADR 0006). Ajouter une sortie au
catalogue = une entrée de tableau, aucun composant à modifier.

### 3. `CoverComposition` — remplace le dégradé du Hero

`src/components/marketing/cover-composition.tsx` : 3 "emplacements"
superposés (arrière-gauche, arrière-droite, avant-centre), rotation
déterministe (-4° à 4°), ombre `shadow-elevated`, flottement léger
(`transform`/`opacity` uniquement, GPU). Chaque emplacement cycle sur son
propre intervalle (7s/8s/10,5s) à travers un sous-ensemble du catalogue réel
— le décalage entre les trois horloges évite l'effet "diaporama
synchronisé" explicitement écarté par Axel. Un seul fondu à la fois par
emplacement (`AnimatePresence mode="wait"`), jamais une pochette seule en
plein écran. `prefers-reduced-motion` : pas de rotation automatique (une
pochette fixe par emplacement), pas de flottement.

### 4. `CatalogueShowcase` — carrousel scroll-snap natif, pas de librairie

`src/components/marketing/catalogue-showcase.tsx` : les 13 pochettes en
défilement horizontal `overflow-x-auto` + `snap-x snap-mandatory` — choix
arrêté plutôt qu'une librairie de carrousel tierce (coût JS quasi nul, swipe
tactile natif, focus clavier natif sur les boutons flèches, qui ne sont
qu'un raccourci desktop au-dessus du scroll natif). Survol = léger
zoom + ombre (`shadow-elevated`, `scale-[1.02]`, `-translate-y-1`). Badge
"Compilation" sur la sortie collective Sterkte Records. Section insérée
entre le bandeau plateformes (inchangé) et la grille de services, conforme
au plan validé.

### 5. Positionnement dans le Hero : superposition assumée avec le smartphone

`CoverComposition` est rendue avant le bloc smartphone dans le DOM
(`hero-visual.tsx`), donc peinte derrière lui aux pixels de recouvrement
(ordre de peinture standard pour des éléments `position: absolute` sans
`z-index` explicite en conflit) — cohérent avec la demande d'Axel
("certaines [pochettes] en arrière-plan") et avec le traitement du dégradé
qu'elle remplace (déjà positionné en partie sous le smartphone).

## Vérification

- `pnpm typecheck` / `pnpm lint` / `pnpm i18n:check` (1014 clés, parité
  FR/EN/LN) / `pnpm css:check` / `pnpm build` : tous verts. La Home
  (`/[locale]`) reste prérendue statiquement (`●` SSG).
- Vérification DOM en navigateur (fetch direct du HTML rendu, snapshot
  d'accessibilité, inspection des positions/tailles) : les 16 images de
  pochettes (3 dans le Hero + 13 dans le catalogue) se chargent sans
  requête en échec ; le titre de section "Des artistes qui nous font
  confiance" est bien présent ; le carrousel expose `overflow-x: auto` et
  ses 13 cartes en mobile (375px).
- **Non vérifié** : rendu visuel réel (capture d'écran), animations en
  mouvement, interactions de survol/flèches — l'outil de capture d'écran de
  cet environnement a cessé de fonctionner en fin de session précédente
  (`about:blank` lui-même ne pouvait plus être capturé), panne indépendante
  du code déjà documentée en ADR 0013. À revérifier visuellement dès que
  l'outil est rétabli, avant de considérer cette page définitivement
  "terminée" au sens du workflow de revue en 4 axes convenu avec Axel.

## Suite

Prochaine page du plan validé : Distribution — brief détaillé à présenter
avant tout code, conformément au workflow.
