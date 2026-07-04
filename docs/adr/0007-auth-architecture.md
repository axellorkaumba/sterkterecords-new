# ADR 0007 — Architecture de l'authentification (Sprint 3)

**Statut :** Informatif — documente des décisions prises pendant l'implémentation ; deux points restent à confirmer explicitement avec Axel (voir en bas).

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

### 3. Apple Sign In différé — même famille de décision que LabelGrid (ADR 0003)

Apple est `[V1]` au §11.2, ET nécessite un compte Apple Developer payant
(99 $/an) + génération d'un client secret JWT signé (rotation ~6 mois) : un
blocage administratif, pas seulement un manque de temps de dev. Le bouton
"Continuer avec Apple" n'est pas construit ; `supabase/config.toml` documente
la configuration cible (`[auth.external.apple]`, `enabled = false`) pour
quand Axel aura le compte développeur.

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

## À confirmer explicitement avec Axel

1. **Pays/devises** : liste resserrée à ~27 pays / 9 devises pertinents pour
   Sterkte Records plutôt que la liste ISO complète (voir
   `src/app/(private)/app/parametres/country-currency-data.ts`) — à étendre
   si un marché manquant se présente.
2. **Politique de mot de passe** : minimum 8 caractères (`config.toml`,
   schémas Zod) — le CDC ne précise pas de règle explicite au-delà de
   "haché" (§17) ; 8 caractères est un choix par défaut raisonnable, pas une
   exigence du CDC.
