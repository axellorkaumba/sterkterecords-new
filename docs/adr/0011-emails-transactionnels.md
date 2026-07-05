# ADR 0011 — Emails transactionnels (Sprint 7, §14)

**Statut :** Implémenté, non testable de bout en bout dans cet environnement (voir "Contrainte d'environnement" ci-dessous).

## Contexte

Le §14 liste les emails transactionnels attendus (bienvenue/vérification,
paiement/reçu, sortie soumise/livrée/à corriger, retrait confirmé, alerte
sécurité, etc.), tous "rendus" via React Email + Resend (`@react-email/
components`/`resend` déjà installés au Sprint 0, voir `src/lib/email/
resend.ts` : "Les templates React Email... seront ajoutés au Sprint
Emails"). Ce sprint construit ces gabarits et les branche sur les flux
réellement existants — email/auth (Sprint 3), paiements (Sprint 6),
distribution (Sprint 5) — sans attendre les modules pas encore construits
(studio, booking, featuring, consulting, royalties/retraits, contrats,
back-office qualité).

## Décisions

### 1. Emails d'authentification via le Supabase Auth "Send Email Hook", pas une réécriture du flux d'auth

Plutôt que de dupliquer manuellement l'envoi (`resend.emails.send`) après
chaque appel `signUp`/`resetPasswordForEmail`/`resend` — ce qui obligerait à
gérer soi-même la génération et la validité des tokens de vérification —,
`src/app/api/auth/email-hook/route.ts` intercepte l'envoi natif de Supabase
Auth via son "Send Email Hook" officiel (payload `{ user, email_data }`,
vérifié avec le package `standardwebhooks`, comme documenté par Supabase).
Zéro changement dans `src/app/[locale]/(auth)/actions.ts` : ces Server
Actions appellent toujours les méthodes Supabase Auth standard, c'est
Supabase qui redirige l'envoi vers ce endpoint une fois le hook activé côté
dashboard.

Le lien de confirmation est reconstruit selon le format documenté par
Supabase : `${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/verify?token_hash=...&
type=...&redirect_to=...` — il pointe vers l'endpoint Supabase natif, pas
vers une route de l'app, pour que la vérification du token reste gérée par
Supabase lui-même.

**Prérequis externe non automatisable depuis ce repo** : ce hook doit être
activé dans _Authentication > Hooks_ du dashboard Supabase (URL du endpoint

- secret `SUPABASE_AUTH_SEND_EMAIL_HOOK_SECRET`), une fois qu'un projet réel
  existe — même famille de contrainte que tous les webhooks précédents
  (Stripe, Flutterwave, LabelGrid).

### 2. Alertes de sécurité : redondance volontaire hook + appel direct

Le payload du Send Email Hook liste des types `*_notification` (mot de
passe changé, 2FA activée/désactivée, comptes liés/déliés, email changé) —
mais la documentation Supabase consultée ne confirme pas explicitement si
ces hooks se déclenchent automatiquement à chaque appel `updateUser`/
`mfa.enroll`/`mfa.unenroll`/`unlinkIdentity`, ou seulement dans certaines
conditions non précisées. Plutôt que de parier sur un comportement non
confirmé pour une fonctionnalité de sécurité, `src/app/(private)/app/
parametres/actions.ts` envoie **aussi** directement l'alerte depuis
`changePassword`, `verifyMfaEnrollment`, `disableMfa` et
`unlinkOAuthIdentity`, juste après le succès de l'appel Supabase. Risque
accepté : un envoi en double si Supabase déclenche effectivement le hook —
préférable à ne jamais alerter l'utilisateur. `linkOAuthIdentity` n'a pas
d'équivalent direct : cette action redirige immédiatement vers le provider
OAuth, la liaison se termine dans `/api/auth/callback` (pas de point de
retour propre dans le code applicatif) — repose uniquement sur le hook pour
ce cas précis.

### 3. Emails réellement câblés vs gabarits prêts mais non déclenchés

| Email (§14)                                                                                        | Déclencheur                      | Statut                                                                                                                                                                                               |
| -------------------------------------------------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bienvenue / vérification                                                                           | Send Email Hook (`signup`)       | ✅ câblé                                                                                                                                                                                             |
| Lien magique / invitation / réauthentification                                                     | Send Email Hook                  | ✅ câblé (aucun de ces flux n'est exposé dans l'UI actuelle, mais le gabarit répond déjà si Supabase les déclenche)                                                                                  |
| Changement d'email                                                                                 | Send Email Hook (`email_change`) | ✅ câblé                                                                                                                                                                                             |
| Réinitialisation mot de passe                                                                      | Send Email Hook (`recovery`)     | ✅ câblé                                                                                                                                                                                             |
| Alerte sécurité                                                                                    | Hook + appel direct (Paramètres) | ✅ câblé                                                                                                                                                                                             |
| Confirmation abonnement / reçu                                                                     | Webhooks Stripe/Flutterwave      | ✅ câblé (initial, renouvellement Stripe, add-on)                                                                                                                                                    |
| Sortie soumise                                                                                     | `submitRelease`                  | ✅ câblé                                                                                                                                                                                             |
| Retrait confirmé                                                                                   | `requestTakedown`                | ✅ câblé                                                                                                                                                                                             |
| Sortie livrée / mise à jour de statut                                                              | —                                | ⛔ gabarit prêt (`release-status-update.tsx`), **non déclenché** : aucun job ne fait transiter `releases.status` de `delivering` à `delivered`/`error` (§13.1, même lacune documentée dans ADR 0009) |
| Sortie à corriger                                                                                  | —                                | ⛔ gabarit prêt (`release-correction-needed.tsx`), **non déclenché** : le workflow de validation qualité back-office (§11.10) n'existe pas encore                                                    |
| Studio confirmé, featuring/booking/consulting, digest mensuel, contrat à signer, retrait royalties | —                                | Non construits : modules V1 correspondants pas encore développés (§11.5 Royalties, §11.6-11.9 Studio/Booking/Featuring/Consulting, §11.11 Contrats)                                                  |

### 4. Rendu et échec silencieux côté métier

Chaque gabarit est un composant React Email (`src/lib/email/templates/`),
envoyé via `resend.emails.send({ react: <Gabarit /> })` — pas de rendu HTML
manuel. `src/lib/email/send.tsx` centralise l'envoi : **un échec d'envoi
(Resend non configuré, erreur API) est journalisé (`console.error`) mais ne
fait jamais échouer l'action métier appelante** (soumission de sortie,
paiement confirmé, changement de mot de passe...). Un email transactionnel
raté est un problème de notification, pas une raison de bloquer l'action
réelle de l'utilisateur — même principe que les notifications in-app
existantes.

