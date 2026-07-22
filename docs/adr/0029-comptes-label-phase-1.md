# ADR 0029 — Comptes Label, Phase 1 (fondations)

**Statut :** Implémenté (Phase 1 uniquement). Non vérifié en conditions
réelles — aucun compte Label n'a encore été créé sur le projet Supabase réel
au moment d'écrire ceci.

## Contexte

Retour d'Axel après un test réel : "je crée un compte [...] et aussi pour
les compte Label et les comptes Personne unique je ne pense pas que ça doit
être la même chose". Question posée en retour pour cadrer précisément
l'attente — réponse d'Axel : les trois éléments (inscription, onboarding,
dashboard/permissions/stats/royalties/collaborateurs) doivent différer entre
un compte Solo/Pro (un artiste) et un compte Label (plusieurs artistes,
gestion d'équipe).

C'est exactement le périmètre que l'ADR 0008 (§7.2) avait différé dès le
départ ("comptes équipe/managers multi-artistes... arriveront avec le
forfait Label") et que l'ADR 0027 avait de nouveau explicitement exclu de
son propre périmètre ("inviter un tiers... hors périmètre, volontairement").
Vu l'ampleur, ce chantier est découpé en 3 phases annoncées à Axel avant de
commencer :

- **Phase 1 (cet ADR)** : choix du type de compte à l'inscription, espace
  Label distinct du profil artiste, onboarding et en-tête de dashboard
  différenciés.
- **Phase 2 (non commencée)** : invitation de collaborateurs, permissions
  par artiste (rôle `team_member`, déjà dans l'enum `user_role` mais
  totalement inexploité — pas de flux d'invitation, pas de table de liaison,
  pas de policy RLS pour un accès partagé).
- **Phase 3 (non commencée)** : vue consolidée (royalties/stats/paiements
  agrégés sur tous les artistes d'un label) — aujourd'hui chaque artiste
  garde sa vue individuelle, pas de rollup au niveau du label.

## Décisions

### 1. `labels`, nouvelle table — pas une extension d'`artists`

Un label n'est pas un artiste : pas de sorties, pas de streams propres, pas
de plan de distribution. Nouvelle table `labels` (id, owner_id, slug, name,
bio, avatar_url), RLS calquée sur `artists`
(`labels_select_own_or_staff`/`insert_own`/`update_own`). Contrainte
`unique(owner_id)` — volontairement différente d'`artists` où plusieurs
lignes par `owner_id` sont normales (ADR 0027) : un compte Label n'a qu'un
seul espace Label, jamais plusieurs.

**Aucun changement à `artists`/`releases`/RLS existante.** Les artistes d'un
label restent liés par `artists.owner_id` — le même `owner_id` que la ligne
`labels` — pas par une clé étrangère `label_id`. Le switcher multi-artiste
(ADR 0027), `requireActiveArtist()`, `getArtistLimit()` continuent de
fonctionner tels quels pour un compte manager : "l'espace Label" est une
couche d'identité/branding par-dessus un mécanisme déjà construit, pas une
nouvelle dimension de scoping.

### 2. `profiles.role = 'manager'` — un champ de l'enum déjà là, jamais lu

`user_role` contient `manager` depuis la toute première migration auth
(20260704140000) avec le commentaire "Compte client, forfait Label — pilote
plusieurs artistes" — jamais utilisé par aucune Server Action jusqu'ici (le
self-service assignait toujours `artist`). `handle_new_user()` (le trigger
qui crée `profiles` à l'inscription) lit maintenant
`raw_user_meta_data->>'account_type'` : `manager` si `"label"`, `artist`
sinon (comportement inchangé pour toute inscription qui n'envoie pas ce
champ, donc rétrocompatible avec les comptes déjà créés).

### 3. Inscription : sélecteur avant tout le reste du formulaire

Deux boutons ("Artiste indépendant" / "Label ou manager") en haut de
`SignupForm`, avant même le nom — c'est la décision la plus structurante du
formulaire (elle détermine tout l'onboarding qui suit), elle doit être vue
en premier. Stocké dans `signUpSchema.accountType`, transmis à
`supabase.auth.signUp({ options: { data: { account_type } } })`, lu par le
trigger côté DB. Pas de nouveau champ pour le nom du label à cette étape —
volontairement : `fullName` reste "ton nom à toi" (le porteur du compte), le
nom du label est demandé séparément à l'étape suivante
(`LabelOnboardingForm`), pour ne pas mélanger les deux identités.

### 4. Onboarding en 2 temps pour un compte Label

`page.tsx` (`/app`) : si `role === 'manager'` et aucune ligne `labels`
n'existe → `LabelOnboardingForm` (nom/bio/logo du label). Une fois le label
créé, si aucun artiste n'existe encore → `OnboardingForm` avec une nouvelle
variante `"labelFirst"` (même formulaire/action que `variant="add"` de
l'ADR 0027 — le nouvel artiste devient actif et redirige vers `/app` — mais
copy différente : "Ajoute ton premier artiste" plutôt que "Bienvenue, crée
ton profil"). Un compte Solo/Pro (`role === 'artist'`, le défaut) traverse
exactement le même chemin qu'avant cet ADR, aucune régression.

### 5. En-tête : bande "Espace Label" au-dessus, pas un remplacement

`OverviewHeader` reçoit un `label` optionnel. Présent → une bande compacte
(logo + "Espace Label" + nom) au-dessus de la ligne artiste actif existante
(nom/avatar/switcher, inchangée). Absent (compte Solo/Pro) → rien ne change
visuellement. Choix délibéré de superposer plutôt que remplacer : le
contenu du dashboard (stats/sorties/wallet) reste scopé sur _un_ artiste à
la fois (celui sélectionné dans le switcher), la bande Label sert seulement
à rappeler dans quel espace on se trouve — la vraie vue consolidée
multi-artiste reste la Phase 3.

## Hors périmètre de cette Phase 1 (rappel)

Pas d'invitation de collaborateurs, pas de permissions différenciées par
personne, pas de vue royalties/stats agrégée au niveau du label — voir
Phases 2/3 ci-dessus. Un compte Label Phase 1 peut créer et piloter jusqu'à
5 artistes lui-même, seul — exactement les capacités déjà offertes par
l'ADR 0027, avec en plus une identité de compte différenciée dès
l'inscription.
