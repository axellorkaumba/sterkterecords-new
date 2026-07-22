# ADR 0030 — Collaborateurs par artiste (Phase 2) + vue consolidée Label (Phase 3)

**Statut :** Implémenté. Non vérifié en conditions réelles — aucune
invitation n'a encore été envoyée/acceptée sur le projet Supabase réel au
moment d'écrire ceci (nécessite `RESEND_API_KEY`, déjà configurée en
production selon l'audit précédent).

## Contexte

Suite de l'ADR 0029 : Axel a demandé de poursuivre directement avec les
Phases 2 et 3 qui y étaient annoncées et volontairement reportées.

## Phase 3 — Vue consolidée Label

Nouvelle page `/app/label`, réservée aux comptes `profiles.role = 'manager'`
avec un espace Label et au moins un artiste. Réutilise les mêmes composants
que le dashboard par-artiste (`StreamsCard`, `RevenueCard`, `ReleasesCard`,
`StreamsChartCard`, `TopTracksCard`) via une nouvelle fonction partagée
`aggregateDashboardStats` (`dashboard-stats.ts`, extraite de `page.tsx` pour
éviter de dupliquer la logique de regroupement par période/piste) — seule
différence : les requêtes source utilisent `.in("artist_id", artistIds)` au
lieu de `.eq("artist_id", artist.id)`.

**Le wallet n'a nécessité aucun changement** : `wallet.user_id` (pas
`artist_id`) est déjà consolidé au niveau du compte, donc déjà correct pour
un compte à plusieurs artistes sans rien y toucher — la même requête que
`page.tsx` suffit telle quelle.

Sous la vue agrégée, une liste de chaque artiste (streams du dernier mois,
nombre de sorties) avec un bouton "Voir" qui appelle `setActiveArtist` puis
redirige vers `/app` (réutilise le switcher de l'ADR 0027, pas de nouvelle
mécanique de navigation). Nouveau lien "Vue Label" dans la sidebar,
visible uniquement pour un compte manager (`layout.tsx` récupère
maintenant le rôle pour le transmettre à `AppSidebarNav`/`AppMobileNav`).

## Phase 2 — Collaborateurs par artiste

C'est le chantier que l'ADR 0008 (§7.2) avait différé depuis le tout début
du projet, et que l'ADR 0027 avait de nouveau explicitement exclu de son
périmètre.

### Coupe volontaire : lecture seule, quel que soit `permission`

Décision structurante prise avant d'écrire du SQL : donner de vrais droits
d'écriture à un collaborateur aurait exigé d'étendre les policies
INSERT/UPDATE sur `releases`/`tracks`/`contributors`/`release_platforms`
(environ 6 tables), avec le risque de sur-permissionner par erreur un
collaborateur "lecture seule". Le champ `artist_collaborators.permission`
(`view`/`manage`) existe dans le schéma et est visible dans l'UI d'invitation
— mais **rien n'est câblé pour que `manage` donne un droit de plus que
`view` aujourd'hui**. Toutes les policies d'écriture existantes
(`owns_artist`/`owns_release`) restent inchangées, donc réservées au
propriétaire. C'est un choix de scope assumé, pas un oubli — la copy de
l'interface le dit explicitement ("Peut gérer (bientôt)").

### Schéma : `artist_collaborators` + policies SELECT étendues, jamais les policies d'écriture

Nouvelle table `artist_collaborators` (artist_id, invited_email, user_id
nullable jusqu'à acceptation, permission, status pending/accepted/revoked,
token, invited_by). RLS : le propriétaire de l'artiste peut tout voir/créer/
modifier (`owns_artist`), l'invité ne peut voir que sa propre ligne
(`user_id = auth.uid()`).

