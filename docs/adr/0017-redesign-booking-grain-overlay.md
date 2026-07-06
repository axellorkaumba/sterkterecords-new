# ADR 0017 — Refonte artistique de la page Booking + `GrainOverlay` partagé

**Statut :** Implémenté et vérifié (build/typecheck/lint/i18n/DOM) —
capture d'écran non disponible (outil de preview en panne, cf. ADR 0013).

## Contexte

Quatrième page du plan de refonte complète, après la Home (ADR 0013/0014),
Distribution (ADR 0015) et Studio (ADR 0016). Deux décisions de ce sprint :

1. **Constat honnête sur les assets** : `IMAGES/` ne contient aucune photo
   de concert/scène/backstage, seulement des photos de séances studio. Brief
   présenté à Axel avec cette contrainte assumée plutôt que de recourir à
   des photos de stock (contraire au principe "toujours privilégier le
   contenu réel", validé plus tôt dans le chantier).
2. **Retour d'Axel après validation du brief** : les fonds des pages
   Booking et Studio ne doivent jamais être un simple dégradé/fond uni —
   toujours quelque chose de "très artistique". Ce retour s'applique aux
   deux pages ; Studio (déjà livrée, ADR 0016) a donc été retouchée dans ce
   même sprint plutôt que de laisser un fond plat en production.

## Décisions

### 1. `GrainOverlay` — extraction partagée, pas de duplication

`src/components/marketing/grain-overlay.tsx` (nouveau) extrait la texture
de grain SVG (`feTurbulence`) jusque-là dupliquée en dur dans
`ambient-background.tsx`. `ambient-background.tsx` (Home) a été refactoré
pour l'utiliser — même rendu visuel, code partagé. Utilisé par Studio et
Booking ci-dessous : même technique de grain sur tout le site, mais chaque
page choisit ses propres couleurs de halo — cohérence de design system
(principe #6 du plan) sans jamais un fond identique d'une page à l'autre.

### 2. `StudioHero` retouché : halo or + cerise + grain (pas de fond plat)

Ajout d'un halo or chaud + halo cerise discrets qui dérivent lentement
derrière le split hero existant, plus `GrainOverlay`. Teinte différente du
halo unique cerise de Distribution (`or` dominant plutôt que `cerise`
dominant) pour que Studio ne semble pas être un fond recyclé de
Distribution.

### 3. `BookingHero` — composition la plus dense du site, à dessein

`src/components/marketing/booking-hero.tsx` : la photo réelle la plus
cinématographique disponible (`seance-ambiance.avif`, éclairage violet/
néon d'une séance studio, rebrandée "Séance Studio" dans le fichier source)
sert de texture d'arrière-plan à opacité réduite (0.35) et désaturée
(`grayscale-[0.35]`) — jamais affichée comme une photo littérale de
concert qu'elle n'est pas. Par-dessus : deux faisceaux lumineux diagonaux
(dégradés cerise/or, flous, dérive lente) + deux halos + le grain partagé

- un dégradé sombre pour la lisibilité du texte. Composition volontairement
  plus dense que Distribution (un seul halo) ou Studio (deux halos discrets)
  — cette page a la mise en scène la plus "spectacle" du site, cohérente avec
  son sujet (événementiel), tout en restant dans la palette de marque
  cerise/or/noir (aucune couleur hors charte introduite pour simuler un
  éclairage de scène bleu/violet générique).

### 4. Section "Nos artistes" — aperçu léger, pas le futur roster complet

Carrousel (réutilise `ScrollSnapRow`, déjà généralisé pour Studio) des 5
photos d'artistes réelles restantes (Chmarley, DJ Daza, Dreazy Youzou, King
Dave, Feyme — celles non utilisées par Distribution/Studio). Volontairement
minimal (photo + nom seulement) : le futur chantier "Nos artistes" (bios,
ville, genre, réseaux) reste un chantier séparé et plus ambitieux, déjà
identifié dans le plan de refonte.

### 5. `BookingForm` conservé à l'identique

Le formulaire (onglets Artiste/Lieu, présentationnel) n'a pas été retouché
fonctionnellement — seule la section qui l'entoure a été resserrée et
ancrée (`id="reservation"`, cible des CTA "Faire une demande" du Hero et de
la section artistes).

## Vérification

- `pnpm typecheck`/`lint`/`i18n:check` (1026 clés, parité FR/EN/LN)/
  `css:check`/`build` : tous verts. `/[locale]/booking` et
  `/[locale]/studio` restent prérendues statiquement (`●` SSG).
- Vérification DOM (fetch direct + requêtes images via l'optimiseur
  `next/image`) : les 6 images Booking (1 ambiance + 5 artistes) et la
  photo Studio répondent toutes 200 ; le titre "Réservez l'un de nos
  artistes" et l'ancre `#reservation` sont bien rendus ; FR et EN confirmés
  sans `MISSING_MESSAGE` ; aucun débordement horizontal en mobile (375px).
- **Non vérifié** : rendu visuel réel (halos, faisceaux, grain en
  mouvement) — même limitation d'outil que les ADR précédents.

## Suite

Prochaine page du plan : Tarifs — brief détaillé à présenter avant tout
code.
