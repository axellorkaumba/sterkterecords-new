# ADR 0012 — Back-office minimal (Sprint 8, §11.10)

**Statut :** Implémenté, non testable de bout en bout dans cet environnement.

## Contexte

Le §3.1 place "Back-office admin minimal (voir/valider les sorties, gérer
les artistes label)" dans le socle MVP — un sous-ensemble volontairement
étroit du §11.10 complet (qui couvre aussi Finances, Studio/Booking/
Featuring/Consulting/Support, Contenus, Paramètres plateforme — tous hors
périmètre ici, soit V1 soit dépendants de modules pas encore construits).

En construisant la file de validation qualité ("approuver / renvoyer avec
motif"), un **écart de fond avec le Sprint 5** est apparu : `submitRelease`
envoyait la sortie directement à LabelGrid, sans étape humaine
intermédiaire — alors que l'énumération `release_status` (Sprint 4) prévoit
déjà `in_review` entre `draft` et `delivering`, précisément pour accueillir
cette file de validation. Ce sprint referme cet écart plutôt que d'ajouter
un statut redondant.

## Décisions

### 1. `submitRelease` n'envoie plus à LabelGrid — la sortie rejoint `in_review`

Avant : l'artiste soumettait, LabelGrid recevait la sortie immédiatement,
statut → `delivering`. Après : l'artiste soumet, statut → `in_review`,
**aucun appel LabelGrid**. C'est la nouvelle action staff `approveRelease`
(`src/app/(private)/admin/actions.ts`) qui déclenche l'envoi réel — déplacé
tel quel depuis `submitRelease` (même appel `labelgrid.submitRelease()`,
mêmes champs). `rejectRelease` renvoie la sortie en `draft` (pas de nouveau
statut — l'artiste la retrouve dans son tunnel pour la corriger) et envoie
le gabarit "sortie à corriger" construit au Sprint 7 (`ADR 0011`,
resté sans déclencheur faute de ce workflow) avec le motif saisi par le
staff comme unique entrée du tableau `issues`.

Les textes ont été corrigés en conséquence : l'email "sortie soumise" et le
message de succès du tunnel ne disent plus "en route vers les plateformes"
mais "en cours de validation par notre équipe" — inexact depuis ce sprint.

### 2. Bug latent corrigé : `labelgrid_sync` écrit via le client admin

La table `labelgrid_sync` (migration Sprint 5) n'a jamais eu de policy
INSERT pour `authenticated` — son commentaire dit explicitement "Écrit par
le serveur". `submitRelease` l'insérait pourtant via le client RLS-scopé de
l'artiste, ce qui aurait échoué contre un vrai projet Supabase (jamais
détecté faute de projet réel, comme les autres bugs latents de ce type déjà
trouvés en fin de sprint). Corrigé au passage : `approveRelease` insère
`labelgrid_sync` via `createAdminClient()`, conforme au commentaire de la
migration.

### 3. RLS staff sur `releases`/`artists` plutôt qu'un bypass systématique

`approveRelease`/`rejectRelease` doivent modifier `releases.status`,
`toggleArtistPlan` doit modifier `artists.plan` — les policies UPDATE du
Sprint 4 (`releases_update_own`, `artists_update_own`) ne couvraient que le
propriétaire. Nouvelle migration
(`20260706090000_backoffice_minimal.sql`) : les deux policies deviennent
`_update_own_or_staff` (`owns_artist(...) or is_staff()`). Défense en
profondeur cohérente avec le reste du schéma (§17) : le staff a une session
authentifiée légitime, pas de raison de passer par le client `service_role`
comme pour un webhook.

### 4. Gestion des artistes Label : bascule de forfait, pas de création par le staff

Le §10.2 décrit l'artiste signé au label comme "géré en back-office", mais
l'inscription (compte, vérification email) reste toujours faite par
l'artiste lui-même — aucun flux self-service n'existe pour qu'un membre du
staff crée un compte au nom d'un tiers, et en créer un serait un chantier
disproportionné pour le "minimal" du MVP. À la place :
`/admin/artistes` liste tous les artistes (Solo/Label) et
`toggleArtistPlan` fait basculer `artists.plan` — un artiste Label garde
donc son compte self-service mais `hasActiveEntitlement`
(`src/lib/subscriptions/gate.ts`, Sprint 6) l'exempte déjà du paywall dès
que `plan = 'label'`, sans changement de cette logique.

### 5. Nav back-office complète avec badges, même précédent que `/app`

`AdminSidebarNav` reprend telle quelle la décision validée par Axel au
Sprint 4 pour `AppSidebarNav` : toutes les entrées du §11.10 apparaissent
dès ce sprint (Vue d'ensemble, Artistes, Sorties actifs ; Finances, Studio,
Booking, Featuring, Consulting, Support, Contenus, Paramètres grisés avec
badge "Bientôt disponible") plutôt que d'attendre chaque module. Réutilise
la même palette de composants (`Badge`, `cn`) sans nouvelle décision de
design.

### 6. Contrainte d'environnement (inchangée)

Toujours aucun projet Supabase réel connecté. Le schéma, les policies RLS
et les Server Actions du back-office sont vérifiés par
`typecheck`/`lint`/`build` et lecture/cohérence interne — jamais par un
vrai flux artiste → validation staff → livraison LabelGrid de bout en bout.
