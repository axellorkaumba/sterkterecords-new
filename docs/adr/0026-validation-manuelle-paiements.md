# ADR 0026 — Accès immédiat + validation manuelle des paiements

**Statut :** Implémenté (code + migrations appliquées au projet Supabase
réel). Non vérifié en bout en bout (pas de compte admin réel créé, pas de
`ADMIN_SESSION_SECRET` configuré sur Vercel dans cet environnement).

## Contexte

Demande directe d'Axel, une déviation volontaire du modèle "paiement avant
accès" du §10.1 initial (ADR 0007/0010) : trop de friction à l'inscription
pour un marché où mobile money/virement dominent et où les rails
automatisés (Stripe, Flutterwave) sont déjà connus pour être incomplets
(voir ADR 0025 — RDC toujours non résolue côté réception).

Le nouveau modèle :

1. Un artiste qui s'inscrit a **accès immédiat** à `/app`, dont
   `/app/distribution` — il peut préparer une sortie entière (métadonnées,
   audio, artwork, plateformes) sans payer d'abord.
2. **L'envoi final** d'une sortie à l'équipe (`submitRelease`) est
   conditionné à un compte **validé** : abonnement actif, obtenu soit par
   checkout automatisé (Stripe/Flutterwave/PayPal, inchangé), soit par
   **preuve de paiement manuelle** (mobile money/PayPal) uploadée par
   l'artiste et validée par l'équipe.
3. La validation manuelle se fait sur un **dashboard dédié** (`/validations`),
   avec des **comptes nommés séparés de Supabase Auth** (demande explicite —
   pas les mêmes identifiants que le back-office `/admin`).
4. **3 forfaits self-service** (Solo/Pro/Label) au lieu d'un seul (Solo) +
   Label sur devis — prix positionnés sous DistroKid/TuneCore/Ditto/Amuse.
5. **Label plafonné à 5 artistes** par compte (demande explicite).

## Décisions

### 1. Le paywall d'entrée est retiré, pas remplacé par un paywall différent

`src/proxy.ts` ne redirige plus vers `/app/abonnement` à l'entrée de `/app`.
La seule garde qui reste au niveau de `/app` est l'authentification Supabase
(faut être connecté). La contrainte de paiement se déplace entièrement dans
`submitRelease` (`src/app/(private)/app/distribution/actions.ts`), qui
appelle `hasActiveEntitlement` (déjà existant, `src/lib/subscriptions/gate.ts`,
inchangé) et renvoie `{ error: "account_not_validated" }` si le compte n'a ni
abonnement actif ni artiste au forfait Label. Le tunnel de distribution
(`step-submit.tsx`) affiche alors un bandeau avec un lien direct vers
`/app/abonnement`, sans bloquer la préparation de la sortie elle-même.

### 2. Dashboard de validation : auth totalement séparée de Supabase

Nouvelle table `admin_users` (username/display_name/password_hash bcrypt),
sans policy RLS pour `authenticated`/`anon` — accès exclusif via le client
`service_role`, jamais un utilisateur Supabase authentifié. Sessions signées
en JWT (`jose`, HS256, cookie `sr_admin_session` scopé à `/validations`,
12h) plutôt qu'une table de sessions à nettoyer — vérifiable aussi bien dans
`src/proxy.ts` (edge runtime) que dans les Server Actions.

`src/proxy.ts` traite `/validations` comme une troisième zone, indépendante
de la garde Supabase `/app`/`/admin` : vérifie le JWT directement depuis le
cookie de la requête, sans passer par `updateSupabaseSession`.

Comptes créés via `pnpm admin:create-user -- <username> "<Nom>" "<mdp>"`
(`scripts/create-admin-user.mjs`) — hash bcrypt calculé localement, jamais
un mot de passe en clair committé ou journalisé.

