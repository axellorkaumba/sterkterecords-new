# ADR 0018 — Refonte artistique Tarifs, À propos, Contact

**Statut :** Implémenté et vérifié (build/typecheck/lint/i18n/DOM) —
capture d'écran non disponible (outil de preview en panne, cf. ADR 0013).

## Contexte

Cinquième, sixième et septième pages du plan de refonte complète, après
Home (ADR 0013/0014), Distribution (ADR 0015), Studio (ADR 0016) et Booking
(ADR 0017). Axel a demandé de poursuivre sur toutes les pages restantes
sans repasser par un brief détaillé à valider avant chacune (changement de
cadence assumé par rapport au processus initial "brief avant chaque page") —
la rigueur technique (assets réels, vérification, ADR) reste identique.

## Décisions

### 1. Tarifs — reste la page la plus sobre, mais plus de fond plat

`pricing-hero.tsx` : un seul halo or très discret + grain — jamais de
photo ni de composition dense, cohérent avec la position "clarté du prix

> effet" actée dès le brief Booking. Les 3 cartes existantes (contenu
> inchangé, modèle SOLO/AFRIQUE/LABEL d'ADR 0010) gagnent une icône, un
> `ScrollReveal` échelonné, et le bouton Solo passe en variant `premium`. Une
> FAQ tarifaire courte (4 questions, nouvelles clés `Pricing.faq.*`) remplace
> un paragraphe de note isolé.

### 2. À propos — vraies photos pour vision/mission, mais pas pour l'équipe

`image-text-row.tsx` (nouveau, générique, réutilisable) présente vision et
mission en blocs éditoriaux alternés avec de vraies photos de studio
(réemploi assumé de `pc-mix.avif` et `13-a-la-prod.avif`, déjà utilisées
sur Studio/Distribution — pas de nouvel asset nécessaire). **L'équipe
dirigeante (Axel, Abigail, Diadème) reste en avatars-initiales** :
`IMAGES/` ne contient aucune vraie photo de ces 3 personnes nommément, et
utiliser une autre photo à leur place aurait été trompeur (représenter
quelqu'un par la photo de quelqu'un d'autre). Restylé (anneau de couleur
par personne, reveal échelonné) plutôt que remplacé par une fausse photo —
à corriger dès qu'Axel fournit de vrais portraits.

### 3. Contact — reste la page la plus sobre après Tarifs, halo quasi imperceptible

`contact-hero.tsx` : halo cerise à peine visible (opacité la plus faible du
site). La carte d'informations gagne un bandeau photo réel en en-tête
(réemploi de `13-a-la-prod.avif`) plutôt que de rester une simple boîte de
texte — sans jamais concurrencer visuellement le formulaire, qui reste
l'élément principal de la page.

### 4. Réemploi d'assets assumé plutôt que nouvelles photos à chaque page

Ces trois pages n'introduisent aucune nouvelle photo optimisée : elles
réutilisent des photos déjà extraites pour Distribution/Studio. Cohérent
avec le principe du plan ("les photos pourront apparaître ailleurs, avec
parcimonie") — épuiser le stock réel de photos disponibles sur des pages
qui n'en ont pas un besoin narratif aussi fort que Studio/Booking aurait
été superflu.

## Vérification

- `pnpm typecheck`/`lint`/`i18n:check` (1037 clés, parité FR/EN/LN)/
  `css:check`/`build` : tous verts. Les 3 pages restent prérendues
  statiquement (`●` SSG).
- Vérification DOM (fetch direct) : `/fr/tarifs`, `/fr/a-propos`,
  `/fr/contact` répondent toutes 200 sans `MISSING_MESSAGE`.
- **Non vérifié** : rendu visuel réel — même limitation d'outil que les ADR
  précédents.

## Suite

Prochaines étapes du plan : Dashboard Artiste, Dashboard Label/Admin, puis
passe Design System.