Deux nouvelles fonctions `is_artist_collaborator(artist_id)` et
`is_release_collaborator(release_id)`, utilisées uniquement dans des
`alter policy ... using (...)` sur les policies **SELECT** existantes de
`artists`/`releases`/`tracks`/`stats_monthly`/`release_platforms`/
`labelgrid_sync` — jamais sur les policies INSERT/UPDATE, qui continuent
d'appeler `owns_artist`/`owns_release` seuls (voir coupe ci-dessus).
`ALTER POLICY` plutôt que DROP+CREATE : préserve l'identité de la policy,
et la clause ajoutée est toujours fausse tant qu'aucune ligne
`artist_collaborators` acceptée n'existe — aucun changement de comportement
pour un compte sans collaborateur.

**Hors périmètre de cette Phase 2** : `contributors` et `validation_reports`
(détail fin du tunnel d'édition) n'ont pas reçu la même extension — un
collaborateur voit le dashboard/catalogue/stats de l'artiste, pas encore le
détail des splits de contributeurs ni les rapports de validation qualité.

### Acceptation : fonction SECURITY DEFINER scopée par token, pas une policy UPDATE ouverte

`accept_artist_collaborator_invite(p_token)` — plutôt qu'une policy UPDATE
qui aurait dû autoriser n'importe quel utilisateur authentifié à modifier
`user_id`/`status`/`accepted_at` sur une ligne dont il ne connaît pas encore
le token exact (la RLS ne peut pas facilement dire "cet utilisateur est le
destinataire de cet email" avant qu'il n'ait accepté). Le token agit comme
une capacité porteuse (bearer) : le connaître suffit, exactement le même
modèle que les liens de confirmation email de Supabase lui-même.

Pour la même raison, la page `/app/invitations/[token]` (avant clic sur
"Accepter") lit la ligne via le client `service_role`
(`createAdminClient()`) plutôt que la session utilisateur, le temps
d'afficher le nom de l'artiste — normalement bloqué par la RLS puisque
`user_id` est encore `null` à ce stade.

### `getActiveArtist` mélange possédés + collaborés — mais `ownedCount` reste séparé

Un collaborateur doit voir l'artiste dans son switcher/dashboard sans en
être propriétaire. `src/lib/artists/active-artist.ts` retourne maintenant
`{ artists, activeArtist, ownedCount }` : `artists` mélange les deux
sources (pour l'affichage), `ownedCount` reste strictement le nombre
d'artistes possédés — c'est lui qui doit être comparé à `plans.max_artists`
(`page.tsx`), jamais `artists.length`, sous peine de compter les artistes
des autres dans le plafond du compte qui les possède. Bug qu'il aurait été
facile d'introduire silencieusement en réutilisant `artists.length` partout
par réflexe.

`listOwnedArtists` (ADR 0027) reste inchangée à dessein — encore utilisée
telle quelle pour le plafond Label (`artistes/nouveau/page.tsx`) et la vue
consolidée (`label/page.tsx`), qui doivent rester strictement scopées "mes
propres artistes".

### Gestion des collaborateurs : réutilise le slot de nav "Équipe" déjà prévu

`/app/collaborateurs` (scopée sur l'artiste actif, comme le reste du
dashboard) réutilise le lien de nav "Équipe" (`/app/equipe` →
`/app/collaborateurs`, `available: false` → `true`) qui existait déjà dans
`AppSidebarNav` comme placeholder "Bientôt disponible" — pas de nouvelle
entrée de nav à inventer. Un utilisateur qui n'est que collaborateur (pas
propriétaire) de l'artiste actif voit un message explicatif au lieu du
formulaire d'invitation (garde applicative en plus de la RLS, qui bloque de
toute façon silencieusement l'écriture pour lui).

## Limites connues, non résolues dans ce chantier

- Un collaborateur invité qui n'a pas encore de compte Sterkte doit
  s'inscrire puis re-cliquer sur le lien d'invitation — pas de
  `next=`/redirection automatique après confirmation d'email pour le
  ramener directement sur `/app/invitations/[token]`.
- Les boutons d'édition (nouvelle sortie, modifier une piste...) restent
  visibles pour un collaborateur "lecture seule" — bloqués par la RLS s'il
  clique, mais pas masqués dans l'UI. Correct en sécurité, pas encore poli
  en UX.
- `permission = 'manage'` n'a aucun effet réel — voir la coupe volontaire
  ci-dessus.
