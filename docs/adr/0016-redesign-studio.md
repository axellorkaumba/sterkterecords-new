# ADR 0016 — Refonte artistique de la page Studio

**Statut :** Implémenté et vérifié (build/typecheck/lint/i18n/DOM) —
capture d'écran non disponible (outil de preview en panne, cf. ADR 0013).

## Contexte

Troisième page du plan de refonte complète du site, après la Home
(ADR 0013/0014) et Distribution (ADR 0015). Brief validé par Axel avant
code : ambiance studio immersive avec vraies photos, galerie, tarifs
présentés différemment de ce qui existe déjà ailleurs sur le site.

## Décisions

### 1. Aucune photo `IMAGES/` n'est au format large — Hero asymétrique plutôt que plein-cadre horizontal

Constat technique fait avant de coder et signalé à Axel dans le brief :
toutes les photos réelles disponibles sont au format portrait (4:5) ou
carré (1:1), aucune en format large/cinéma. Un plein-cadre horizontal
aurait forcé un recadrage agressif et dénaturé le cadrage d'origine.
Décision : `studio-hero.tsx` reprend la structure asymétrique de la Home
(texte à gauche, image à droite) mais avec une vraie photo verticale
(`public/studio/pc-mix.avif` — la console de mixage, choix thématiquement
le plus fort) plutôt qu'un mockup illustré.

### 2. Effet Ken Burns : `scale` sur un enfant dédié, jamais sur le conteneur de l'`Image`

Le zoom lent (`scale: [1, 1.08]`, 22s, `repeatType: "mirror"`) est appliqué
à un `motion.div` intermédiaire (`position: absolute; inset: 0`), pas
directement sur l'élément parent qui définit la taille du panneau ni sur
l'`Image` `fill` elle-même — évite toute interférence avec le calcul de
taille de `next/image`. `transform` uniquement, GPU, respecte
`useReducedMotion` (pas de zoom si mouvement réduit).

### 3. `PhotoMasonry` — CSS multi-colonnes natif, pas de calcul JS

`src/components/marketing/photo-masonry.tsx` : `columns-2 sm:columns-3` +
`break-inside-avoid`. Les vraies photos gardent leur ratio d'origine
(portrait/carré mélangés) plutôt que d'être forcées dans une grille
uniforme — c'est précisément ce qui crée l'effet mosaïque, sans calcul de
position en JS. 6 photos réelles (Bush, 13, Mafia ×2, Davtor, Sam Kaya),
la console de mixage déjà utilisée en Hero n'est pas dupliquée dans la
galerie. Légende (prénom/nom d'artiste) visible seulement au survol.

### 4. `ScrollSnapRow` — extraction du pattern carrousel de la Home, généralisé

`src/components/marketing/scroll-snap-row.tsx` généralise le conteneur
scroll-snap + flèches déjà éprouvé dans `catalogue-showcase.tsx` (Home),
en composant réutilisable générique (accepte des enfants, pas de contenu
figé). Les 3 formules tarifaires existantes (contenu inchangé, seul le
conteneur change) passent d'une grille statique de cartes à ce carrousel —
rupture de rythme volontaire (la Home utilise déjà une grille de cartes
pour les services, la répéter ici aurait été le gabarit générique justement
écarté par Axel).

### 5. `StudioForm` conservé à l'identique

Le formulaire de réservation (présentationnel, cf. commentaire déjà présent
dans le fichier) n'a pas été retouché fonctionnellement — seule la section
qui l'entoure a été resserrée et ancrée (`id="reservation"`, cible des
boutons "Réserver" du Hero et du carrousel de tarifs).

## Vérification

- `pnpm typecheck`/`lint`/`i18n:check` (1020 clés, parité FR/EN/LN)/
  `css:check`/`build` : tous verts. `/[locale]/studio` reste prérendue
  statiquement (`●` SSG).
- Vérification DOM (fetch direct du HTML rendu + requêtes des 7 images
  optimisées via l'optimiseur `next/image`) : toutes répondent 200 ; les 7
  images (1 Hero + 6 galerie) sont présentes dans le HTML ; l'ancre
  `#reservation` et le libellé "Nos formules" sont bien rendus ; FR et EN
  confirmés sans `MISSING_MESSAGE`.
- **Non vérifié** : rendu visuel réel (Ken Burns, mosaïque, carrousel en
  mouvement) — même limitation d'outil que les ADR précédents.

## Suite

Prochaine page du plan : Booking — brief détaillé à présenter avant tout
code.
