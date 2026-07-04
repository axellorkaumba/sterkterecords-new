# ADR 0007 — Architecture de l'authentification (Sprint 3)

**Statut :** Validé par Axel (2026-07-04), avec deux amendements — voir
"Amendements validés par Axel" en bas : (1) Apple Sign In reste différé mais
l'architecture complète (interfaces/providers/callbacks/DB/comptes liés) est
construite dès maintenant, activable sans refonte ; (2) la liste pays/devises
initialement proposée (~27 pays génériques) a été remplacée par une liste
métier (~36 pays, 11 devises) pensée pour les marchés réels de la distribution
musicale Sterkte Records, servie depuis une table de configuration plutôt que
codée en dur.

## Contexte

Le §11.2 du CDC demande : email + mot de passe, Google (`[MVP]`), Apple
(`[V1]`), vérification email obligatoire avant paiement, 2FA (TOTP)
obligatoire pour les retraits/optionnelle ailleurs (`[V1]`), réinitialisation
de mot de passe, gestion des sessions/appareils, et des Paramètres complets
(profil, langue, devise, abonnement, moyens de paiement, notifications,
sécurité, suppression de compte RGPD). Le §7 définit 9 rôles, le §17 exige
RLS + contrôle de rôle serveur + audit log des actions sensibles.

## Décisions

### 1. Flux PKCE unifié, un seul callback

`src/app/api/auth/callback/route.ts` échange le `code` PKCE pour TOUS les
retours vers le site : connexion Google, confirmation d'inscription,
réinitialisation de mot de passe. `type`/`locale`/`next` ne sont pas des
paramètres Supabase mais les nôtres, embarqués dans les URLs
`redirectTo`/`emailRedirectTo` passées à `signInWithOAuth`/`signUp`/
`resetPasswordForEmail` — Supabase se contente d'ajouter `?code=...` sans
autrement modifier l'URL fournie. Placé sous `/api/` (déjà exclu du matcher
next-intl, voir `src/proxy.ts`) pour ne pas toucher au routing par préfixe de
langue.

### 2. Attribution des rôles

