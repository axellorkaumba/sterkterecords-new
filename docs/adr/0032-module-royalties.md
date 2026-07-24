# ADR 0032 — Module Royalties (retraits de fonds)

**Statut :** Implémenté. Vérifié par build/typecheck/lint/i18n. Migration
appliquée au projet Supabase distant. Pas de test de charge sur les
triggers de recalcul de solde ni de vrai virement mobile money/PayPal
sortant — ce module reste "manuel" côté exécution du paiement, comme
`payment_proofs` l'est côté encaissement.

## Contexte

Question d'Axel : "Pour la partie reversement de fonds tu as prevus ces
pages ?". Réponse : non — la table `wallet` existait mais n'était jamais
écrite, et `/app/revenus` comme `/admin/finances` étaient des placeholders
"Bientôt disponible" (déjà notés comme reportés au "module Royalties (V1)"
dans les ADR 0008/0009). Aucune capture de moyen de retrait, aucun flux de
validation staff. Axel a demandé : "Activer tout et construire tout pour
que l'on puisse tout tester avant lancement" — construire les deux côtés
(artiste et équipe) en entier.

Ce module est plus sensible que les précédents : l'argent sort désormais
vers les artistes, alors que tout le travail précédent (ADR 0026, 0031 §2-4)
ne concernait que l'argent entrant.

## Pourquoi pas d'ingestion automatisée LabelGrid

Il n'existe aujourd'hui aucune intégration réelle qui alimente
`stats_monthly` en revenus DSP — seul un client `getLabelGridClient()` avec
des stats déjà exposées en lecture existe. Construire une vraie ingestion
automatisée est hors scope de cette demande (Axel veut tester le parcours
de bout en bout, pas attendre une intégration tierce). Solution retenue :
un formulaire staff (`/admin/finances`) pour saisir manuellement un relevé
DSP (`recordRoyaltyStatement`), qui insère directement dans
`stats_monthly` — la vraie ingestion pourra remplacer cette saisie
manuelle plus tard sans changer le reste du module, puisque le solde se
recalcule depuis la même table quelle que soit la source.

Volontairement, ce formulaire n'a pas de champ `trackId` — il attribue le
revenu au niveau artiste uniquement, pour rester à 6 champs. Limitation
documentée : ces lignes saisies manuellement n'alimentent pas le widget
"Top titres" du dashboard (qui a besoin d'un `track_id`).

## Calcul du solde : triggers plutôt qu'un job batch

`wallet.balance_available` / `balance_pending` sont recalculés par la
fonction `recompute_wallet(user_id)` :

- `balance_pending` = somme des retraits `pending`
- `balance_available` = `total_earned - pending - paid`, où `total_earned`
  vient de `stats_monthly.revenue` joint aux artistes possédés par
  l'utilisateur

Deux triggers (`recompute_wallet_on_stats`, `recompute_wallet_on_withdrawal`)
appellent cette fonction à chaque `INSERT/UPDATE/DELETE` sur
`stats_monthly` et `withdrawals`. Choisi plutôt qu'un job planifié car il
n'y a pas d'ingestion continue à batcher — le solde doit refléter
immédiatement une saisie manuelle de relevé ou une demande de retrait,
sans latence ni tâche cron à maintenir.

## Snapshot du moyen de paiement à la demande

`withdrawals.payout_method` / `payout_details` sont copiés depuis
`payout_methods` **au moment de la demande** (`requestWithdrawal`), pas
relus en direct à chaque affichage. Si l'artiste change son IBAN après
avoir demandé un retrait, la demande déjà en attente reste sur l'ancien
moyen — même raisonnement déjà appliqué à `payment_proofs` et
`artist_collaborators` (snapshot au moment de l'action, pas de référence
vivante).

## Garde atomique sur le traitement staff

`markWithdrawalPaid` / `rejectWithdrawal`
(`src/app/(private)/admin/actions.ts`) reprennent le motif établi en
ADR 0031 §2-4 : la transition de statut est elle-même la garde
(`UPDATE ... WHERE status = 'pending' ... RETURNING id`), appliquée
directement plutôt que découverte plus tard sous forme de bug — deux clics
"Marquer payé" simultanés (ou un admin qui rejette pendant qu'un autre
paie) ne peuvent plus tous les deux réussir.

## Deux systèmes d'auth staff distincts, gardés séparés

Le traitement des retraits vit sous `/admin` (rôle Supabase, `requireStaff()`),
pas sous `/validations` (JWT `admin_users` séparé, ADR 0026). Confirmé par
le commentaire du rôle `accounting` dans l'enum `user_role`
("Virements, royalties, retraits, exports financiers") : `/validations`
reste dédié à la seule review des preuves de paiement entrantes,
`/admin` gère tout le reste du back-office, y compris désormais les
sorties d'argent.

## Ce qui a été activé

- `/app/parametres` — nouvel onglet "Moyen de retrait" (Airtel Money,
  Orange Money, PayPal, virement bancaire), formulaire à forme
  conditionnelle selon la méthode choisie (`payoutMethodSchema`, union
  discriminée Zod)
- `/app/revenus` — solde disponible/en attente, formulaire de demande de
  retrait (bloqué si aucun moyen de retrait renseigné ou si montant >
  solde disponible), historique des demandes
- `/admin/finances` — saisie de relevé DSP manuel, liste des retraits en
  attente avec actions "Marquer payé" / "Refuser" (motif obligatoire,
  visible par l'artiste)
- Entrées de navigation `/app/revenus` et `/admin/finances` passées de
  `available: false` à `true` dans les sidebars respectives
- Bouton "Demander un retrait" du dashboard artiste (`quick-actions-card.tsx`)
  activé, pointe vers `/app/revenus`

## Ce qui reste hors scope

- Exécution réelle du virement/mobile money — reste manuelle hors système,
  "Marquer payé" n'est qu'une confirmation (même modèle opérationnel que
  la validation des preuves de paiement entrantes)
- Ingestion automatisée des relevés DSP LabelGrid (saisie manuelle en
  attendant, voir plus haut)
- Attribution des revenus par piste (`trackId` absent du formulaire staff)
