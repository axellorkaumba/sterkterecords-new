# ADR 0027 — Gestion multi-artistes pour le forfait Label

**Statut :** Implémenté (code uniquement — pas encore vérifié en conditions
réelles, aucun compte Label multi-artistes n'existe en production à date).

## Contexte

Suite directe de l'ADR 0026 : le plafond de 5 artistes pour le forfait Label
y avait été posé côté base (`plans.max_artists`, vérifié dans
`createArtistProfile`) mais explicitement noté comme un garde-fou sans
interface — "la vraie gestion multi-artistes (inviter/gérer plusieurs
profils sous un compte Label) n'existe pas encore côté UI". C'est ce chantier
qui la construit.

Demande d'Axel : "on y va" sur ce point resté en suspens. Pas de nouvelle
exigence produit au-delà de ce qui était déjà cadré dans l'ADR 0026 — ce
document couvre uniquement la conception technique.

## Ce qui est construit

Un compte Label peut créer jusqu'à 5 profils artistes et basculer entre eux
depuis le dashboard (`ArtistSwitcher` dans l'en-tête). L'artiste sélectionné
devient "l'artiste actif" : c'est lui qui est affiché sur `/app` et ciblé par
les actions du tunnel de distribution qui n'ont pas encore de sortie
existante (créer une nouvelle sortie, dédupliquer le catalogue).

**Hors périmètre, volontairement** : inviter un tiers (manager, collaborateur)
sur un artiste précis (rôles `manager`/`team_member`, déjà présents dans
l'enum `user_role` mais inutilisés) — ADR 0008 §7.2, toujours différé. Ce
chantier ne concerne que plusieurs artistes sous un **même** compte/owner_id,
pas plusieurs comptes sur un même artiste.

## Décisions

### 1. Aucun changement de schéma ni de RLS

Exploration du code avant de commencer (cf. session) : `artists.owner_id`
n'a jamais eu de contrainte unique, et les policies RLS
(`artists_select_own_or_staff` etc.) comme la fonction `owns_artist(artist_id)`
utilisée par `releases`/`tracks`/`stats_monthly` étaient déjà scopées par
`artist_id`, pas par "l'artiste unique du owner". La base supportait déjà
plusieurs artistes par compte — seule la couche application supposait le
contraire. Seule migration : mise à jour du commentaire de
`public.artists`, devenu factuellement faux
(`20260722110000_multi_artist_label_comment.sql`).

### 2. "Artiste actif" : cookie, pas paramètre d'URL

Les routes existantes (`/app`, `/app/distribution`,
`/app/distribution/[releaseId]`) ne sont pas scopées par artiste dans leur
structure — les restructurer (`/app/[artistId]/...`) aurait cassé les liens
existants pour un gain minime. À la place, un cookie httpOnly
`active_artist_id` (`src/lib/artists/active-artist.ts`,
`setActiveArtist` dans `artist-actions.ts`) mémorise le choix, lu aussi bien
par les Server Components (`page.tsx`) que par les Server Actions
(`distribution/actions.ts`). Retombe sur le plus ancien artiste du compte si
absent/invalide — comportement identique à l'ancien code pour un compte
Solo/Pro à un seul artiste (aucune régression pour ces forfaits).

### 3. `requireArtist()` scindé en deux, pas juste corrigé

Le point d'entrée unique `requireArtist()` de `distribution/actions.ts`
resélectionnait toujours "le plus ancien artiste du owner" — correct pour un
seul artiste, silencieusement faux dès qu'il y en a plusieurs (une release de
l'artiste #3 aurait été modifiée en croyant agir pour l'artiste #1, avec des
vérifications comme `.eq("artist_id", artistId)` qui auraient simplement
échoué pour les releases n'appartenant pas au premier artiste).

Scindé en :

- `requireActiveArtist()` — pour les actions **sans** `releaseId` encore
  (créer une sortie, dédupliquer/lister le catalogue) : résout l'artiste actif
  via le cookie.
- `requireUser()` — pour les ~14 actions déjà scopées par un `releaseId`
  existant (mise à jour métadonnées, pistes, artwork, soumission,
  takedown...) : n'a plus besoin de dériver un artiste du tout, la RLS
  `owns_artist(artist_id)` sur `releases`/`tracks` suffit à elle seule à
  garantir qu'on ne touche que les releases du bon artiste, quel que soit
  celui actif dans le switcher. Les deux filtres redondants
  `.eq("artist_id", artistId)` (`createAddonCheckoutAction`, `submitRelease`)
  qui comparaient contre un artiste potentiellement faux ont été retirés —
  ils dupliquaient la RLS de façon incorrecte plutôt que de l'appuyer.

### 4. Créer l'artiste #2-5 : nouvelle route, formulaire réutilisé

`/app` n'affiche `OnboardingForm` que quand le compte n'a **aucun** artiste
— il fallait un point d'entrée pour en ajouter un une fois qu'on en a déjà
un. Nouvelle route `/app/artistes/nouveau`, qui réutilise `OnboardingForm`
avec une prop `variant="add"` (copie différente, et redirige vers `/app` en
définissant le nouvel artiste comme actif au lieu du `router.refresh()` du
premier onboarding) plutôt que de dupliquer le formulaire. `createArtistProfile`
retourne désormais l'id créé pour permettre ce chaînage.

Le plafond réel reste appliqué côté serveur dans `createArtistProfile`
(inchangé depuis l'ADR 0026) ; la page `/app/artistes/nouveau` fait en plus
une vérification amont pour rediriger vers `/app` si le compte a déjà
atteint son plafond, afin de ne pas afficher un formulaire voué à échouer à
quelqu'un qui naviguerait directement sur l'URL.