### 5. Langue du destinataire

`profiles.locale` fait foi. Deux résolutions selon le contexte d'appel :
`resolveUserLocale()` (client `service_role`, pour les webhooks/hooks sans
session utilisateur) et une requête RLS directe dans les Server Actions qui
ont déjà une session active (`distribution/actions.ts`, `parametres/
actions.ts`) — cohérent avec le principe "jamais le client admin quand une
session utilisateur suffit" (voir `src/lib/supabase/admin.ts`). Les
templates eux-mêmes sont traduits via `createTranslator` (next-intl, import
direct des fichiers de messages) plutôt que `getTranslations`, qui exige un
contexte de requête HTTP absent dans un webhook.

### 6. Aucune valeur en dur dans les gabarits — description des paiements par clé i18n

Première version : la description affichée sur le reçu ("Solo — annuel",
"Artwork Apple Music"...) était une chaîne française codée en dur passée
depuis les webhooks. Corrigé avant de committer : les webhooks passent
désormais une **clé** (`PaymentReceiptDescriptionKey`), traduite à
l'intérieur de `sendPaymentReceiptEmail` avec la langue du destinataire —
sinon un artiste anglophone aurait reçu un reçu partiellement en français.

### 7. Contrainte d'environnement (inchangée)

Toujours aucun projet Supabase, compte Resend, ni domaine d'expédition
vérifié dans cet environnement. Le hook, les webhooks et les gabarits sont
vérifiés par `typecheck`/`lint`/`build` et lecture/cohérence interne —
jamais par un envoi réel. Prérequis externes à configurer une fois un
projet/compte réel existe : domaine vérifié dans Resend (`RESEND_FROM_EMAIL`),
secret du Send Email Hook dans le dashboard Supabase
(`SUPABASE_AUTH_SEND_EMAIL_HOOK_SECRET`).

### 8. `@react-email/components` marqué déprécié par npm

`pnpm add` a signalé `@react-email/components@1.0.12` comme "no longer
supported" (le paquet meta continue de fonctionner, seule sa fiche npm est
dépréciée au profit des paquets `@react-email/*` individuels, déjà résolus
comme sous-dépendances). Non bloquant ce sprint — à réévaluer dans un futur
sprint de maintenance si le paquet cesse réellement de fonctionner.
