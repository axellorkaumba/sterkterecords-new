# ADR 0021 — Transitions continues, section Partenaires, À propos enrichie

**Statut :** Implémenté et vérifié (build/typecheck/lint/i18n/DOM).

## Contexte

Retour d'Axel après la refonte complète (ADR 0013-0020) : la Home est
désormais la référence visuelle, et trois demandes concrètes en découlent
pour l'ensemble du site — (1) ne plus jamais ressentir de coupure nette
entre deux sections ("Hero / bloc noir / image / bloc noir"), (2) exploiter
les logos partenaires du dossier `IMAGES/` dans une véritable section
institutionnelle, (3) approfondir À propos en s'inspirant du rythme d'une
page de référence externe. Axel savait cette page de référence
probablement inaccessible dans cet environnement et a explicitement
demandé de ne pas bloquer le travail dans ce cas, mais d'interpréter
l'intention (plus immersif, moins de texte, plus d'émotion) — une tentative
de récupération via `WebFetch` a effectivement échoué (page cliente
React, contenu non rendu côté serveur), confirmant qu'il fallait proposer
une direction propre plutôt qu'imiter une page non consultable.

## Décisions

### 1. `AmbientSection` — fond partagé entre sections consécutives

`src/components/marketing/ambient-section.tsx` (nouveau) : enveloppe
plusieurs `<section>` dans un seul halo diffus partagé + grain, plutôt que
chaque section n'ait (ou n'ait pas) son propre traitement isolé. Root cause
du "bloc qui commence, bloc qui finit" identifiée : ce n'était pas un
contraste de couleur entre sections (elles partagent déjà le même fond de
page), mais l'absence totale de traitement d'ambiance après le Hero — Home
n'avait un fond vivant que dans le Hero, puis plus rien pendant
Services/CTA final. Appliqué à la Home (Services + CTA final, teinte or —
distincte du cerise du Hero) et à À propos (Écosystème + Équipe, même
teinte or). Halos en valeurs fixes (`size-[44rem]`), pas en pourcentage,
pour rester cohérents quelle que soit la hauteur du contenu enveloppé.

Portée de cette passe : Home et À propos (les deux pages les plus
concernées par ce retour — Home car référence, À propos car retravaillée
en profondeur ce sprint). Les pages restantes (Distribution, Studio,
Booking, Tarifs, Contact) ont déjà chacune leur propre traitement de Hero
mais pourront recevoir le même traitement `AmbientSection` sur leurs zones
de contenu dans un prochain passage, le composant étant désormais
disponible et réutilisable tel quel.

### 2. Découverte : le logo "MP" est en réalité Mwezi Partners

En extrayant les 7 logos partenaires de `IMAGES/` pour construire la
section, la lecture directe du raster embarqué a révélé que
`Logo MP 1.svg` porte le texte "Mwezi Partners" (accompagné du slogan
"Éclairer la croissance, révéler le potentiel") — le logo qu'Axel pensait
manquant (question posée plus tôt dans le chantier) était présent depuis
le début, simplement nommé par ses initiales plutôt que son nom complet.
Les 6 autres logos ont aussi été identifiés par lecture directe : Reservo,
Reed Signature, Sofari Vizuri (SV), Arteast, Inseme Farm (IF), et un
monogramme sans texte lisible (GC).

### 3. `scripts/extract-partner-logos.mjs` — même famille de contrainte que les pochettes

Les logos sources ne sont pas non plus de vrais vecteurs : même schéma
raster-en-base64-dans-SVG que les pochettes (`extract-covers.mjs`), mais
avec une particularité utile — chaque raster est déjà un monochrome blanc
sur fond noir plein cadre (vérifié visuellement à l'extraction, pas
supposé). Le script recadre l'excédent de fond noir (`sharp().trim()`) et
exporte en **PNG, pas AVIF** — la compression avec perte d'AVIF pourrait
altérer le noir `#000000` exact nécessaire au compositing
`mix-blend-mode: screen` utilisé par `PartnerGrid`.

### 4. `PartnerGrid` — bande sombre dédiée, `mix-blend-mode: screen`, jamais un défilement

`src/components/marketing/partner-grid.tsx` (nouveau) : grille statique
(2/3/4 colonnes selon la largeur), hauteur visuelle égale par logo
(`object-contain` dans une boîte de hauteur fixe), fade-in au scroll +
agrandissement 3% au survol uniquement — explicitement aucune rotation,
aucun rebond, aucun carrousel (institutionnel, pas ludique), conforme à la
demande. Bande `bg-noir-950` propre à la section (indépendante du thème
clair/sombre global) : les logos sources étant blanc-sur-noir,
`mix-blend-mode: screen` fait disparaître le noir source dans le noir de
la bande sans dépendre d'un filtre CSS approximatif. Placée sur À propos
(après l'équipe, avant le CTA de clôture) — le bandeau DSP de la Home
(`platform-marquee.tsx`) reste totalement inchangé, distinct.

### 5. À propos enrichie sans inventer de faits

Nouvelle section "Écosystème" (4 piliers visuels — Distribution/Studio/
Booking/Management, icônes réutilisées des services Home) répond à
"notre manière de travailler, notre écosystème" sans fabriquer de jalons
historiques avec des dates inventées (le seul fait chronologique du texte,
"fondé en 2020", était déjà présent dans `visionText` et n'a pas été
étendu). Nouveau CTA de clôture ("rejoindre le label") — la page ne
menait auparavant nulle part après l'équipe.

## Vérification

- `pnpm typecheck`/`lint`/`i18n:check` (1053 clés, parité FR/EN/LN)/
  `css:check`/`build` : tous verts. Home et À propos restent prérendues
  statiquement (`●` SSG).
- Vérification DOM (fetch direct + requêtes images) : les 7 logos
  partenaires répondent 200 via l'optimiseur `next/image` ; les titres des
  nouvelles sections (Écosystème, Nos partenaires, CTA de clôture) sont
  bien rendus ; aucun débordement horizontal en mobile (375px) sur Home ni
  À propos.
- **Non vérifié** : rendu visuel réel du compositing `mix-blend-mode:
screen` et de la continuité des transitions — même limitation d'outil
  que les ADR précédents (capture d'écran indisponible).

## Suite

Étendre `AmbientSection` aux zones de contenu des pages restantes
(Distribution, Studio, Booking, Tarifs, Contact) si Axel souhaite
poursuivre ce chantier — le composant est prêt, seule l'intégration page
par page reste à faire.
