# ADR 0022 — À propos : contenu réel repris d'une version de référence

**Statut :** Implémenté et vérifié (build/typecheck/lint/i18n/DOM).

## Contexte

Suite à l'ADR 0021 (À propos enrichie avec écosystème/valeurs génériques,
faute de référence consultable), Axel a partagé des captures d'écran de la
page À propos d'une version antérieure du site
(`sterkte-records-webapp-v1-tau.vercel.app`) — le lien fourni précédemment
avait échoué au `WebFetch` (page cliente React, aucun contenu rendu côté
serveur récupérable). Les captures contiennent du contenu réel et
spécifique (statistiques, valeurs, une timeline 2021-2025 avec des faits
précis : artistes signés, jalons de streams, expansion géographique,
partenariats) — traité comme du contenu métier fourni par Axel, pas comme
une simple inspiration visuelle à réinterpréter.

## Décisions

### 1. Contenu transcrit fidèlement, pas réinventé

Toute la copie nouvelle (statistiques, 4 valeurs, 5 jalons de la timeline)
provient directement de la lecture des captures d'écran fournies —
aucun fait n'a été inventé. Les descriptions des 3 membres de l'équipe
étaient partiellement coupées dans les captures ; plutôt que de deviner la
fin des phrases, les descriptions existantes (complètes, déjà validées)
ont été conservées telles quelles.

### 2. Année de fondation corrigée : 2020 → 2021

La référence est explicite et cohérente à plusieurs endroits (intro,
statistique "Année de création", premier jalon de la timeline) : Sterkte
Records a été fondé en **2021**, pas 2020 comme l'affichait la copie
précédente de cette page (et par ricochet `visionText`, repris depuis
l'ADR 0021 sans ce correctif). Corrigé partout où la date apparaît sur
cette page.

### 3. Vision/Mission repassent en texte côte à côte, sans photo

Revert du choix de l'ADR 0021 (`ImageTextRow`, image + texte alterné) pour
cette page précise : la référence montre un layout en deux colonnes de
texte pur, sans photo, pour Vision et Mission. Exception assumée au
principe général "plus d'images, moins de texte" — ici, la référence
fournie par Axel fait autorité sur la mise en page de cette section
précise. Le rythme visuel de la page vient plutôt des chiffres
(`StatStrip`), des cartes de valeurs, et de la timeline.

### 4. Nouveaux composants réutilisables : `Timeline`

`src/components/marketing/timeline.tsx` (nouveau) : ligne verticale +
points dorés, un jalon par entrée, reveal échelonné au scroll. Générique,
réutilisable ailleurs (parcours d'un artiste, étapes d'un projet).

### 5. `StatStrip` réutilisé tel quel

La bande statistique (déjà construite pour Distribution, ADR 0015) sert
ici pour Année de création/Plateformes/Streams/Pays — aucune modification
du composant nécessaire, seulement de nouvelles données.

### 6. Avatars d'équipe : dégradé cerise→or plutôt que des anneaux colorés

Remplace le traitement de l'ADR 0021 (anneaux de couleur distincts par
personne) par un dégradé de marque cohérent (cerise→or) sur chaque avatar
— toujours des initiales, `IMAGES/` ne contenant aucune vraie photo
d'Axel/Abigail/Diadème. Nouveau sous-titre d'équipe ("Des professionnels
passionnés au service de votre talent"), présent dans la référence.

### 7. Section "Écosystème" (ADR 0021) retirée, remplacée

La section générique à 4 piliers (Distribution/Studio/Booking/Management)
de l'ADR 0021 est supprimée : la nouvelle section "Nos valeurs
fondamentales" + la timeline "Notre histoire" couvrent le même besoin
("notre manière de travailler") avec un contenu bien plus concret et
spécifique à Sterkte Records.

## Incident technique (sans rapport avec le code)

Après cette modification, `/a-propos` renvoyait un 404 sur le serveur de
développement alors que le contenu était correct et `pnpm build` passait
sans erreur. Cause : `pnpm build` (production) avait été exécuté en
parallèle du serveur `next dev` (Turbopack) actif sur le même dossier
`.next/`, corrompant un fichier de types généré
(`.next/dev/types/routes.d.ts`) puis, après redémarrage automatique du
serveur, laissant le manifeste de routes de Turbopack dans un état
incohérent. Résolu en vidant entièrement `.next/` (artefact de build, pas
du code source) et en relançant le serveur de développement à froid.
Aucune conséquence sur le code livré — à noter pour la suite : éviter de
lancer `pnpm build` pendant qu'un serveur `next dev` tourne sur le même
répertoire.

## Vérification

- `pnpm typecheck`/`lint`/`i18n:check` (1071 clés, parité FR/EN/LN)/
  `css:check`/`build` : tous verts après résolution de l'incident ci-dessus.
  `/[locale]/a-propos` reste prérendue statiquement (`●` SSG).
- Vérification DOM (fetch direct, serveur de dev relancé à froid) : les 5
  années de la timeline (2021-2025), les 4 valeurs, la bande statistique,
  et les 7 logos partenaires (ADR 0021) sont bien rendus ; FR et EN
  confirmés sans `MISSING_MESSAGE` ; aucun débordement horizontal en
  mobile (375px) ; aucune requête réseau en échec.
- **Non vérifié** : rendu visuel réel — même limitation d'outil que les ADR
  précédents (capture d'écran indisponible dans cet environnement).
