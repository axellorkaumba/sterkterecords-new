# Sterkte Records Distributor

Plateforme SaaS de distribution musicale — Sterkte Records SARL
(Lubumbashi/RDC · Agadir/Maroc). Source de vérité produit : le cahier des
charges (`CDC_Sterkte_Records_Distributor.md`, fourni hors repo).

**Statut : Sprint 8 — Back-office minimal.** Authentification (Sprint 3),
dashboard artiste (Sprint 4), tunnel de distribution à 9 étapes (Sprint 5),
abonnement/paiements SOLO/AFRIQUE/LABEL (Sprint 6), emails transactionnels
(Sprint 7), et désormais le back-office minimal du MVP (§11.10, §3.1) :
file de validation qualité des sorties (approuver / renvoyer avec motif —
la sortie ne part vers LabelGrid qu'après approbation staff, revu depuis le
Sprint 5) et gestion des artistes Label vs Solo. Ceci clôt le socle MVP du
CDC (§3.1). **Aucun projet Supabase, bucket R2, compte Stripe/Flutterwave/
Resend réels ne sont encore branchés** : tout est vérifié par
`typecheck`/`lint`/tests navigateur jusqu'à la frontière de l'appel
Supabase/R2/PSP/Resend — voir `docs/adr/0007-auth-architecture.md`,
`docs/adr/0008-dashboard-artiste.md`, `docs/adr/0009-distribution-module.md`,
`docs/adr/0010-abonnement-paiements.md`,
`docs/adr/0011-emails-transactionnels.md` et
`docs/adr/0012-back-office-minimal.md`. Le portefeuille de royalties/
retraits, Studio/Booking/Featuring/Consulting et le reste du back-office
(§11.5-§11.11) relèvent du V1.

## Stack

| Couche           | Choix                                                                      |
| ---------------- | -------------------------------------------------------------------------- |
| Frontend / SSR   | Next.js 16 (App Router), React 19, TypeScript strict                       |
| Style / UI       | Tailwind CSS v4, shadcn/ui personnalisé (charte cerise/noir/or, §9 du CDC) |
| i18n             | next-intl — FR (défaut) / EN / LN, voir `docs/adr/0002-i18n-routing.md`    |
| Backend / DB     | Supabase (Postgres + Auth + RLS + Realtime)                                |
| Stockage         | Cloudflare R2 (S3-compatible), URLs présignées                             |
| Paiements        | Stripe (international) · Flutterwave/Paystack (Afrique + Mobile Money)     |
| Email            | Resend + React Email                                                       |
| Distribution DSP | LabelGrid (adaptateur mocké — `docs/adr/0003-labelgrid-mock-adapter.md`)   |
| Monitoring       | Sentry (erreurs) + PostHog (produit)                                       |
| CI/CD            | GitHub Actions + Vercel                                                    |

Justification complète de la stack : §6.1 du cahier des charges.

## Design System (Sprint 1)

Catalogue vivant de tous les composants sur `/admin/design-system` (page
interne, non indexée). Couvre le §9 du CDC :

- **Tokens** (`src/app/globals.css`) : palette cerise/noir/or/gris,
  échelle typographique, rayons (`sm`/`md`/`lg`/`xl`), ombres
  (`shadow-card`/`shadow-elevated`/`shadow-glow-cerise`), respect de
  `prefers-reduced-motion`.
- **Dark mode par défaut**, bascule vers le clair persistée
  (`next-themes`, voir `src/components/theme-provider.tsx`).
- **Composants** (`src/components/ui/`) : primitives shadcn/ui
  personnalisées (Button avec variante `gold` et état `loading`, Badge
  avec statuts `success`/`warning`/`info`/`gold`, Card, Input, Select,
  Table, Tabs, Dialog, Sheet, DropdownMenu, Progress, Calendar, Chart...)
  **+** composants sur-mesure absents de shadcn : `Stepper` (tunnel de
  distribution, §11.4), `EmptyState`, `FileUploader` (§9.5/§9.8).
- **Polices :** Inter (corps) + Bricolage Grotesque (titres) en attendant
  Satoshi/Clash Display (Fontshare) — voir
  `docs/adr/0005-typography-fallback.md`.

⚠️ Après tout `npx shadcn add <composant>`, vérifier que les fichiers déjà
personnalisés (`button.tsx`, `card.tsx`, `badge.tsx`...) n'ont pas été
réécrits par la CLI — un commentaire dans chacun le rappelle.

## Site public (Sprint 2)

Pages réelles sous `src/app/[locale]/(marketing)` et `.../(auth)`, contenu
FR/EN complet (§11.1, §11.6-11.11 du CDC) :

- **Marketing :** Accueil, À propos, Distribution, Studio (avec formulaire
  de réservation et estimation de prix en temps réel), Booking (double
  formulaire artiste/lieu), Featuring, Consulting, Contact, Tarifs, FAQ
  (`/aide`).
- **Légal :** CGU (texte canonique complet, `src/content/legal-cgu.ts`),
  Confidentialité, Mentions légales — FR/EN uniquement (pas de lingala sur
  les documents juridiques, voir `docs/adr/0006-content-sourcing.md`).
- **SEO :** `generateMetadata` par page (`src/lib/seo.ts`), JSON-LD
  Organization + MusicGroup (`src/components/marketing/structured-data.tsx`),
  `sitemap.xml`/`robots.txt` avec hreflang par chemin localisé.
- **Contenu :** repris tel quel du site existant (prototype + document de
  contenu + CGU fournis par Axel), pas inventé — voir
  `docs/adr/0006-content-sourcing.md` pour les sources et deux
  incohérences trouvées entre le CDC et le contenu réel (modèle de
  tarification, année de fondation) à trancher avec Axel.
- **Roster ("Nos artistes") non repris** : les données du prototype sont
  des profils factices (photos stock) — reporté jusqu'à de vraies données.

## Authentification (Sprint 3)

Implémente le §11.2 du CDC (voir `docs/adr/0007-auth-architecture.md` pour
le détail des décisions) :

- **Connexion / inscription** (`src/app/[locale]/(auth)/`) : email + mot de
  passe, Google (`[MVP]`), vérification email obligatoire avant connexion,
  réinitialisation de mot de passe (`/reinitialiser-mot-de-passe`), renvoi
  d'email de confirmation. Formulaires React Hook Form + Zod
  (`src/components/ui/form.tsx`), Server Actions
  (`src/app/[locale]/(auth)/actions.ts`).