Le formulaire public `/inscription` attribue toujours le rôle `artist` (le
trigger `handle_new_user`, migration `20260704140000_auth_profiles_and_roles.sql`,
n'accepte aucune entrée de rôle). Cohérent avec le parcours self-service du
§10.1 : aucun signal de rôle interne (`super_admin`, `accounting`, `support`,
`ar_manager`, `marketing`) n'existe côté formulaire public. Les rôles staff
sont attribués manuellement (voir `supabase/seed.sql` pour le bootstrap du
premier `super_admin`, Axel) ; `manager` (forfait Label) et `organizer`
(Booking) seront attribués par la logique produit des sprints correspondants,
pas au signup.

Un trigger `protect_profile_role` empêche un utilisateur de changer son
propre `role` via une simple mise à jour de son profil — seul `super_admin`
ou le client `service_role` le peuvent (défense en profondeur, §17).

### 3. Apple Sign In différé, architecture complète prête (validé par Axel)

Apple est `[V1]` au §11.2, ET nécessite un compte Apple Developer payant
(99 $/an) + génération d'un client secret JWT signé (rotation ~6 mois) : un
blocage administratif, pas seulement un manque de temps de dev — même famille
de décision que LabelGrid (ADR 0003). Axel a validé le report **à condition
que rien ne soit à refaire à l'activation** : c'est le cas, chaque couche est
déjà provider-agnostique.

- **Interfaces/registre** : `src/app/[locale]/(auth)/oauth-providers.ts`
  définit `OAuthProviderId = "google" | "apple"` et
  `getEnabledOAuthProviders()`, qui active Apple dès que
  `SUPABASE_AUTH_EXTERNAL_APPLE_CLIENT_ID`/`SUPABASE_AUTH_EXTERNAL_APPLE_SECRET`
  sont renseignées (même mécanique que le mock LabelGrid — bascule sur
  présence de variable d'environnement, jamais de code à changer).
- **Providers/config** : `supabase/config.toml` a déjà le bloc
  `[auth.external.apple]` (désactivé, `client_id`/`secret` en substitution
  `env(...)`) ; `.env.example` documente les deux variables à renseigner.
- **Server Action générique** : `signInWithOAuth` (dans
  `src/app/[locale]/(auth)/actions.ts`) prend le provider en paramètre
  (`FormData`, validé contre `OAUTH_PROVIDER_IDS`) — ni Google ni Apple
  n'ont de Server Action dédiée à maintenir séparément.
- **Composant UI générique** : `OAuthButton`/`OAuthButtons`
  (`src/app/[locale]/(auth)/oauth-button.tsx`) rendent un bouton par provider
  actif, icône Apple déjà dessinée (SVG monochrome `currentColor`) —
  n'affichent le bouton Apple que lorsque `getEnabledOAuthProviders()` le
  retourne.
- **Callback** : `src/app/api/auth/callback/route.ts` échange le `code` PKCE
  sans jamais nommer de provider — déjà valide pour Apple tel quel.
- **Base de données** : aucune table dédiée par provider — Supabase Auth gère
  nativement les identités multiples par utilisateur
  (`auth.identities`, une ligne par provider lié à un même `auth.users.id`).
  Le trigger `handle_new_user` (migration `20260704140000`) se déclenche à
  l'identique quel que soit le provider d'origine (email, Google, Apple).
- **Comptes liés** : Paramètres > Sécurité affiche un statut Lié/Non lié par
  provider actif et des actions `linkOAuthIdentity`/`unlinkOAuthIdentity`
  (`supabase.auth.linkIdentity`/`unlinkIdentity`, natif Supabase) — permet à
  un utilisateur déjà inscrit par email de lier son compte Apple une fois le
  provider activé, sans migration de compte.

**Activation future (aucun développement requis)** : créer le compte Apple
Developer, générer le Services ID + client secret JWT, renseigner les deux
variables d'environnement, activer `[auth.external.apple]` (local) ou le
provider Apple du dashboard (cloud). Le bouton, le callback, l'attribution de
rôle et les comptes liés fonctionnent immédiatement.

### 4. 2FA (TOTP) construit malgré le tag `[V1]` du CDC

Contrairement à Apple, la 2FA TOTP est **nativement supportée par Supabase
Auth** (`auth.mfa.enroll/challengeAndVerify/unenroll`) — aucune dépendance
externe, aucun compte tiers à créer. Comme le Sprint 3 s'intitule
"Authentification complète" et que §17 en fait une exigence de sécurité, elle
est construite maintenant (Paramètres > Sécurité) plutôt que reportée.
**Non branchée** : l'exigence "obligatoire pour valider un retrait" — le
module Royalties/Payouts n'existe pas encore. Quand il sera construit, il
devra appeler `supabase.auth.mfa.getAuthenticatorAssuranceLevel()` et exiger
`aal2` avant d'autoriser une demande de retrait.

### 5. Gestion des sessions limitée à "déconnexion globale"

Supabase n'expose pas d'API simple pour qu'un utilisateur liste/révoque ses
sessions par appareil individuellement (ce niveau de détail nécessiterait une
table de sessions custom et une ingénierie dédiée, hors de proportion pour ce
sprint). Paramètres > Sécurité propose donc uniquement
`supabase.auth.signOut({ scope: "global" })` ("se déconnecter de tous les
appareils"), qui couvre le besoin de sécurité réel (compte compromis) sans
sur-construire.

### 6. `profiles.locale` prioritaire sur le cookie pour `/app`/`/admin`

Conformément à la décision validée au Sprint 0 (ADR 0002) : `src/i18n/request.ts`
lit désormais `profiles.locale` en priorité pour un utilisateur authentifié
visitant `/app`/`/admin` (pas de segment `[locale]`), avec repli sur le
cookie `sterkte_locale` si non authentifié ou si Supabase n'est pas
configuré. Le changement de langue dans Paramètres met à jour `profiles.locale`
**et** le cookie (cohérence si l'utilisateur se déconnecte), puis recharge la
page.

### 7. Paramètres > Abonnement : placeholder assumé

Le §11.2 liste "abonnement, moyens de paiement" dans les Paramètres, mais ces
fonctionnalités dépendent du module Distribution/Paiements (Stripe/
Flutterwave/Paystack, table `subscriptions`) qui n'existe pas encore. L'onglet
affiche le plan actuel (toujours "Free" en l'absence de ligne `subscriptions`)
et un lien vers `/tarifs`, sans logique de facturation — sera complété
lorsque le module de paiement sera construit.

### 8. Contrainte d'environnement — pas de test de bout en bout

Ni Docker (`supabase start` impossible) ni projet Supabase Cloud ne sont
disponibles dans cet environnement (décision explicite d'Axel : "code
d'abord, test plus tard"). Conséquences :

- Toute la migration SQL, les policies RLS et le type `Database` (écrit à la
  main dans `src/types/database.types.ts`) sont **vérifiés uniquement par
  lecture et cohérence interne**, jamais exécutés contre un vrai Postgres.
  À faire dès qu'un projet existe : `pnpm supabase:start` (ou un projet
  cloud) puis `pnpm supabase:migrate:up` et `pnpm supabase:gen:types` pour
  remplacer le type manuel par le vrai.
- Les Server Actions touchant Supabase (`signIn`, `signUp`, tout
  `/app/parametres/actions.ts`) ont été vérifiées par `typecheck`/`lint`, et
  par test navigateur jusqu'à la limite du possible : les formulaires (client
  React Hook Form + Zod), la navigation, `src/proxy.ts` (redirections
  `/app`→`/connexion?next=...`, `/admin`→`/connexion?next=...`) et l'atteinte
  correcte de l'appel Supabase (qui échoue alors avec le message clair
  "NEXT_PUBLIC_SUPABASE_URL... doivent être définis", pas un crash silencieux)
  sont confirmés en conditions réelles de navigateur. Le comportement
  au-delà de cette frontière (création réelle d'un compte, RLS en pratique,
  emails envoyés) reste à valider dès qu'un projet Supabase existe.

### 9. Pays/devises : table de configuration métier (validé par Axel, amendé)

Proposition initiale (~27 pays génériques codés en dur) rejetée par Axel au
profit d'une liste **métier**, pensée pour les marchés où Sterkte Records
opère réellement — et d'une architecture **base de données**, pas un tableau
TypeScript, pour permettre d'ajouter un pays/une devise sans toucher au code.

- **Tables** `public.countries` (36 pays) et `public.currencies`
  (11 devises) — migration
  `supabase/migrations/20260704150000_countries_and_currencies.sql`. RLS :
  lecture publique des lignes `active = true`, écriture réservée au
  `service_role` (gestion via le futur back-office, §11.10, ou SQL direct
  en attendant).
- **Liste validée par Axel** :
  - Afrique (24) : RDC, Congo-Brazzaville, Cameroun, Côte d'Ivoire, Sénégal,
    Gabon, Bénin, Togo, Burkina Faso, Mali, Guinée, Guinée Équatoriale,
    Rwanda, Burundi, Angola, Kenya, Tanzanie, Ouganda, Afrique du Sud, Maroc,
    Tunisie, Algérie, Égypte, Maurice.
  - Europe (10) : France, Belgique, Suisse, Luxembourg, Allemagne,
    Royaume-Uni, Pays-Bas, Espagne, Italie, Portugal.
  - Amérique du Nord (2) : Canada, États-Unis.
  - Devises (11) : EUR, USD, CDF, XAF, XOF, GBP, CAD, MAD, ZAR, KES, TZS.
- **`countries.default_currency`** (FK vers `currencies`) alimente la
  résolution "devise auto/pays" (§11.2). Pour les pays dont la devise
  nationale n'est pas dans la liste des 11 (ex. GNF, RWF, TND...), repli
  pragmatique sur USD ou EUR — documenté ligne par ligne dans la migration,
  réversible en ajoutant la devise native puis en réassignant
  `default_currency`, toujours sans changement de code.
- **`profiles.country`/`profiles.currency`** référencent désormais ces
  tables par contrainte `FOREIGN KEY` (remplace les `CHECK` par regex du
  premier jet) : une valeur invalide est rejetée par Postgres, pas
  seulement par la validation applicative.
- **UI** (`ProfileTab`/`LanguageTab`) reçoit les codes actifs en props
  depuis `page.tsx` (Server Component, lecture DB) — plus aucun import de
  liste en dur. Les libellés restent dérivés à l'affichage via
  `Intl.DisplayNames` (aucune traduction de nom de pays/devise à maintenir).
- **Étendre la liste** : une ligne `insert into public.countries (...)` (ou
  `currencies`) via une nouvelle migration ou le futur back-office — jamais
  une modification de `ProfileTab`/`LanguageTab`.

## Point encore ouvert

- **Politique de mot de passe** : minimum 8 caractères (`config.toml`,
  schémas Zod) — le CDC ne précise pas de règle explicite au-delà de
  "haché" (§17) ; 8 caractères est un choix par défaut raisonnable, pas une
  exigence du CDC. Non tranché explicitement par Axel, signalé pour mémoire.