**Root layout dédié** (`src/app/(validations-root)/layout.tsx`) plutôt que
de réutiliser `(private)/layout.tsx` : `PrivateHeader` suppose une session
Supabase (email, lien `/app/parametres`, `signOut` Supabase) qui n'existe
pas pour un compte `admin_users`. Outil interne réservé à l'équipe (jamais
vu par un artiste) : texte en français en dur, **exception documentée** au
principe "zéro texte en dur" (§21) qui vise le contenu produit
artiste/visiteur, pas les écrans internes.

### 3. Preuve de paiement manuelle : nouvelle table, pas une extension de `payments`

`payment_proofs` (plan/période/région/montant/devise/moyen de paiement/clé
R2 de la capture/statut/motif de refus/qui a validé/quand) plutôt que de
réutiliser `payments` : le cycle de vie (upload artiste → attente → décision
admin) et les champs (OCR, capture) n'ont pas d'équivalent dans `payments`,
qui modélise des paiements déjà tranchés par un PSP. À l'approbation
(`approvePaymentProof`, `/validations`), une ligne `subscriptions` **et**
une ligne `payments` (`provider = 'manual'`) sont créées — exactement ce
qu'un webhook PSP ferait pour un paiement automatisé, pour que
`hasActiveEntitlement`/`isSubscriptionActive` n'aient aucune branche
spéciale à connaître.