- **Callback unique** `src/app/api/auth/callback/route.ts` : échange PKCE
  pour Google, confirmation d'inscription et réinitialisation de mot de
  passe.
- **Garde d'authentification** (`src/proxy.ts`) : `/app`/`/admin` redirigent
  vers `/connexion?next=...` si non connecté ; `/admin` redirige vers `/app`
  si le rôle n'est pas un rôle interne (§7.1).
- **Paramètres** (`/app/parametres`) : profil, sécurité (changement de mot
  de passe, 2FA TOTP native Supabase, comptes liés, déconnexion de tous les
  appareils), langue & devise (`profiles.locale`/`currency`, prioritaires
  sur le cookie une fois connecté), notifications, abonnement (placeholder),
  suppression de compte RGPD (re-vérification du mot de passe).
- **Base de données** : migration
  `supabase/migrations/20260704140000_auth_profiles_and_roles.sql` — enum
  `user_role` (§7.1), table `profiles` (trigger de création automatique,
  verrou anti-élévation de privilège), `audit_log` (§12, §17), RLS complète ;
  et `supabase/migrations/20260704150000_countries_and_currencies.sql` —
  pays/devises en table de configuration (voir plus bas).
- **Rôles** : seul `artist` est attribuable via `/inscription` ; les rôles
  internes sont attribués manuellement (bootstrap du premier `super_admin`
  documenté dans `supabase/seed.sql`).
- **OAuth provider-agnostique** (`src/app/[locale]/(auth)/oauth-providers.ts`,
  `oauth-button.tsx`) : Google actif (`[MVP]`), **Apple différé mais son
  architecture complète est prête** (registre de providers, Server Action
  générique, callback déjà agnostique, comptes liés via
  `linkIdentity`/`unlinkIdentity`) — l'activer ne demande que des
  identifiants, aucune refonte. **2FA construite malgré son tag `[V1]`**
  (native Supabase, sert le §17). Détail validé par Axel dans
  `docs/adr/0007-auth-architecture.md`.
- **Pays/devises en base**, pas en dur : tables `countries` (36 marchés
  Afrique/Europe/Amérique du Nord) et `currencies` (11 devises), liste
  métier validée par Axel — ajouter un marché = une ligne insérée, jamais
  une modification de code. Voir
  `src/app/(private)/app/parametres/country-currency-data.ts` et ADR 0007.

⚠️ **Aucun projet Supabase réel n'est connecté** (`.env.local` a les clés
vides) — voir "Notes importantes" ci-dessous.

## Dashboard artiste (Sprint 4)

Implémente le §11.3 du CDC (voir `docs/adr/0008-dashboard-artiste.md`) :

- **Onboarding profil artiste** (`src/app/(private)/app/onboarding-form.tsx`) :
  affiché à la place du dashboard tant qu'aucun artiste n'existe pour
  l'utilisateur (nom, bio, avatar, liens — §10.1, table `artists`).
- **Nav `/app` complète** (`src/components/private/app-sidebar-nav.tsx`) :
  les 12 entrées du §8 sont visibles dès maintenant ; Vue d'ensemble,
  Distribution et Paramètres sont actifs (Distribution depuis le Sprint 5),
  le reste affiche un badge "Bientôt disponible" (décision validée par Axel
  — voir ADR 0008).
- **Cartes du dashboard** : Streams (dernier mois rapporté + variation),
  Revenus (solde retirable/en attente), Sorties (livrées/en cours/
  brouillons), Top titres, graphique streams/mois (recharts), actions
  rapides ("Nouvelle sortie" active depuis le Sprint 5, les deux autres
  désactivées), notifications récentes — chacune avec un état vide soigné
  (§9.8) puisqu'aucune donnée LabelGrid n'existe encore.
