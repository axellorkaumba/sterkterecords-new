# ADR 0015 — Refonte artistique de la page Distribution

**Statut :** Implémenté et vérifié (build/typecheck/lint/i18n/DOM) —
capture d'écran non disponible (outil de preview en panne, cf. ADR 0013).

## Contexte

Deuxième page du plan de refonte complète du site (cadré avec Axel, ordre
validé : Accueil → Distribution → Studio → Booking → Tarifs → À propos →
Contact → Dashboards → Design System), après la Home (ADR 0013/0014). L'audit initial avait relevé que Distribution
suivait le gabarit générique commun aux pages de service : `PageHero` +
liste numérotée + grille de 4 icônes Lucide, sans aucune image. Brief
détaillé validé par Axel avant code (collage de pochettes + statistiques
flottantes + halo rouge discret dans le Hero, visualisation interactive du
parcours d'une sortie comme moment signature).

## Décisions

### 1. `DistributionHero` — collage de vraies pochettes, pas un `PageHero` générique

`src/components/marketing/distribution-hero.tsx` : 7 pochettes réelles
(`catalogueReleases`) disposées en collage à positions/rotations
déterministes (pas de génération aléatoire — évite tout écart
serveur/client à l'hydratation), flottement léger, logos de plateformes
flottants discrets, deux cartes de statistiques (nombre de plateformes via
`AnimatedCounter`, délai de mise en ligne). Un seul halo cerise centré
(`bg-cerise-500/15`, un seul blur) — volontairement différent du triple
halo de la Home (`AmbientBackground`), pour que Distribution ait son propre
traitement de fond (principe validé : jamais deux pages avec le même fond).
Parallaxe très discret du collage au scroll via `useScroll`/`useTransform`
(`transform` uniquement, GPU).

### 2. `ReleasePipeline` — moment signature, transform-only

`src/components/marketing/release-pipeline.tsx` : timeline Upload →
Validation → Distribution → Streaming → Royalties. Un point lumineux
portant une vraie mini-pochette (`catalogueReleases`, cycle toutes les 9s)
voyage le long du tracé en boucle infinie. Décision technique importante :
le déplacement est un `transform: translateX` calculé en pixels via
`ResizeObserver` sur le conteneur, **jamais** une animation de `left` en
pourcentage — une propriété de mise en page animée en boucle infinie
violerait la contrainte Performance d'Axel (GPU/`transform`/`opacity`
uniquement, §9 CDC). Chaque étape s'illumine brièvement (opacity) à son
tour de passage, décalage de phase calculé (`delay`) pour chaque icône.
Composant conçu pour être réutilisé tel quel dans le Dashboard Artiste
(chantier futur du plan) une fois l'état réel d'une sortie disponible.

### 3. `StatStrip` et `FullBleedImage` — nouveaux composants de la bibliothèque premium

`src/components/marketing/stat-strip.tsx` (bande statistique horizontale,
`divide-x`/`divide-y` plutôt qu'une grille de cartes bordées — rupture de
rythme volontaire) et `full-bleed-image.tsx` (photo réelle plein cadre +
dégradé + légende, réutilisable sur Studio/Booking/À propos) sont
génériques, pilotés par props — pas de contenu Distribution codé en dur
dedans, cohérent avec l'objectif "bibliothèque de composants premium
réutilisables" du plan.

### 4. Photo réelle : nouveau script `scripts/optimize-image.mjs`

`IMAGES/13 A LA PROD.jpg` (candid, vraie séance en studio) optimisée vers
`public/studio/13-a-la-prod.avif` (334 Ko → 28,7 Ko). Script générique
(source, dossier `public/`, slug) pensé pour être réutilisé aux prochaines
pages (Studio, Booking, À propos) qui ont aussi besoin de vraies photos
`IMAGES/` sans SVG à désenvelopper (contrairement aux pochettes,
`extract-covers.mjs`).

### 5. Namespace i18n `Distribution` restructuré, pas juste étendu

Les anciennes clés `steps.*` (liste numérotée d'onboarding) et `features.*`
(grille d'icônes) ont été supprimées plutôt que laissées mortes à côté des
nouvelles — plus personne ne les référence, et `ctaLoggedIn` (jamais
utilisé, ni avant ni après cette refonte) a été retiré au passage. Nouvelles
clés : `stats.*` (Hero), `pipeline.*` (tag/titre/étapes), `proof.*` (bande
statistique), `storySection.*` (image plein cadre), `ctaFinalTitle`/
`ctaFinalDescription`. Parité FR/EN/LN vérifiée (1014 clés, inchangé —
autant de clés retirées qu'ajoutées).

## Vérification

- `pnpm typecheck`/`lint`/`i18n:check`/`css:check`/`build` : tous verts.
  `/[locale]/distribution` reste prérendue statiquement (`●` SSG).
- Vérification DOM (fetch direct + navigateur) : aucune requête en échec ;
  8 images de pochettes chargées (7 du collage + 1 du paquet animé du
  pipeline) ; la photo `public/studio/13-a-la-prod.avif` charge ; les 5
  étapes du pipeline et les 4 libellés de la bande statistique sont bien
  rendus ; FR et EN confirmés sans `MISSING_MESSAGE` ; aucun débordement
  horizontal en mobile (375px).
- **Non vérifié** : rendu visuel réel, animations en mouvement — même
  limitation d'outil que les ADR précédents.

## Suite

Prochaine page du plan : Studio — brief détaillé à présenter avant tout
code.
