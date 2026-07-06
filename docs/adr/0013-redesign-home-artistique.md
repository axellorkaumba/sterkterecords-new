# ADR 0013 — Direction artistique de l'accueil (hors périmètre CDC, demande Axel)

**Statut :** Implémenté, vérifié (build/typecheck/lint/i18n) — vérification
visuelle en navigateur non concluante dans cet environnement (voir
"Contrainte d'environnement").

## Contexte

La Home (§11.1) fonctionnait mais restait visuellement proche d'un gabarit
SaaS générique. Axel a demandé une refonte de la direction artistique —
structure et copie inchangées, mais rendu "beaucoup plus vivant, premium et
artistique" : fond vivant, composition héro illustrant l'écosystème musical,
logos de plateformes réels en défilement, compteurs progressifs, boutons
premium, nav glassmorphism, reveal au scroll. Demande hors du texte du CDC
(qui ne spécifie pas cette direction visuelle précise) mais dans l'esprit du
§9 (charte graphique/branding).

Deux clarifications ont été nécessaires avant de coder, faute d'assets
fournis dans le dossier `IMAGES/` (uniquement des photos de studio, des
logos Sterkte Records, et des logos de clients tiers sans rapport) :

1. **Logos de plateformes** : `IMAGES/` n'en contient aucun. Axel a choisi
   le package open-source `@icons-pack/react-simple-icons` (marques
   officielles réelles, usage factuel largement répandu — comparable à un
   badge "disponible sur") plutôt que des icônes génériques ou des assets
   fournis manuellement.
2. **Pochettes du Hero** : `IMAGES/` ne contient aucune vraie pochette
   d'album, seulement des photos de studio candides. Confirmation d'utiliser
   des pochettes stylisées génériques (dégradés de marque + icône musicale)
   plutôt que de faire passer les photos de studio pour de fausses
   pochettes.

## Décisions

### 1. `motion` (succession de Framer Motion) plutôt que CSS pur partout

Le bandeau de plateformes reste en CSS pur (`@keyframes marquee` existant,
déjà dans `globals.css`) — un défilement infini n'a besoin d'aucun JS par
frame. Tout le reste (halos de fond, composition héro, compteurs, reveal au
scroll, nav) utilise `motion/react`, avec `useReducedMotion()` vérifié
explicitement dans chaque composant (la règle CSS globale
`prefers-reduced-motion` de `globals.css` ne couvre que les animations
CSS/transitions, pas les animations pilotées par JS).

### 2. Toutes les animations en boucle n'utilisent que `transform`/`opacity`

Contrainte explicite d'Axel (performance, 60 FPS, GPU). Les halos de fond
(`ambient-background.tsx`) et les éléments flottants du Hero
(`hero-visual.tsx`) n'animent que `x`/`y`/`opacity`/`scale` en boucle ;
`filter`/`box-shadow` n'apparaissent que sur des transitions ponctuelles au
survol (bouton, carte), jamais en boucle.

### 3. Nouveau composant `HeroVisual` — pochettes stylisées, pas de vraies photos

`src/components/marketing/hero-visual.tsx` : smartphone (lecture façon
Spotify), pochette stylisée en dégradé de marque, carte "Sortie approuvée",
carte de streams cumulés (avec `AnimatedCounter`), timeline de distribution
(Envoi → Validation → Distribution → En ligne), logos de plateformes
flottants très discrets en arrière-plan. Nouveau namespace i18n
`Home.heroVisual` (texte factice représentatif, pas de vraie donnée
utilisateur).

### 4. `AnimatedCounter` — compteur progressif au scroll, une seule fois