- **Base de données** : migration
  `supabase/migrations/20260704160000_dashboard_core.sql` — `artists`,
  `releases`/`tracks` (colonnes déjà conformes au §12, le tunnel Distribution
  du sprint suivant les complètera), `stats_monthly`, `wallet` (créé
  automatiquement à l'inscription), `notifications`. RLS scopée
  propriétaire (pas encore de comptes équipe multi-artistes, §7.2, V1).

## Module Distribution (Sprint 5)

Tunnel à 9 étapes (§11.4, cœur du MVP) — voir
`docs/adr/0009-distribution-module.md` pour le détail des décisions
(upload multipart résumable complet et moteur de validation modulaire,
tous deux validés explicitement par Axel) :

- **Étapes 1-9** (`src/app/(private)/app/distribution/`) : type de sortie
  (Single/EP/Album) → upload audio (multipart résumable, réordonnancement) →
  métadonnées (sortie + par piste) → contributeurs & splits (somme = 100 %
  bloquante) → pochette (upload + validation + option Apple Music +10 $) →
  plateformes DSP → calendrier (alerte délai court) → récapitulatif (rapport
  de validation complet) → soumission LabelGrid.
- **Upload multipart résumable réel** (`src/lib/storage/r2.ts`,
  `src/lib/uploads/actions.ts`, `src/hooks/use-resumable-upload.ts`) : vrai
  cycle S3/R2 (`CreateMultipartUpload`/`UploadPart`/`CompleteMultipartUpload`),
  parts confirmées persistées (`upload_sessions`/`upload_parts`) — une
  session interrompue (fermeture d'onglet, coupure réseau) reprend sans
  renvoyer les parts déjà envoyées.
- **Moteur de validation modulaire** (`src/lib/validation/`) : chaque règle
  est un objet indépendant activable/désactivable
  (`ValidationRule`/`runValidation`), messages toujours via clés i18n
  (jamais de texte en dur, jamais de jargon technique — statut, explication,
  correction). Règles **réelles**, pas simulées : parsing d'en-tête
  WAV/FLAC/MP3, analyse du signal (silence, écrêtage, pics, niveau sonore
  approximatif) via Web Audio API, hash SHA-256 (doublons), parsing du
  marqueur JPEG SOF (détection CMJN), analyse de pixels (flou, image vide,
  marges) via Canvas, checksum UPC-A réel (norme GS1), format ISRC. Les
  règles nécessitant de l'OCR/vision par ordinateur (texte/logos/nudité/
  violence/filigrane sur la pochette) ne sont **pas construites** ce
  sprint — l'architecture les accueillera plus tard sans refonte (voir ADR 0009) ; en attendant, l'artiste auto-déclare ces points à l'étape pochette.
- **Gestion post-sortie** (`[releaseId]/release-detail.tsx`) : champs
  verrouillés après livraison, demande de modification (journalisée pour
  traitement manuel), retrait de distribution (confirmation + motif,
  jamais de suppression définitive — la sortie est archivée).
- **Base de données** : migration
  `supabase/migrations/20260704170000_distribution_module.sql` —
  `contributors`, `release_platforms`, `labelgrid_sync`, `upload_sessions`/
  `upload_parts`, `validation_reports`, colonnes complémentaires sur
  `releases`/`tracks` (§11.4 étape 3).
- **DSP sans logos officiels reproduits** : icône générique (initiale +
  couleur) plutôt que les logos Spotify/Apple Music/etc., qui sont des
  marques déposées.

## Abonnement & Paiements (Sprint 6)

Modèle SOLO / AFRIQUE / LABEL validé par Axel, 100 % des royalties à
l'artiste — voir `docs/adr/0010-abonnement-paiements.md` pour le détail des
décisions (incohérence de tarification héritée du Sprint 2 tranchée ici,
moteur générique sans valeur codée en dur, Flutterwave retenu comme rail
Mobile Money, paywall bloquant) :

- **Moteur de tarification** (`plans`, `pricing_regions` +
  `pricing_region_countries`, `plan_prices`, `plan_features`, `addons` +
  `addon_prices`, `coupons` + `validate_coupon` — migration
  `supabase/migrations/20260705120000_pricing_and_payments.sql`) : plans,
  prix par période/devise/région, fonctionnalités par plan et coupons
  entièrement pilotés par des tables de configuration. Lancement : SOLO
  (2,49 €/mois ou 19,99 €/an), AFRIQUE (tarif régional ≈ 9,99 $/an, annuel
  uniquement, pays éligibles configurables), LABEL (sur devis, non
  self-service).
- **Adaptateurs de paiement réels** (`src/lib/payments/`) : Stripe
  (Checkout Sessions, prix dynamiques via `price_data`, abonnements natifs)
  et Flutterwave (lien de paiement hébergé REST, pas d'abonnement natif —
  chaque échéance est un paiement à l'acte dont le webhook prolonge la
  ligne `subscriptions`). Rail résolu par pays
  (`countries.default_payment_provider`, Afrique → Flutterwave, reste →
  Stripe).
- **Webhooks** (`src/app/api/webhooks/{stripe,flutterwave}/route.ts`) :
  vérification de signature (Stripe, corps brut) / `verif-hash` +
  re-vérification serveur de la transaction (Flutterwave) avant tout
  crédit, client `service_role` (aucune session utilisateur dans un
  webhook, même exception documentée que pour `audit_log`).
- **Paywall** (`src/proxy.ts`, `src/lib/subscriptions/gate.ts`) : `/app`
  (hors `/app/abonnement`, `/app/parametres`) redirige vers le choix de
  forfait si l'artiste n'a ni forfait Label ni abonnement actif — tient la
  promesse d'ADR 0008 ("le choix de forfait/paiement viendra s'insérer
  avant l'onboarding").
- **`/app/abonnement`** : choix du forfait (mensuel/annuel selon la région,
  code promo optionnel) → checkout hébergé. **Paramètres > Abonnement** :
  statut réel, échéance, changement de forfait, résiliation (immédiate).
- **Add-on Artwork Apple Music payant** : `step-submit.tsx` (§11.4 étape 9)
  bloque désormais la soumission tant que l'add-on choisi n'est pas payé
  (checkout réel), alors que le Sprint 5 n'en affichait que le prix.
- **`/tarifs` et CGU corrigés** : l'ancien modèle à paliers avec partage de
  revenus (Sprint 2, incohérence documentée dans ADR 0006) est remplacé par
  le modèle SOLO/AFRIQUE/LABEL — 100 % des royalties nettes à l'artiste,
  seuil de retrait aligné sur 100 $ (§11.5). **Texte CGU engageant
  juridiquement Sterkte Records — à faire relire par Axel/un juriste avant
  mise en production.** `/tarifs` affiche ces prix en texte statique (i18n),
  pas via `plan_prices` : une page marketing prérendue statiquement (SSG,
  §18) ne doit pas dépendre d'un appel Supabase au build — voir ADR 0010,
  décision 2. `/app/abonnement` reste, lui, entièrement piloté par la DB.

## Emails transactionnels (Sprint 7)

Gabarits React Email + Resend (§14) — voir
`docs/adr/0011-emails-transactionnels.md` pour le détail des décisions :

- **Emails d'authentification via le Supabase Auth "Send Email Hook"**
  (`src/app/api/auth/email-hook/route.ts`) : vérification, bienvenue, lien
  magique, invitation, changement d'email, réinitialisation mot de passe —
  interceptés depuis l'envoi natif de Supabase Auth (vérifié avec
  `standardwebhooks`), zéro changement dans les Server Actions d'auth
  existantes (Sprint 3). Prérequis externe non automatisable depuis ce
  repo : activer le hook dans _Authentication > Hooks_ du dashboard
  Supabase une fois qu'un projet réel existe.
- **Alertes de sécurité** (mot de passe changé, 2FA activée/désactivée,
  compte lié/délié) : envoyées à la fois par le hook (si Supabase les
  déclenche automatiquement — documentation ambiguë) et directement depuis
  `src/app/(private)/app/parametres/actions.ts`, en redondance volontaire.
- **Reçus de paiement** (abonnement confirmé/renouvelé, add-on payé) :
  envoyés depuis les webhooks Stripe/Flutterwave (Sprint 6).
- **Sortie soumise / retrait confirmé** : envoyés depuis
  `src/app/(private)/app/distribution/actions.ts` (`submitRelease`,
  `requestTakedown`).
- **Gabarits prêts mais non déclenchés** : "sortie livrée"/mise à jour de
  statut (aucun job ne fait encore transiter `releases.status`, §13.1) et
  "sortie à corriger" (workflow de validation qualité back-office, §11.10,
  pas encore construit) — activables sans changement de gabarit dès que ces
  modules existent.