**Durée fixe, comptée à l'approbation** — pas à l'upload : mensuel = +30
jours, annuel = +365 jours à partir de `now()` au moment où l'admin clique
"Approuver" (demande explicite d'Axel : "s'arrêtent automatiquement... 30
jours fixe... 365 jours").

### 4. OCR : Tesseract.js, indice jamais bloquant

`src/lib/ocr/payment-proof.ts` tourne juste après l'upload
(`submitPaymentProof`), best-effort, entouré d'un `try/catch` qui ne fait
jamais échouer la soumission de la preuve. Le texte + un montant "deviné"
(heuristique simple : plus grand nombre décimal plausible, plafonné à
100 000, pour ignorer numéros de téléphone/références) sont affichés à
l'équipe sur `/validations` comme indice — **jamais utilisés pour
auto-approuver**, l'admin voit toujours la capture elle-même.

### 5. Trois forfaits self-service — prix dérivés d'une recherche concurrentielle validée par Axel

`plans` passe de `(solo, label)` à `(solo, pro, label)` ; `label` devient
`self_service = true` (n'est plus "sur devis"). Recherche 2026
(DistroKid/TuneCore/Ditto/Amuse) présentée à Axel, positionnement "mid"
validé tel quel ("oui oui ça me va") :

| Forfait | Mensuel (EUR, intl) | Annuel (EUR, intl) | Annuel (USD, Afrique) |
| ------- | ------------------- | ------------------ | --------------------- |
| Solo    | 2,49                | 19,99              | 9,99 (inchangé)       |
| Pro     | 4,49                | 34,99              | 17,49                 |
| Label   | 7,49                | 59,99              | 29,99                 |

Le tarif régional Afrique de Pro/Label est **dérivé proportionnellement**
du ratio déjà établi pour Solo (9,99 / 19,99 ≈ 50 %) plutôt qu'inventé — même
principe que l'ADR 0010 ("aucune valeur codée en dur... mieux vaut ne rien
inventer qu'un chiffre non validé"). Pas de tarif mensuel régional Afrique,
même limite que Solo.

### 6. Label plafonné à 5 artistes — garde-fou posé, UI multi-artistes différée

`plans.max_artists` (1 pour Solo/Pro, 5 pour Label) vérifié dans
`createArtistProfile` (`src/app/(private)/app/actions.ts`) : le plafond
applicable est celui de l'abonnement actif le plus récent, ou 1 par défaut
(compte non encore validé). **Important** : la vraie gestion multi-artistes
(inviter/gérer plusieurs profils sous un compte Label) n'existe pas encore
côté UI — c'était déjà différé par l'ADR 0008 (§7.2, "comptes équipe/
managers multi-artistes"). Ce chantier pose uniquement le garde-fou en base,
prêt pour le jour où cette UI sera construite ; à date, un compte Label ne
peut de toute façon créer qu'un artiste via l'onboarding actuel (une seule
Server Action de création, appelée une fois).

### 7. `upload_kind`/`payment_provider`/`artist_plan` étendus (contrainte Postgres)

`ALTER TYPE ... ADD VALUE` isolé dans sa propre migration
(`20260722100000_manual_validation_enum_additions.sql`), consommé seulement
dans la suivante — même contrainte déjà rencontrée pour PayPal (ADR 0025).
`payment_proof` (upload_kind) réutilise `useResumableUpload`/
`upload_sessions` tel quel (capture de quelques centaines de Ko, le
multipart est surdimensionné mais évite de dupliquer toute la plomberie
d'upload direct-to-R2 pour un seul écran). `manual` (payment_provider) a un
`PaymentProviderClient` stub (`src/lib/payments/manual-provider.ts`) qui
lève si jamais appelé — n'existe que pour l'exhaustivité TypeScript du
`Record`, jamais résolu par `resolveProviderForCountry`.

## Prérequis externes non automatisables depuis ce repo

- **`ADMIN_SESSION_SECRET`** à générer (`openssl rand -base64 32`) et
  ajouter aux env vars Vercel — sans quoi `/validations/connexion` échoue
  proprement (`requireEnv` lève, capturé, message d'erreur générique).
- **Au moins un compte `admin_users`** à créer via
  `pnpm admin:create-user -- <username> "<Nom>" "<mot de passe>"` — table
  vide au déploiement, personne ne peut se connecter à `/validations` tant
  que ce n'est pas fait.
- Migrations déjà appliquées au projet Supabase réel (`sterkte-records`,
  via `supabase db push --linked`) et types régénérés
  (`src/types/database.types.ts`) — fait dans cette session, confirmé par
  `pnpm typecheck`/`pnpm build`.

## Limites connues, non traitées dans ce chantier

- Pas d'UI de gestion multi-artistes pour Label (voir point 6) — le plafond
  de 5 est posé, l'interface pour l'atteindre reste à construire.
- `admin/artistes/plan-toggle-button.tsx` (bascule Solo/Label manuelle par
  le staff) reste binaire — ne propose pas "Pro" comme option. Non bloquant
  (les 3 forfaits restent atteignables en self-service), mais à étendre en
  sélecteur 3 voies si le staff a besoin d'attribuer manuellement un
  Pro négocié hors plateforme.
- OCR non vérifié sur de vraies captures mobile money RDC/Maroc (pas
  d'exemple réel disponible dans cet environnement) — le montant "deviné"
  peut être imprécis, l'équipe doit toujours vérifier la capture.

## Vérification

- `pnpm typecheck`/`pnpm lint`/`pnpm i18n:check`/`pnpm css:check`/`pnpm build` :
  tous verts.
- Migrations appliquées au projet Supabase réel (`supabase db push --linked`,
  confirmé par `supabase gen types` incluant `admin_users`/`payment_proofs`/
  `payment_proof_status`/`max_artists`).
- `/validations/connexion` vérifié en local (rendu, pas d'erreur console) —
  la tentative de connexion échoue proprement en local faute de
  `NEXT_PUBLIC_SUPABASE_URL` dans `.env.local` (attendu, cet environnement
  de dev n'a pas les identifiants Supabase réels — ils existent côté
  Vercel).
- **Non vérifié** : flux complet upload preuve → OCR → validation admin →
  abonnement actif → envoi de sortie (nécessite un compte admin réel et des
  identifiants Supabase locaux, ni l'un ni l'autre disponibles dans cet
  environnement) — à tester par Axel une fois `ADMIN_SESSION_SECRET` et un
  premier compte admin en place.
