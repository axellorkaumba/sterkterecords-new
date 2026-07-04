# Sterkte Records Distributor

Plateforme SaaS de distribution musicale — Sterkte Records SARL
(Lubumbashi/RDC · Agadir/Maroc). Source de vérité produit : le cahier des
charges (`CDC_Sterkte_Records_Distributor.md`, fourni hors repo).

**Statut : Sprint 2 — Site Public.** Le site public (marketing + légal) est
en place avec du contenu réel, en FR/EN complets (LN en brouillon). Aucune
fonctionnalité applicative (auth, distribution, paiements) n'est encore
implémentée — les Sprints 0 à 2 posent l'architecture, l'outillage, la
charte visuelle et le site vitrine sur lesquels les sprints suivants
s'appuient.

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
│   ├── (private)/           Dashboard + back-office, PAS de préfixe de locale
│   │   ├── layout.tsx       Root layout n°2 (html/body, NextIntlClientProvider, PostHog)
│   │   ├── app/             Dashboard artiste (Sprint 4)
│   │   └── admin/           Back-office (Sprint 4+)
│   ├── api/health/          Endpoint de santé (uptime monitoring, §25)
│   └── globals.css          Tailwind v4 + design tokens Sterkte Records (§9)
├── i18n/                    Config next-intl (routing, navigation, messages fr/en/ln)
├── lib/
│   ├── env.ts               Validation Zod des variables d'environnement
│   ├── fonts.ts              Polices partagées entre les deux root layouts
│   ├── supabase/            Clients browser / server / admin (RLS-safe + service role)
│   ├── storage/r2.ts         Cloudflare R2 — URLs présignées upload/download
│   ├── payments/             Stripe, Flutterwave, Paystack — clients bruts
│   ├── email/resend.ts       Client Resend
│   ├── labelgrid/            Contrat + mock (voir ADR 0003)
│   ├── whatsapp/             Client WhatsApp Cloud API
│   ├── documenso/            Client Documenso
│   └── analytics/            Providers PostHog (client + serveur)
├── components/
│   ├── ui/                  Composants shadcn personnalisés + sur-mesure (Sprint 1, §9)
│   ├── theme-provider.tsx / theme-toggle.tsx   Dark/light mode (next-themes)
│   └── providers.tsx        Composition unique des providers client
├── hooks/, server/actions/, types/   Squelettes, remplis au fil des sprints
├── instrumentation.ts / instrumentation-client.ts   Bootstrap Sentry
└── proxy.ts                 Routing i18n (site public/auth uniquement, convention Next.js ≥16)

supabase/
├── config.toml
├── migrations/               Baseline : extensions Postgres + fonction updated_at
└── seed.sql

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
- **Sprint 2 (ce commit) :** Site public — voir ci-dessus.

## Décisions d'architecture

- `docs/adr/0001-stack-and-tooling.md` — repo unique + pnpm
- `docs/adr/0002-i18n-routing.md` — chemins localisés public/auth, cookie puis `profiles.locale` en privé (validé)
- `docs/adr/0003-labelgrid-mock-adapter.md` — adaptateur LabelGrid mocké
- `docs/adr/0004-i18n-content-policy.md` — fr/en référence complète, ln en brouillon assumé, parité de clés vérifiée automatiquement, zéro texte en dur (validé)
- `docs/adr/0005-typography-fallback.md` — Inter/Bricolage Grotesque en attendant Satoshi/Clash Display (à valider)
- `docs/adr/0006-content-sourcing.md` — sources du contenu réel (CGU fournies par Axel, PDF de contenu, prototype zip), roster artistes non repris (données factices), deux incohérences CDC/contenu réel à trancher (voir Notes importantes)

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
  (voir `docs/adr/0006-content-sourcing.md`), à trancher avec Axel :
  - _Modèle de tarification_ : le CDC §5 décrit un modèle forfaitaire à
    100 % de royalties conservées, alors que les CGU fournies (Art. 5.2, 8) et le prototype décrivent un modèle à paliers avec partage de
    revenus. La page `/tarifs` reprend le modèle des CGU, jugé plus
    proche de l'intention réelle (le CDC qualifie lui-même sa grille de
    « recommandée »).
  - _Année de fondation_ : le CDC indique 2021, mais le PDF de contenu et
    le prototype indiquent tous deux 2020. `foundingDate` (JSON-LD) et le
    contenu « À propos » utilisent 2020.