- **Échec d'envoi non bloquant** : un email transactionnel qui échoue
  (Resend non configuré, erreur API) est journalisé mais ne fait jamais
  échouer l'action métier (soumission de sortie, paiement, changement de
  mot de passe...).
- **Aucun compte Resend, domaine d'expédition vérifié, ni Send Email Hook
  configuré dans cet environnement** : vérifié par `typecheck`/`lint`/
  `build` uniquement.

## Back-office minimal (Sprint 8)

Sous-ensemble MVP du §11.10 (§3.1 : "voir/valider les sorties, gérer les
artistes label") — voir `docs/adr/0012-back-office-minimal.md` :

- **File de validation qualité** (`/admin/sorties`) : les sorties soumises
  par les artistes passent par le statut `in_review` (et non plus
  directement `delivering`, revu depuis le Sprint 5 — voir ci-dessous) ;
  le staff les approuve (envoi réel à LabelGrid) ou les renvoie avec un
  motif, transmis à l'artiste par email (gabarit du Sprint 7, jusqu'ici
  sans déclencheur).
- **Gestion des artistes** (`/admin/artistes`) : liste Solo/Label, bascule
  de forfait — un artiste passé en Label est immédiatement exempté du
  paywall (`src/lib/subscriptions/gate.ts`, Sprint 6), sans changement de
  cette logique.
- **`submitRelease` ne parle plus directement à LabelGrid** (changement de
  comportement depuis le Sprint 5) : l'envoi réel est désormais déclenché
  par l'action staff `approveRelease` après validation. Corrige au passage
  un bug latent : `labelgrid_sync` était inséré via le client RLS de
  l'artiste alors que sa policy n'autorise que le service_role à écrire —
  jamais détecté faute de projet Supabase réel.
- **RLS étendue au staff** (nouvelle migration) : les policies UPDATE sur
  `releases`/`artists` incluent désormais `is_staff()`, plutôt que de faire
  passer ces actions par le client `service_role`.
- **Nav back-office complète avec badges "Bientôt disponible"**, même
  décision que `/app` (Sprint 4) : Finances, Studio, Booking, Featuring,
  Consulting, Support, Contenus, Paramètres — hors périmètre du minimal
  MVP.

## Démarrage

Prérequis : Node ≥ 20.9, pnpm (`corepack enable` ou `npm i -g pnpm`).

