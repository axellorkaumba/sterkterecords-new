# ADR 0031 — Correctifs de la revue ligne-par-ligne

**Statut :** Implémenté. Vérifié par build/typecheck/lint/i18n et un test
manuel minimal (redirection, routes clés) — pas de test de charge simulant
réellement la concurrence des 5 races corrigées, par nature difficile à
reproduire en local sans outillage dédié.

## Contexte

Demande d'Axel : "Revérifie tout le projet et dis moi ce qui va et ce qui ne
va pas". Vu la taille du code accumulé cette session, la revue a été
déléguée à 5 agents en parallèle, un par sous-système (auth/session,
distribution, paiements, comptes Label/collaborateurs, back-office/
validations), avec instruction explicite de ne remonter que des bugs
concrets et vérifiés (pas de style/refactor). 12 bugs confirmés. Axel a
demandé de tous les corriger ("Fais tout").

## 1. Redirection ouverte (`signIn`, sécurité)

`src/app/[locale]/(auth)/actions.ts` appelait `redirect(next)` avec pour
seule garde `next.startsWith("/")` — insuffisant, `//evil.com` satisfait ce
test et un navigateur le résout comme une URL externe (CWE-601). Nouveau
helper partagé `src/lib/supabase/safe-redirect.ts` (`isSafeRedirectPath`),
qui rejette aussi `//` et `/\`. Réutilisé dans `/api/auth/callback` par
cohérence, même si ce chemin n'était pas exploitable (déjà préfixé par
`origin`).

## 2-4. Courses TOCTOU sur les approbations (argent + intégrité)

Même défaut structurel trouvé à 4 endroits indépendants : lire un statut
puis l'écrire dans deux requêtes séparées, sans lien entre elles. Un
double-clic, une requête relancée après un délai, ou deux actions
concurrentes passent tous les deux la lecture avant qu'aucune écriture
n'ait eu lieu.

**Correctif appliqué partout à l'identique** : la transition de statut
devient elle-même la garde atomique (`UPDATE ... WHERE status = '<attendu>'`,
`.select().maybeSingle()` pour savoir si une ligne a réellement été
affectée) — et elle a lieu **avant** tout effet de bord (envoi externe,
création d'abonnement, email), pas après. Seul l'appel qui gagne la course
continue ; les autres reçoivent une erreur `already_processed` et ne
répètent aucun effet de bord.

- `src/app/(private)/admin/actions.ts` — `approveRelease`/`rejectRelease`.
  Pour `approveRelease`, la garde protège maintenant l'appel LabelGrid
  lui-même (double soumission externe possible sinon) ; si l'envoi échoue
  après la réclamation du statut, il repasse à `error` (déjà dans l'enum
  `release_status`) plutôt que de rester bloqué sur `delivering` sans aucune
  synchronisation.
- `src/app/(validations-root)/validations/(dashboard)/actions.ts` —
  `approvePaymentProof`/`rejectPaymentProof` : évite un double abonnement +
  double paiement enregistré pour une seule preuve.
- `src/app/api/webhooks/paypal/route.ts` — PayPal documente explicitement
  que le même événement peut être livré plus d'une fois ; évite double
  abonnement, double email de reçu, double incrément de coupon.

Stripe/Flutterwave ont le même défaut mais n'ont pas été corrigés — rails
abandonnés (décision confirmée par Axel), inutile d'investir dessus.

## 5. Rachat de coupon au-delà de `max_redemptions`

`validate_coupon` vérifie `redemptions_count < max_redemptions` au
checkout, mais l'incrément réel (`increment_coupon_redemption`) n'a lieu
que plus tard, dans le webhook, après paiement confirmé — sans réservation
entre les deux. Avec une place restante, deux paiements concurrents peuvent
tous les deux passer la vérification avant qu'aucun incrément n'ait eu
lieu. Migration `20260722140000_fix_coupon_redemption_race.sql` : la
fonction devient conditionnelle (`where ... and (max_redemptions is null or
redemptions_count < max_redemptions)`) — le verrou de ligne implicite de
l'UPDATE la rend atomique sous concurrence, le compteur ne peut plus jamais
dépasser le plafond. Ne résout pas la fenêtre entre validation et paiement
réel (inhérente à un paiement asynchrone), mais borne définitivement le
compteur.

## 6. `setActiveArtist` bloquait les collaborateurs

`src/app/(private)/app/artist-actions.ts` filtrait `owner_id = user.id`
avant de poser le cookie d'artiste actif — cassait le switcher pour tout
collaborateur (ADR 0030) : cliquer sur un artiste collaboré échouait
silencieusement (`not_found` jamais affiché), la page ne changeait jamais.
Retiré le filtre `owner_id` : la RLS `artists_select_own_or_staff`
(propriétaire OU `is_artist_collaborator` OU staff) est désormais la seule
autorité, cohérent avec le reste de l'architecture post-ADR 0030.

## 7. Ré-inviter un collaborateur accepté le révoquait

`inviteCollaborator` (`src/app/(private)/app/collaborateurs/actions.ts`)
faisait un `upsert` qui remettait toujours `status: "pending"`, y compris
sur une ligne déjà `"accepted"` — un propriétaire qui réinvitait par erreur
(ou pour changer `permission`) coupait l'accès sans le savoir. Vérifie
maintenant le statut existant avant l'upsert et refuse
(`already_accepted`) si déjà accepté, avec un message explicite dans le
formulaire expliquant qu'il faut d'abord révoquer.

## 8. Fingerprint de catalogue basé sur le mauvais artiste

`getArtistCatalogFingerprint()` résolvait l'artiste via
`requireActiveArtist()` (cookie), pas via la sortie réellement éditée —
pour un compte Label multi-artistes, si le cookie pointait vers un autre
artiste que celui de la sortie ouverte, la détection de doublons
(pistes/ISRC/titres) se faisait contre le mauvais catalogue. Prend
maintenant `artistId` en paramètre explicite, fourni par l'appelant
(`[releaseId]/page.tsx`, via `release.artist_id`) plutôt que résolu
implicitement.

## 9. `removeTrack` laissait des trous dans la numérotation

Supprimer une piste ne renumérotait pas les suivantes (1,2,3 → 1,3 après
suppression de la 2) — ces valeurs partent telles quelles jusqu'à
l'affichage et la livraison LabelGrid. Renumérote maintenant les pistes
restantes 1..n après coup, même logique que `reorderTracks`.

## 10. Doublon audio non revérifié côté serveur

`addTrack` faisait confiance au hash envoyé par le client sans le
recroiser avec le catalogue de l'artiste — la détection de doublon n'était
vérifiée que côté navigateur avant l'upload, aucun garde-fou serveur.
Ajouté une vérification `audio_hash` contre tout le catalogue de l'artiste
avant insertion (même portée que `getArtistCatalogFingerprint`), retourne
`duplicate_audio` si déjà présent.

## 11. `createDraftRelease` plantait pour un collaborateur pur

`requireActiveArtist()` peut résoudre vers un artiste collaboré (lecture
seule), pas seulement possédé. Sans contrôle explicite, l'insert échouait
contre la RLS (`releases_insert_own`, propriétaire uniquement) et
remontait comme un throw générique non catché côté `type-selector.tsx`.
Vérifie maintenant l'ownership avant l'insert et retourne une erreur
lisible (`read_only_access`) affichée dans l'UI plutôt qu'un crash.

## 12. Connexion Google (staff) atterrissait sur `/app`

`/api/auth/callback` redirigeait toujours vers `/app` après un succès
OAuth, en comptant sur `src/proxy.ts` pour renvoyer vers `/admin` — mais
`proxy.ts` ne fait ce contrôle que pour les visites _de_ `/admin`, jamais
en sortie de `/app`. Un compte interne (super_admin, support...) connecté
via Google restait sur `/app` et devait naviguer manuellement. Calcule
maintenant le rôle après `exchangeCodeForSession` et utilise
`homeForRole`, comme le fait déjà `signIn` (email/mot de passe).
