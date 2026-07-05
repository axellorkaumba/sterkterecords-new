# ADR 0010 — Abonnement & Paiements (Sprint 6, §5, §11.2, §13.2)

**Statut :** Validé par Axel (2026-07-05) — trois décisions de cadrage explicitement demandées : Flutterwave comme rail Mobile Money (plutôt que Paystack), paywall bloquant dès ce sprint, et un modèle économique reconstruit autour d'un moteur de tarification générique (plans/régions/devises/remises/essais/options, "aucune valeur codée en dur").

## Contexte

Le §3.1 place "Abonnement (1 rail carte + 1 rail Mobile Money)" dans le socle
MVP. Deux questions de cadrage ont été posées avant ce sprint :

1. **Flutterwave vs Paystack** pour le rail Mobile Money Afrique → **Flutterwave**, retenu par Axel (couverture RDC la plus large, PSP par défaut RDC déjà cité par le §11.5 du CDC).
2. **Paywall bloquant dès ce sprint** (le parcours §10.1 place le paiement avant l'onboarding, mais Sprints 3/4 laissaient `/app` accessible sans abonnement — gap documenté dans ADR 0008) → **Oui**, retenu par Axel.

En creusant l'implémentation, une **incohérence de fond** est apparue : le
modèle de tarification déjà utilisé par la page `/tarifs` (Sprint 2) — 4
paliers Free/Artist/Pro/Label avec partage de revenus 70-85 % — ne
correspond pas au modèle réel du §5 du CDC (1 forfait SOLO, 100 % des
royalties). Cette divergence avait déjà été repérée et documentée comme
"à trancher" dans ADR 0006 au Sprint 2. Soumise à Axel, la réponse va
au-delà d'un simple choix entre les deux modèles existants : un modèle
SOLO / AFRIQUE (tarif régional) / LABEL (sur devis), **100 % des royalties
à l'artiste**, avec l'exigence explicite d'une **architecture de
tarification générique** — plusieurs plans, prix, devises, régions,
remises, essais, promotions, coupons et options additionnelles, **sans
valeur codée en dur**, pilotable plus tard par un back-office (hors
périmètre de ce sprint).

## Décisions

### 1. Moteur de tarification générique, piloté par configuration

Migration `20260705120000_pricing_and_payments.sql` : `plans` (catalogue
d'offres, `self_service` distingue SOLO de LABEL), `pricing_regions` +
`pricing_region_countries` (regroupement de pays pour un tarif régional —
ajouter un pays éligible à l'Afrique = une ligne insérée, jamais une
modification de code), `plan_prices` (plan × région × période × devise),
`plan_features` (fonctionnalités activables par plan, socle pour une
différenciation future — un seul plan self-service au lancement, donc non
encore consommé pour bloquer quoi que ce soit), `addons`/`addon_prices`
(catalogue générique d'options payantes, `apple_music_artwork` au
lancement), `coupons` + fonction `validate_coupon` (SECURITY DEFINER, ne
lit jamais la table `coupons` directement côté client — données
commerciales sensibles).

**Frontière assumée : structure en base, texte en i18n.** Les tables
pilotent l'existence des plans/prix/régions/features, mais les libellés et
descriptions marketing restent dans les fichiers de traduction (namespaces
`Pricing`, `SubscriptionPage`), cohérent avec la politique i18n existante
(ADR 0004) — stocker du texte traduit en base aurait dupliqué
l'infrastructure i18n sans bénéfice.

**Pas de back-office de gestion ce sprint.** Axel demande que
l'administration permette "plus tard" de créer des plans/tarifs/promotions
sans développeur — la table et la fonction de validation existent
(consommables immédiatement par un futur écran d'admin), mais aucune
interface CRUD n'est construite ici (relèverait du module Back-office,
§11.10, sprint séparé). Les 3 lignes de prix du lancement sont insérées
par la migration elle-même.

### 2. Tarifs du lancement — un seul point de prix par période/région

Seeds exacts du §5.2 : SOLO international mensuel 2,49 €, SOLO
international annuel 19,99 €, AFRIQUE annuel 9,99 $. **Aucun tarif mensuel
régional n'est inventé** : le CDC ne donne qu'un point de prix annuel pour
l'Afrique — `/app/abonnement` n'affiche donc que l'annuel pour cette région
(note explicite à l'utilisateur), plutôt que de fabriquer un chiffre non
validé. Ajouter un mensuel régional plus tard = une ligne insérée dans
`plan_prices`, aucun changement de code.

**`/tarifs` (page marketing publique) affiche ces mêmes prix en texte
statique i18n, pas via une lecture `plan_prices`.** Une première version
lisait la DB depuis ce Server Component — repérée en vérification finale :
`/tarifs` est prérendue statiquement (SSG, §18) et un appel Supabase y fait
échouer le build entier dès que le projet n'est pas joignable (précisément
le cas dans cet environnement), ce qui est un couplage à éviter même avec
un projet réel (build de marketing couplé à la disponibilité de la DB).
Même précédent que les tarifs Studio (Sprint 2, déjà en dur dans
`Studio.plans`). La source de vérité pour la transaction réelle reste
`plan_prices`, résolue par `/app/abonnement` (page privée, rendue à la
demande, jamais prérendue) — un changement de prix via le futur
back-office nécessitera une mise à jour de ce texte marketing (ou une
revalidation ISR), compromis assumé plutôt qu'une dépendance de build.

### 3. `/tarifs` et CGU corrigés pour refléter le vrai modèle

`/tarifs` (Sprint 2) et les CGU (Articles 2, 5.2, 8, 8.2, 8.3, 9.1, 9.2, 16 —
`src/content/legal-cgu.ts`, FR **et** EN) décrivaient un modèle à paliers
avec partage de revenus, incompatible avec la décision d'Axel. Réécrits
pour : modèle SOLO/AFRIQUE/LABEL, 100 % des royalties nettes à l'artiste
(Sterkte Records ne prélève **aucune** commission sur les revenus DSP — son
modèle repose sur les abonnements, options et prestations), seuil de
retrait aligné sur 100 $ (le CDC §11.5 le dit, les CGU disaient 25 $ — même
correction), et Article 16 réécrit sans "plan Free" de repli (qui n'existe
plus) : abonnement expiré → accès dashboard suspendu, sorties déjà
distribuées non affectées (royalties versées normalement), 90 jours de
grâce avant retrait effectif (même esprit protecteur que l'article
original, adapté à l'absence de palier gratuit).

**⚠️ Texte engageant juridiquement Sterkte Records — à faire relire par
Axel/un juriste avant mise en production**, comme déjà noté pour tout le
contenu CGU (ADR 0006).

### 4. Flutterwave : pas d'abonnement natif, paiement à l'acte

Stripe gère nativement les abonnements récurrents (`mode: "subscription"`,
webhooks `invoice.paid`/`customer.subscription.*`). Flutterwave n'a pas
d'équivalent fiable pour le Mobile Money africain : chaque échéance
(`src/lib/payments/flutterwave-provider.ts`) est un paiement à l'acte via
lien hébergé (`POST /v3/payments`), dont le webhook, une fois confirmé,
crée/étend la ligne `subscriptions` (`current_period_end = maintenant +
période`). **Le renouvellement automatique (relance à l'approche de
l'échéance) n'est pas construit ce sprint** — différé au job planifié
(Inngest, §6.1, pas encore mis en place, même limite documentée pour le
reporting mensuel LabelGrid, ADR 0009). Le paiement initial et la
résiliation manuelle fonctionnent pleinement dès maintenant.

Les clients bas niveau (`src/lib/payments/{stripe,flutterwave}/client.ts`)
existaient déjà depuis le Sprint 0 (singleton Stripe configuré,
`flutterwaveFetch` générique) — `stripe-provider.ts`/`flutterwave-provider.ts`
les réutilisent pour la logique métier (checkout, webhooks) plutôt que de
dupliquer un second client, conformément au commentaire déjà présent dans
ces fichiers ("la logique métier sera ajoutée avec le Sprint Paiements").

### 5. Paywall bloquant dans `src/proxy.ts`

`hasActiveEntitlement` (`src/lib/subscriptions/gate.ts`) : éligible si
`artists.plan = 'label'` (géré en back-office, pas de paiement
self-service attendu) **ou** abonnement `status = 'active'` non expiré.
Exemptés du paywall : `/app/abonnement` (pour pouvoir souscrire) et
`/app/parametres` (pour gérer/résilier un abonnement lapsé). Le staff
interne (rôles `STAFF_ROLES`) passe toujours, y compris sur `/app`. Ceci
tient la promesse d'ADR 0008 : "le choix de forfait/paiement viendra
s'insérer avant [l'onboarding] quand le module sera construit."

**Résiliation immédiate, pas de report à la fin de période.** Le bouton
"Résilier" (Paramètres) coupe l'accès tout de suite (Stripe :
`subscriptions.cancel()` réel + mise à jour locale immédiate ; Flutterwave :
statut local marqué `canceled`, aucun abonnement natif à annuler côté PSP).
Le CDC n'exige pas de "annuler à la fin de la période" — cette
simplification est documentée ici plutôt que silencieuse.

### 6. Add-on Apple Music : paiement réel avant soumission

Le Sprint 5 affichait le prix sans charge réelle (ADR 0009, décision 4 —
module Paiements pas encore construit). Ce sprint le branche réellement :
`step-submit.tsx` (§11.4 étape 9 — "paiement des add-ons éventuels") bloque
la soumission tant qu'un paiement `succeeded` n'existe pas pour l'add-on,
avec un bouton dédié qui lance un checkout one-time (Stripe ou Flutterwave
selon le pays) avant d'autoriser `submitRelease`.

### 7. Webhooks : client `service_role`, jamais la session utilisateur

`src/app/api/webhooks/{stripe,flutterwave}/route.ts` utilisent
`createAdminClient()` — un webhook n'a pas de session utilisateur
authentifiée, donc pas de contexte RLS à respecter ; c'est la même
exception déjà documentée pour `audit_log` (`src/lib/supabase/admin.ts`).
Stripe : vérification de signature sur le corps brut
(`stripe.webhooks.constructEvent`, jamais `request.json()` avant).
Flutterwave : vérification du `verif-hash` (secret partagé, pas une
signature HMAC) **puis** re-vérification de la transaction via
`GET /v3/transactions/{id}/verify` avant de créditer quoi que ce soit —
bonne pratique Flutterwave, le payload webhook seul n'est jamais fait
confiance (§17).

### 8. Contrainte d'environnement (inchangée)

Toujours aucun projet Supabase réel connecté, ni compte Stripe/Flutterwave
réel. Le schéma, les policies RLS, les clients de paiement et les webhooks
sont vérifiés par `typecheck`/`lint`/`build` et lecture/cohérence interne —
jamais par un vrai paiement de bout en bout. Prérequis externes non
automatisables depuis ce repo : URL de webhook Stripe/Flutterwave
configurée dans chaque dashboard PSP (pointant vers
`/api/webhooks/{stripe,flutterwave}` du domaine de production), et clés
API réelles dans les variables d'environnement (`.env.example` déjà
provisionné depuis le Sprint 0).