```bash
pnpm install
cp .env.example .env.local   # déjà fait si tu clones ce repo tel quel
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000). Aucune variable
d'environnement n'est requise pour démarrer : voir `src/lib/env.ts` — seules
les variables du socle sont obligatoires, chaque intégration tierce est
validée au moment de son utilisation, pas au démarrage.

### Supabase en local

```bash
pnpm supabase:start        # démarre Postgres/Auth/Studio en local (Docker requis)
pnpm supabase:migrate:up   # applique les migrations
pnpm supabase:gen:types    # régénère src/types/database.types.ts
pnpm supabase:stop
```

## Scripts

| Commande                            | Effet                                                       |
| ----------------------------------- | ----------------------------------------------------------- |
| `pnpm dev`                          | Serveur de développement                                    |
| `pnpm build` / `pnpm start`         | Build de production / lancement                             |
| `pnpm lint` / `pnpm lint:fix`       | ESLint                                                      |
| `pnpm typecheck`                    | `tsc --noEmit`                                              |
| `pnpm format` / `pnpm format:check` | Prettier                                                    |
| `pnpm i18n:check`                   | Vérifie que fr/en/ln.json ont exactement les mêmes clés     |
| `pnpm css:check`                    | Détecte les variables CSS auto-référencées dans globals.css |
| `pnpm supabase:*`                   | Voir ci-dessus                                              |

Un hook `pre-commit` (Husky + lint-staged) formate et lint automatiquement
les fichiers stagés.

## Arborescence

```
src/
├── app/
│   ├── [locale]/            Site public + auth, chemins localisés (voir ADR 0002)
│   │   ├── layout.tsx       Root layout n°1 (html/body, NextIntlClientProvider, PostHog)
│   │   ├── (marketing)/     Accueil, Distribution, Tarifs... (Sprint 2)
│   │   └── (auth)/          /connexion·/login, /inscription·/signup... (Sprint 3)
│   │       ├── actions.ts    Server Actions (signIn, signUp, signInWithOAuth...)
│   │       ├── schemas.ts    Schémas Zod partagés Server Actions ↔ formulaires
│   │       ├── oauth-providers.ts   Registre providers OAuth (google actif, apple prêt)
│   │       └── oauth-button.tsx     OAuthButton/OAuthButtons génériques (icônes incluses)
│   ├── (private)/           Dashboard + back-office, PAS de préfixe de locale
│   │   ├── layout.tsx       Root layout n°2 (+ <PrivateHeader>, Sprint 3)
│   │   ├── actions.ts        signOut() (déconnexion appareil courant)
│   │   ├── app/             Dashboard artiste (Sprint 4)
│   │   │   ├── layout.tsx     Sidebar nav complète (§8) + trigger mobile
│   │   │   ├── page.tsx       Vue d'ensemble (cartes stats) ou onboarding si pas d'artiste
│   │   │   ├── actions.ts     createArtistProfile() (onboarding, §10.1)
│   │   │   ├── abonnement/    Choix du forfait + checkout (Sprint 6, §10.1 — exempté du paywall)
│   │   │   ├── parametres/    Profil, sécurité (2FA, comptes liés), langue, notifications, abonnement (Sprint 6), RGPD
│   │   │   └── distribution/  Tunnel à 9 étapes (Sprint 5, §11.4)
│   │   │       ├── nouvelle/       Étape 1 (type de sortie) — crée la sortie brouillon
│   │   │       ├── [releaseId]/    Étapes 2-9 (tunnel) ou fiche détail si non-brouillon
│   │   │       └── actions.ts      CRUD release/track/contributor/platform + soumission LabelGrid + checkout add-on (Sprint 6)
│   │   └── admin/           Back-office (§11.10, Sprint 8)
│   │       ├── layout.tsx     Sidebar nav complète (badges "Bientôt disponible")
│   │       ├── page.tsx       Vue d'ensemble (comptages artistes/sorties)
│   │       ├── actions.ts     approveRelease/rejectRelease, listAllArtists/toggleArtistPlan
│   │       ├── artistes/      Liste + bascule de forfait Solo/Label
│   │       └── sorties/       File de validation qualité (approuver / renvoyer avec motif)
│   ├── api/
│   │   ├── auth/callback/    Échange PKCE unique (tout provider OAuth, confirmation, reset — Sprint 3)
│   │   ├── auth/email-hook/  Supabase Auth "Send Email Hook" — emails d'auth rebrandés (Sprint 7)
│   │   ├── webhooks/         Webhooks Stripe/Flutterwave, client service_role (Sprint 6)
│   │   └── health/           Endpoint de santé (uptime monitoring, §25)
│   └── globals.css          Tailwind v4 + design tokens Sterkte Records (§9)
├── i18n/                    Config next-intl (routing, navigation, messages fr/en/ln)
├── lib/
│   ├── env.ts               Validation Zod des variables d'environnement
│   ├── fonts.ts              Polices partagées entre les deux root layouts
│   ├── supabase/            Clients browser / server / admin / middleware (session SSR)
│   │   ├── profile.ts         fetchUserRole/homeForRole partagés proxy.ts ↔ Server Actions
│   │   ├── auth-errors.ts     Mapping codes d'erreur Supabase Auth → clés i18n
│   │   └── callback-url.ts    authCallbackUrl() partagé (auth)/actions.ts ↔ parametres/actions.ts
│   ├── storage/r2.ts         Cloudflare R2 — présignées simples + multipart résumable (Sprint 5)
│   ├── uploads/actions.ts    Cycle de vie des sessions d'upload multipart (Sprint 5)
│   ├── validation/           Moteur de validation modulaire (Sprint 5, voir ADR 0009)
│   │   ├── types.ts            ValidationRule/ValidationReport/runValidation
│   │   ├── audio/              Parsers WAV/FLAC/MP3, analyse du signal, règles
│   │   ├── artwork/             Parser JPEG SOF, analyse de pixels, règles
│   │   └── metadata/            Checksums ISRC/UPC, règles de cohérence
│   ├── payments/             Stripe/Flutterwave/Paystack — clients bruts (Sprint 0)
│   │   ├── stripe-provider.ts  Checkout réel (abonnement + one-time), réutilise stripe/client.ts (Sprint 6)
│   │   ├── flutterwave-provider.ts   Checkout réel + vérif. transaction, réutilise flutterwave/client.ts (Sprint 6)
│   │   ├── pricing.ts          Résolution région/prix/coupon depuis la config DB (Sprint 6, voir ADR 0010)
│   │   └── index.ts            getPaymentProvider() — point d'entrée unique
│   ├── subscriptions/gate.ts Éligibilité paywall (plan Label ou abonnement actif) — proxy.ts + Server Components
│   ├── email/                Emails transactionnels (§14, Sprint 7 — voir ADR 0011)
│   │   ├── resend.ts           Client Resend (Sprint 0)
│   │   ├── send.tsx            Fonctions d'envoi typées, une par gabarit
│   │   ├── receipt.ts          Reçu de paiement partagé (webhooks Stripe/Flutterwave)
│   │   └── templates/          8 gabarits React Email (layout commun, boutons CTA)
│   ├── labelgrid/            Contrat + mock (voir ADR 0003 ; +requestTakedown au Sprint 5)
│   ├── whatsapp/             Client WhatsApp Cloud API
│   ├── documenso/            Client Documenso
│   └── analytics/            Providers PostHog (client + serveur)
├── components/
│   ├── ui/                  Composants shadcn personnalisés + sur-mesure (Sprint 1, §9)
│   │   └── form.tsx           React Hook Form + Zod, adapté à Base UI (Sprint 3)
│   ├── validation/validation-report-view.tsx   Affichage statut/explication/correction (Sprint 5)
│   ├── private/private-header.tsx   Barre minimale /app·/admin (Sprint 3)
│   ├── private/app-sidebar-nav.tsx   Nav complète /app, badges "Bientôt disponible" (Sprint 4)
│   ├── private/app-mobile-nav.tsx    Sheet mobile réutilisant app-sidebar-nav
│   ├── private/admin-sidebar-nav.tsx Nav complète /admin, même précédent que Sprint 4 (Sprint 8)
│   ├── private/admin-mobile-nav.tsx  Sheet mobile réutilisant admin-sidebar-nav
│   ├── theme-provider.tsx / theme-toggle.tsx   Dark/light mode (next-themes)
│   └── providers.tsx        Composition unique des providers client
├── hooks/
│   ├── use-has-mounted.ts
│   └── use-resumable-upload.ts   Upload multipart résumable direct-to-R2 (Sprint 5)
├── instrumentation.ts / instrumentation-client.ts   Bootstrap Sentry
└── proxy.ts                 Routing i18n + garde d'authentification + paywall (Sprint 6)

supabase/
├── config.toml
├── migrations/               Baseline + profiles/rôles/audit_log + countries/currencies (Sprint 3) + artists/releases/tracks/stats/wallet/notifications (Sprint 4) + contributors/platforms/uploads/validation (Sprint 5) + plans/prix/régions/coupons/subscriptions/payments (Sprint 6) + RLS staff releases/artists (Sprint 8)
└── seed.sql                  Note de bootstrap du premier super_admin

