# ADR 0025 — PayPal comme troisième rail de paiement

**Statut :** Implémenté (code), non vérifié en bout en bout (pas de compte
sandbox PayPal réel disponible dans cet environnement). Migrations DB pas
encore appliquées au projet Supabase réel (à faire manuellement, voir plus
bas).

## Contexte

En QA post-déploiement, Axel a signalé que ni Stripe ni Flutterwave —
les deux rails prévus par le CDC (§11.5, ADR 0010) — ne permettent
réellement de **recevoir** des paiements dans les deux marchés du label :

- **Stripe** ne supporte pas la création de compte marchand en RDC (déjà
  documenté, ADR 0010) ni au Maroc.
- **Flutterwave**, choisi spécifiquement pour l'Afrique (§11.5), n'est en
  réalité disponible ni en RDC ni au Maroc pour Axel.

Recherche faite avant de coder quoi que ce soit (voir conversation) :

- **Maroc** : un compte PayPal Business marocain peut recevoir des
  paiements. Limites réelles — retraits vers un compte bancaire marocain
  plafonnés et encadrés par l'Office des Changes, frais plus élevés
  (3,4 % + fixe) qu'un rail local (CMI). Amélioré depuis septembre 2025
  (partenariat PayPal/Cash Plus pour les retraits locaux).
- **RDC** : les comptes PayPal enregistrés en RDC sont **envoi uniquement**
  — impossibles à utiliser pour recevoir. PayPal ne résout donc **pas** le
  problème côté Lubumbashi.

PayPal était déjà anticipé côté variables d'environnement
(`PAYPAL_CLIENT_SECRET`, tag `[V1]`) mais jamais câblé au code ni au schéma
DB — cette ADR accélère cette brique, pas une improvisation hors CDC.

## Décisions

### 1. PayPal ajouté comme rail supplémentaire, pas un remplacement

`payment_provider` passe de `('stripe', 'flutterwave')` à
`('stripe', 'flutterwave', 'paypal')` — Stripe et Flutterwave restent en
place pour les pays où ils fonctionnent déjà.

### 2. Migration en deux fichiers (contrainte Postgres)

`ALTER TYPE ... ADD VALUE` ne peut pas être utilisé dans la même
transaction que l'utilisation de cette valeur. Deux migrations séparées :

- `20260713200000_paypal_payment_provider.sql` — ajoute la valeur d'enum.
- `20260713200100_paypal_morocco_default.sql` — bascule
  `countries.default_payment_provider` du Maroc (`MA`) sur `paypal`.

**La RDC (`CD`) reste volontairement sur `flutterwave`** — la changer pour
`paypal` ne réglerait rien (PayPal n'y accepte pas la réception) et
prétendrait résoudre un problème qui ne l'est pas. Ce marché reste **un
problème ouvert, non résolu par ce commit** — piste explorée mais non
validée : un agrégateur Mobile Money type CinetPay (Afrique
centrale/francophone). À trancher avec Axel avant d'investir du temps de
build dessus.

### 3. Adaptateur calqué sur le modèle Flutterwave, pas Stripe

Comme Flutterwave, pas d'utilisation de l'API "Abonnements" native de
PayPal (Billing Plans/Subscriptions — plus complexe à mettre en place, mal
alignée avec le principe "prix 100 % piloté par la DB, jamais un objet
préconfiguré côté prestataire", déjà écarté pour Stripe au profit de
`price_data` inline). À la place : chaque échéance est une commande PayPal
(Orders API v2, `intent: CAPTURE`) à l'acte ; le webhook, une fois la
capture confirmée, crée/prolonge la ligne `subscriptions` — même mécanique
exacte que `flutterwave-provider.ts`/`api/webhooks/flutterwave`.

### 4. Client REST fin, pas de SDK officiel

Même choix que Flutterwave (`flutterwave/client.ts`) — cohérent avec
l'architecture en adaptateurs (§23). Seule différence structurelle : PayPal
utilise OAuth2 client-credentials (jeton à durée de vie ~9h) plutôt qu'une
clé secrète statique en en-tête, donc `paypal/client.ts` met en cache le
jeton en mémoire du process entre les appels.

### 5. Métadonnées : `payments.type`, pas un sac PayPal custom

PayPal ne permet de faire porter à une commande qu'un `custom_id` (une
chaîne, 127 caractères max) — contrairement au `meta` libre de Flutterwave.
Plutôt que d'y encoder un mini-format, `custom_id` = notre `paymentId`, et
le webhook relit `payments.type` (`subscription`/`addon`) et
`payments.metadata` (planId/période/coupon) depuis notre propre table —
même principe que le webhook Stripe (`session.metadata?.paymentId` puis
lecture de la ligne `payments`).

### 6. Vérification de signature via l'API PayPal dédiée

PayPal n'offre pas de HMAC calculable localement (Stripe) ni de secret
statique comparé tel quel (Flutterwave) : la vérification passe par un
appel serveur à `/v1/notifications/verify-webhook-signature` avec les
en-têtes `paypal-*` de la requête entrante + le `PAYPAL_WEBHOOK_ID` généré
par le dashboard PayPal au moment de créer le webhook.

### 7. Capture côté serveur, jamais fait confiance au seul webhook

Sur `CHECKOUT.ORDER.APPROVED`, le webhook capture explicitement la commande
(`POST /v2/checkout/orders/{id}/capture`) et ne crédite que si le statut de
capture retourné est `COMPLETED` — même principe de re-vérification que
`verifyFlutterwaveTransaction` (§17, "webhooks signés" ne suffit pas à eux
seuls).

## Prérequis externes non automatisables depuis ce repo

- Créer une app REST PayPal (dashboard développeur PayPal) → `PAYPAL_CLIENT_ID`/`PAYPAL_CLIENT_SECRET`.
- Créer un webhook pointant vers `/api/webhooks/paypal`, événement
  `CHECKOUT.ORDER.APPROVED` → `PAYPAL_WEBHOOK_ID`.
- `PAYPAL_API_BASE_URL` : sandbox (`https://api-m.sandbox.paypal.com`, valeur
  par défaut) pour les tests, `https://api-m.paypal.com` en production réelle.
- **Appliquer les deux migrations SQL au projet Supabase réel** (SQL Editor
  du dashboard, ou `supabase db push` une fois le CLI lié) — pas fait
  automatiquement par ce commit, contrainte d'environnement (pas d'accès
  direct à la base depuis cet outil).

## Vérification

- `pnpm typecheck`/`lint`/`i18n:check`/`css:check` : tous verts.
- Route `/api/webhooks/paypal` testée en local : échoue proprement avec un
  message explicite (`PAYPAL_WEBHOOK_ID` manquant) plutôt qu'un crash
  silencieux — comportement attendu tant que les identifiants réels ne sont
  pas configurés.
- **Non vérifié** : flux de paiement réel de bout en bout (aucun compte
  PayPal sandbox disponible dans cet environnement) — à tester par Axel une
  fois les identifiants PayPal et les migrations en place.