`src/components/marketing/animated-counter.tsx` : `useInView` +
`useMotionValue` + `animate()`. `once: true` — ne recompte jamais en
re-scrollant (l'effet "gadget" explicitement écarté par Axel).
`prefers-reduced-motion` : affiche directement la valeur finale, sans
décompte.

### 5. `PlatformMarquee` — vrais logos, rendu monochrome

`src/components/marketing/platform-marquee.tsx` : 18 plateformes demandées
par Axel. 14 ont une marque dans `@icons-pack/react-simple-icons` (Spotify,
Apple Music, Deezer, YouTube Music, TikTok, Audiomack, Tidal, Pandora,
iHeartRadio, Napster, Facebook, Instagram, Snapchat, Shazam) ; 4 n'en ont pas
(Amazon Music, Boomplay, Claro Música, Anghami) et utilisent une pastille de
repli (icône générique + nom), clairement remplaçable dès qu'un vrai logo
est fourni. Rendu volontairement **monochrome** (`currentColor`, pas les
couleurs de marque) plutôt que multicolore — cohérent avec les pages
"Disponible sur" d'Apple/Stripe citées par Axel comme référence, évite
l'effet "mosaïque". Défilement CSS pur, pause au survol
(`group-hover:[animation-play-state:paused]`), libellé `aria-label` traduit
(nouvelle clé `Home.platformsAriaLabel`).

### 6. Bouton `premium` — nouvelle variante CVA, pas une modification du style par défaut

`src/components/ui/button.tsx` : nouvelle variante `premium` (dégradé,
ombre portée colorée en profondeur, glow au survol via `hover:shadow-*` +
`hover:brightness-110`) utilisée uniquement pour le CTA principal du Hero.
Choix : une variante additionnelle plutôt que modifier `default` — le bouton
`default` reste utilisé partout ailleurs dans l'app (dashboard, tunnel de
distribution, etc.) où ce traitement visuel serait hors de propos. La
variante `gold` existante (CTA final) reçoit aussi une ombre portée dorée
pour rester cohérente avec la demande "boutons plus premium partout".

### 7. Nav : glassmorphism variable + ombre au scroll + animation d'entrée

`src/components/marketing/navbar.tsx` : la nav avait déjà un
`backdrop-blur`/`bg-background/80` fixe. Ajout d'un état `scrolled` (écoute
`scroll` passive, seuil 8px) qui fait varier l'opacité du fond
(`bg-background/60` → `/90`) et ajoute une ombre (`shadow-card`), plus une
animation d'entrée (`motion.header`, fade + léger slide vers le bas au
montage). Modification sitewide assumée (la nav est partagée par toutes les
pages marketing) — cohérent avec la demande d'Axel qui ne limitait pas ce
point à la Home.

### 8. `ScrollReveal` — rythme narratif, pas de rejeu

`src/components/marketing/scroll-reveal.tsx` : wrapper générique
(`whileInView`, `viewport={{ once: true }}`) utilisé pour les titres de
section et chaque carte de service (délai échelonné par index). Réutilisable
pour d'autres pages marketing si besoin plus tard.

## Contrainte d'environnement (vérification visuelle)

`pnpm typecheck`/`lint`/`i18n:check`/`build` passent tous, et le rendu SSR
(HTML final, contenu traduit FR/EN, structure du DOM) a été vérifié via
lecture directe du DOM (snapshot d'accessibilité) en FR, EN, et en mobile —
tout le contenu attendu est présent (Hero, stats, `HeroVisual`, bandeau de
plateformes avec les 18 noms et les logos disponibles, cartes de services,
CTA final), et l'ouverture du menu mobile (`Sheet`) confirme que
l'hydratation/interactivité fonctionne bien. En revanche, l'outil de capture
d'écran et les vérifications dépendant d'un `IntersectionObserver` réel
(déclenchement du compteur animé, du reveal au scroll) n'ont pas pu être
validés dans cette session : l'outil de preview a cessé de produire des
captures d'écran (`about:blank` lui-même n'a pas pu être capturé), signe
d'une panne de l'outil plutôt que du code — la même panne explique
vraisemblablement l'absence de déclenchement de l'`IntersectionObserver` de
test manuel effectué en diagnostic. À revérifier visuellement (Lighthouse
mobile compris, cf. ADR 0009/recette A10) après un premier déploiement réel.