docs/adr/                     Décisions d'architecture documentées
```

**Pourquoi deux root layouts ?** Voir `docs/adr/0002-i18n-routing.md`.

## Variables d'environnement

Voir `.env.example` — chaque variable y est commentée avec le service
concerné, où l'obtenir, et à quel sprint elle est branchée. Aucun secret
réel n'est committé ; `.env.local` est ignoré par git.

## Sprints livrés

- **Sprint 0 :** infrastructure (repo, tooling, adaptateurs, i18n).
- **Sprint 1 :** Design System — voir ci-dessus.
- **Sprint 2 :** Site public — voir ci-dessus.
- **Sprint 3 :** Authentification — voir ci-dessus.
- **Sprint 4 :** Dashboard artiste — voir ci-dessus.
- **Sprint 5 :** Module Distribution — voir ci-dessus.
- **Sprint 6 :** Abonnement & Paiements — voir ci-dessus.
- **Sprint 7 :** Emails transactionnels — voir ci-dessus.
- **Sprint 8 (ce commit) :** Back-office minimal — voir ci-dessus. Clôt le socle MVP du CDC (§3.1).

## Décisions d'architecture

- `docs/adr/0001-stack-and-tooling.md` — repo unique + pnpm
- `docs/adr/0002-i18n-routing.md` — chemins localisés public/auth, cookie puis `profiles.locale` en privé (validé)
- `docs/adr/0003-labelgrid-mock-adapter.md` — adaptateur LabelGrid mocké
- `docs/adr/0004-i18n-content-policy.md` — fr/en référence complète, ln en brouillon assumé, parité de clés vérifiée automatiquement, zéro texte en dur (validé)
- `docs/adr/0005-typography-fallback.md` — Inter/Bricolage Grotesque en attendant Satoshi/Clash Display (à valider)
- `docs/adr/0006-content-sourcing.md` — sources du contenu réel (CGU fournies par Axel, PDF de contenu, prototype zip), roster artistes non repris (données factices), deux incohérences CDC/contenu réel à trancher (voir Notes importantes)
- `docs/adr/0007-auth-architecture.md` — flux PKCE unique, attribution des rôles, Apple différé mais architecture OAuth complète prête (providers/callback/DB/comptes liés), 2FA construite malgré son tag `[V1]`, sessions limitées à la déconnexion globale, `profiles.locale` prioritaire sur le cookie, pays/devises en table de configuration (liste métier validée par Axel), Paramètres > Abonnement en placeholder, contrainte d'environnement (pas de test de bout en bout)
- `docs/adr/0008-dashboard-artiste.md` — nav `/app` complète avec badges "Bientôt disponible" (validé par Axel), onboarding artiste avant paiement/forfait (pas encore construits), schéma releases/tracks minimal complété par le futur tunnel Distribution, "Streams (30j)" interprété comme dernier mois rapporté (données mensuelles par construction), wallet en lecture seule côté client
- `docs/adr/0009-distribution-module.md` — upload multipart résumable complet et moteur de validation modulaire "premium évolutif" (validés explicitement par Axel), règles réelles (parsing WAV/FLAC/MP3, Web Audio API, JPEG SOF, checksum UPC-A) documentées avec leurs approximations assumées (niveau sonore, VBR MP3), règles IA/OCR non construites mais architecture prête, DSP sans logos officiels reproduits, gestion post-sortie sans workflow d'approbation automatisé
- `docs/adr/0010-abonnement-paiements.md` — moteur de tarification générique sans valeur codée en dur (plans/régions/devises/remises/essais/coupons, validé explicitement par Axel), incohérence de tarification héritée du Sprint 2 tranchée (SOLO/AFRIQUE/LABEL, 100 % des royalties, `/tarifs` et CGU corrigés), Flutterwave retenu comme rail Mobile Money, Flutterwave sans abonnement natif (paiement à l'acte, renouvellement automatique différé au job planifié), paywall bloquant, résiliation immédiate (pas de report à la fin de période), webhooks en client `service_role`
- `docs/adr/0011-emails-transactionnels.md` — emails d'auth via le Supabase Auth Send Email Hook (zéro changement des Server Actions existantes), alertes sécurité en redondance volontaire hook + appel direct (documentation Supabase ambiguë sur le déclenchement automatique), tableau des emails réellement câblés vs gabarits prêts mais non déclenchés (sortie livrée/à corriger — modules dépendants pas encore construits), échec d'envoi non bloquant pour l'action métier
- `docs/adr/0012-back-office-minimal.md` — `submitRelease` ne parle plus directement à LabelGrid (revu depuis le Sprint 5, la sortie rejoint désormais `in_review` puis est approuvée/renvoyée par le staff), bug latent corrigé (`labelgrid_sync` écrit via le client admin, pas la session RLS de l'artiste), RLS étendue au staff sur `releases`/`artists` plutôt qu'un bypass service_role, gestion Label = bascule de forfait (pas de création de compte par le staff), nav `/admin` complète avec badges (même précédent que Sprint 4)

## Notes importantes

- **Lingala (`src/i18n/messages/ln.json`) :** toutes les valeurs sont des
  `TODO(ln): ...` explicites — volontairement pas de traduction
  approximative ou générée (voir ADR 0004). Relecture par un locuteur
  natif prévue avant la mise en production, conformément au §21 du CDC.
  Les pages légales (CGU/Confidentialité/Mentions) restent volontairement
  FR/EN uniquement — une traduction juridique demande une certification,
  pas un brouillon (voir ADR 0006).
- **Aucun texte codé en dur :** toute chaîne visible passe par
  `useTranslations`/`getTranslations` (next-intl), y compris dans `/app`
  et `/admin`. `pnpm i18n:check` (pre-commit + CI) fait échouer le build
  si `fr.json`/`en.json`/`ln.json` divergent en clés.
- **Tokens CSS (`globals.css`) :** ne jamais donner le même nom à une
  variable de marque (ex. `--info`) et à son alias sémantique dans un bloc
  `@theme`/`:root` différent — `--info: var(--info)` est une
  auto-référence CSS silencieusement invalide (valeur ignorée, pas
  d'erreur de build). `pnpm css:check` (pre-commit + CI) détecte
  automatiquement ce motif.
- **`setRequestLocale` dans chaque layout, pas seulement le layout racine
  et la page feuille :** tout layout de l'arborescence `[locale]` qui rend
  du contenu traduit (ex. `(marketing)/layout.tsx` avec son `<Footer>`)
  doit recevoir `params` et appeler `setRequestLocale(locale)` lui-même,
  sinon Next.js repasse toute la route en rendu dynamique (perte du `●`
  statique au build) sans erreur explicite. Vérifier avec `pnpm build`
  (colonne `○`/`●`/`ƒ`) après tout ajout de layout ou de
  `generateMetadata`.
- **Deux incohérences trouvées entre le CDC et le contenu réel fourni**
  (voir `docs/adr/0006-content-sourcing.md`) :
  - _Modèle de tarification — résolu au Sprint 6._ Le CDC §5 décrit un
    modèle forfaitaire à 100 % de royalties conservées, alors que les CGU
    fournies (Art. 5.2, 8) et le prototype décrivaient un modèle à paliers
    avec partage de revenus, repris tel quel par erreur au Sprint 2. Axel a
    tranché en faveur du CDC §5 (avec une évolution SOLO/AFRIQUE/LABEL) —
    `/tarifs` et les CGU ont été corrigés en conséquence, voir
    `docs/adr/0010-abonnement-paiements.md`.
  - _Année de fondation (non résolu)_ : le CDC indique 2021, mais le PDF de
    contenu et le prototype indiquent tous deux 2020. `foundingDate`
    (JSON-LD) et le contenu « À propos » utilisent 2020.
- **Aucun projet Supabase réel connecté (Sprint 3)** : ni instance locale
  (Docker absent de cet environnement), ni projet cloud. Toute la migration
  SQL, les policies RLS et les Server Actions d'authentification sont
  vérifiées par `typecheck`/`lint`/tests navigateur jusqu'à la frontière de
  l'appel Supabase (qui échoue alors avec un message explicite, jamais un
  crash silencieux) — voir `docs/adr/0007-auth-architecture.md`, section
  "Contrainte d'environnement". **Dès qu'un projet existe** (local via
  `pnpm supabase:start` ou cloud) : `pnpm supabase:migrate:up` puis
  `pnpm supabase:gen:types` pour remplacer le type `Database` écrit à la
  main dans `src/types/database.types.ts`, et un test de bout en bout réel
  (inscription, confirmation email, connexion, RLS) reste à faire.
- **Rôles (§7.1)** : `/inscription` attribue toujours `artist` — les 8
  autres rôles (`super_admin`, `accounting`, `support`, `ar_manager`,
  `marketing`, `manager`, `team_member`, `organizer`) sont attribués
  manuellement ou par une logique produit à venir, jamais depuis le
  formulaire public. Un trigger Postgres (`protect_profile_role`) empêche
  un utilisateur de changer son propre rôle par une simple mise à jour de
  profil.
- **Apple Sign In différé, architecture complète prête (validé par Axel)** :
  Apple est `[V1]` au CDC ET nécessite un compte Apple Developer payant
  (blocage administratif, même famille de décision que LabelGrid, ADR 0003).
  Axel a validé le report à condition qu'aucune refonte ne soit nécessaire à
  l'activation — c'est le cas : registre de providers, Server Action
  générique, callback déjà agnostique, comptes liés (`linkIdentity`/
  `unlinkIdentity`) fonctionnent déjà pour Apple, il ne manque que les
  identifiants (`SUPABASE_AUTH_EXTERNAL_APPLE_CLIENT_ID`/`_SECRET`). La 2FA
  TOTP, elle, est nativement supportée par Supabase (aucune dépendance
  externe) donc construite dès ce sprint malgré son propre tag `[V1]` — voir
  ADR 0007.
- **Pays/devises : liste métier validée par Axel, en base** (amende la
  proposition initiale, jugée trop générique) : 36 pays (Afrique
  francophone/anglophone + RDC, Maghreb, Europe, Amérique du Nord) et
  11 devises effectivement utilisées dans les règlements Sterkte Records,
  servis par les tables `countries`/`currencies`
  (`supabase/migrations/20260704150000_countries_and_currencies.sql`) —
  pas un tableau TypeScript. Étendre la liste = une ligne insérée en base,
  jamais une modification de `ProfileTab`/`LanguageTab` — voir ADR 0007.
- **Nav `/app` complète dès le Sprint 4 (validé par Axel)** : les 12 entrées
  du §8 apparaissent immédiatement dans `AppSidebarNav`, celles sans page
  réelle (Distribution, Statistiques, Revenus, Studio, Booking, Featuring,
  Consulting, Contrats, Équipe, Notifications) sont grisées avec un badge
  "Bientôt disponible" plutôt que d'attendre chaque sprint pour les
  ajouter — voir ADR 0008.
- **Onboarding artiste après le choix de forfait (résolu au Sprint 6)** :
  le §10.1 place la création du profil artiste après le choix de
  forfait/paiement — désormais tenu par le paywall (`src/proxy.ts`), qui
  redirige vers `/app/abonnement` avant que `/app` (et donc l'onboarding)
  ne soit atteignable, sans changer le schéma `artists` — voir ADR 0008 et
  ADR 0010.
- **`stats_monthly` vide par construction (Sprint 4), `wallet` alimenté par
  les paiements dès le Sprint 6** : `stats_monthly` reste vide tant que le
  job de reporting mensuel LabelGrid (§13.1, V1) n'est pas construit —
  comportement attendu. `wallet.balance_*`, en revanche, sera alimenté par
  le module Royalties (retraits, §11.5) à construire ; les webhooks
  paiement de ce sprint alimentent `subscriptions`/`payments`, pas encore
  `wallet`.
- **Moteur de tarification générique sans valeur codée en dur (validé
  explicitement par Axel, Sprint 6)** : plans, prix par période/devise/
  région, fonctionnalités par plan, add-ons et coupons sont tous des
  tables de configuration (`plans`, `pricing_regions`,
  `pricing_region_countries`, `plan_prices`, `plan_features`, `addons`,
  `addon_prices`, `coupons`) — ajouter un plan, un tarif régional ou un
  pays éligible ne nécessite jamais de modifier le code. Aucune interface
  d'administration pour ces tables n'est construite ce sprint (prévue
  "plus tard" par Axel, relèvera du module Back-office, §11.10) — voir
  `docs/adr/0010-abonnement-paiements.md`.
- **Flutterwave sans abonnement natif** : contrairement à Stripe
  (abonnements récurrents natifs), Flutterwave n'offre pas d'équivalent
  fiable pour le Mobile Money africain — chaque échéance est un paiement à
  l'acte, et **le renouvellement automatique (relance à l'approche de
  l'échéance) n'est pas construit ce sprint**, différé au job planifié
  (Inngest, §6.1, pas encore mis en place — même limite que le reporting
  mensuel LabelGrid). Le paiement initial et la résiliation fonctionnent
  pleinement.
- **CGU et `/tarifs` corrigés — texte engageant juridiquement Sterkte
  Records, à faire relire par Axel/un juriste avant mise en production**
  (cohérent avec la note déjà posée à ce sujet par ADR 0006 pour tout
  contenu CGU).
- **Upload multipart résumable complet et moteur de validation "premium
  évolutif" (validés explicitement par Axel, Sprint 5)** : contrairement
  aux autres sprints où j'ai proposé une portée réduite par défaut, Axel a
  demandé la version complète pour ces deux chantiers. Le multipart
  résumable persiste chaque part confirmée (`upload_sessions`/
  `upload_parts`) pour permettre une vraie reprise après coupure ; le
  moteur de validation implémente des règles réelles (parsing binaire
  WAV/FLAC/MP3/JPEG, analyse Web Audio API, checksum UPC-A) plutôt que des
  vérifications de surface. Voir `docs/adr/0009-distribution-module.md`.
- **Bucket R2 : configuration CORS requise, pas automatisable depuis ce
  repo.** `useResumableUpload` a besoin que le bucket R2 autorise `PUT` en
  CORS pour l'origine du site et expose l'en-tête `ETag`
  (`Access-Control-Expose-Headers: ETag`), sans quoi le navigateur masque
  l'ETag nécessaire à `CompleteMultipartUpload`. À configurer une fois dans
  le dashboard Cloudflare (ou Wrangler/API) quand un bucket réel existe —
  voir ADR 0009.
- **Validation métadonnées complète différée au récapitulatif (étape 8)** :
  les règles qui dépendent des contributeurs (artiste principal présent,
  somme des splits = 100 %) ne peuvent pas s'exécuter utilement à l'étape 3
  (Métadonnées), les contributeurs n'étant saisis qu'à l'étape 4. Le
  rapport complet du moteur de validation ne s'exécute qu'à l'étape 8,
  conformément au §11.4 qui y place le "rapport de validation" — voir ADR 0009.
- **Règles de validation IA/OCR non construites, architecture prête** :
  détection de texte interdit/logos/URLs/QR codes/contenu explicite/
  nudité/violence/filigrane sur la pochette — nécessitent un service de
  vision par ordinateur externe, aucune fausse détection simulée. Ajouter
  une de ces règles plus tard = ajouter un objet à `ARTWORK_RULES`, sans
  toucher au moteur. En attendant, l'artiste auto-déclare ces points à
  l'étape pochette (case à cocher par règle).
- **Emails d'authentification sans changement des Server Actions
  existantes (Sprint 7)** : `signUp`/`resetPasswordForEmail`/`resend`
  (Sprint 3) appellent toujours les méthodes Supabase Auth standard — c'est
  le Supabase Auth "Send Email Hook" (`src/app/api/auth/email-hook/
route.ts`), une fois activé côté dashboard, qui redirige l'envoi vers nos
  gabarits React Email/Resend plutôt que le template Supabase par défaut.
  Prérequis externe non automatisable depuis ce repo : activer le hook dans
  _Authentication > Hooks_ une fois qu'un projet réel existe — voir ADR 0011.
- **Emails de sécurité en redondance volontaire** : la documentation
  Supabase ne confirme pas si les hooks `*_notification` (mot de passe
  changé, 2FA, comptes liés/déliés) se déclenchent automatiquement à chaque
  appel `updateUser`/`mfa.enroll`/`unlinkIdentity`. Plutôt que de parier sur
  un comportement non confirmé pour une fonctionnalité de sécurité, ces
  alertes sont envoyées à la fois par le hook et directement depuis
  `parametres/actions.ts` — risque accepté d'un envoi en double, jamais
  d'un envoi manqué.
- **Emails "sortie livrée" et "sortie à corriger" : gabarits prêts, non
  déclenchés (Sprint 7).** Aucun job ne fait encore transiter
  `releases.status` de `delivering` à `delivered`/`error` (§13.1, même
  lacune que le suivi de statut documenté dans ADR 0009), et le workflow de
  validation qualité back-office (§11.10) n'existe pas encore. Les fonctions
  d'envoi (`sendReleaseStatusUpdateEmail`, `sendReleaseCorrectionNeededEmail`)
  sont prêtes à être appelées dès que ces modules existent — voir ADR 0011.
- **Échec d'envoi email non bloquant** : `src/lib/email/send.tsx` capture
  toute erreur (Resend non configuré, erreur API) et la journalise
  (`console.error`) sans jamais la propager — un email transactionnel raté
  ne doit jamais faire échouer l'action métier réelle (soumission de
  sortie, paiement confirmé, changement de mot de passe...).
- **Aucun compte Resend, domaine d'expédition vérifié, ni Send Email Hook
  configuré dans cet environnement (Sprint 7)** : le hook Supabase, les
  gabarits et les fonctions d'envoi sont vérifiés par
  `typecheck`/`lint`/`build` uniquement — voir ADR 0011, section
  "Contrainte d'environnement".
- **`submitRelease` ne parle plus à LabelGrid (changement de comportement
  depuis le Sprint 5, Sprint 8)** : la sortie rejoint désormais le statut
  `in_review` (déjà prévu par l'énumération `release_status` du Sprint 4,
  jamais exploité jusqu'ici) au lieu de partir directement en `delivering`.
  L'envoi réel à LabelGrid est déplacé dans l'action staff `approveRelease`
  (`/admin/sorties`) — voir ADR 0012. Les textes ("sortie soumise", message
  de succès du tunnel) ont été corrigés pour ne plus annoncer une livraison
  immédiate.
- **Bug latent corrigé : `labelgrid_sync` écrit via le mauvais client
  (Sprint 8)** : cette table n'a jamais eu de policy INSERT pour
  `authenticated` (commentaire de la migration Sprint 5 : "Écrit par le
  serveur"), mais `submitRelease` y écrivait via le client RLS de
  l'artiste — aurait échoué contre un vrai projet Supabase, jamais détecté
  faute d'un tel projet dans cet environnement. Corrigé : `approveRelease`
  écrit désormais via `createAdminClient()`.
- **Gestion des artistes Label = bascule de forfait, pas de création de
  compte par le staff (Sprint 8)** : aucun flux self-service n'existe pour
  qu'un membre du staff crée un compte au nom d'un tiers — l'artiste
  s'inscrit toujours lui-même, le staff fait ensuite basculer
  `artists.plan` vers `label` depuis `/admin/artistes`, ce qui l'exempte
  immédiatement du paywall (`src/lib/subscriptions/gate.ts`, Sprint 6),
  sans changement de cette logique. Voir ADR 0012.
