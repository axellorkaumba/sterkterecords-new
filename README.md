# Sterkte Records Distributor

Plateforme SaaS de distribution musicale — Sterkte Records SARL
(Lubumbashi/RDC · Agadir/Maroc). Source de vérité produit : le cahier des
charges (`CDC_Sterkte_Records_Distributor.md`, fourni hors repo).

**Statut : Sprint 0 — infrastructure.** Aucune fonctionnalité métier n'est
encore implémentée ; ce sprint pose l'architecture, l'outillage et les
adaptateurs de services externes sur lesquels tous les sprints suivants
s'appuient.

## Stack

| Couche           | Choix                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------- |
| Frontend / SSR   | Next.js 16 (App Router), React 19, TypeScript strict                                   |
| Style / UI       | Tailwind CSS v4, shadcn/ui (thème neutre placeholder — vrai design system au Sprint 1) |
| i18n             | next-intl — FR (défaut) / EN / LN, voir `docs/adr/0002-i18n-routing.md`                |
| Backend / DB     | Supabase (Postgres + Auth + RLS + Realtime)                                            |
| Stockage         | Cloudflare R2 (S3-compatible), URLs présignées                                         |
| Paiements        | Stripe (international) · Flutterwave/Paystack (Afrique + Mobile Money)                 |
| Email            | Resend + React Email                                                                   |
| Distribution DSP | LabelGrid (adaptateur mocké — `docs/adr/0003-labelgrid-mock-adapter.md`)               |
| Monitoring       | Sentry (erreurs) + PostHog (produit)                                                   |
| CI/CD            | GitHub Actions + Vercel                                                                |

Justification complète de la stack : §6.1 du cahier des charges.

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

| Commande                            | Effet                           |
| ----------------------------------- | ------------------------------- |
| `pnpm dev`                          | Serveur de développement        |
| `pnpm build` / `pnpm start`         | Build de production / lancement |
| `pnpm lint` / `pnpm lint:fix`       | ESLint                          |
| `pnpm typecheck`                    | `tsc --noEmit`                  |
| `pnpm format` / `pnpm format:check` | Prettier                        |
| `pnpm supabase:*`                   | Voir ci-dessus                  |

Un hook `pre-commit` (Husky + lint-staged) formate et lint automatiquement
les fichiers stagés.

## Arborescence

```
src/
├── app/
│   ├── [locale]/            Site public + auth, préfixé par la locale (fr par défaut sans préfixe)
│   │   ├── layout.tsx       Root layout n°1 (html/body, NextIntlClientProvider, PostHog)
│   │   ├── (marketing)/     Accueil, Distribution, Tarifs... (Sprint 2)
│   │   └── (auth)/          Connexion, Inscription... (Sprint 3)
│   ├── (private)/           Dashboard + back-office, PAS de préfixe de locale
│   │   ├── layout.tsx       Root layout n°2 (html/body, PostHog)
│   │   ├── app/             Dashboard artiste (Sprint 4)
│   │   └── admin/           Back-office (Sprint 4+)
│   ├── api/health/          Endpoint de santé (uptime monitoring, §25)
│   └── globals.css          Tailwind v4 + tokens shadcn (thème placeholder)
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
├── components/ui/           Composants shadcn (thème réel au Sprint 1)
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

- **Sprint 0 (ce commit) :** infrastructure — voir ci-dessus.

## Décisions d'architecture

- `docs/adr/0001-stack-and-tooling.md` — repo unique + pnpm
- `docs/adr/0002-i18n-routing.md` — routage i18n public vs privé (à confirmer avant Sprint 2/3)
- `docs/adr/0003-labelgrid-mock-adapter.md` — adaptateur LabelGrid mocké

## Notes importantes

- **Lingala (`src/i18n/messages/ln.json`) :** traductions de brouillon,
  non relues par un locuteur natif. Le cahier des charges (§21) recommande
  explicitement une relecture native avant mise en production — à faire
  avant le Sprint 2.
- **Design system :** le thème shadcn actuel (neutre, OKLCH par défaut) est
  un placeholder technique. La charte réelle (rouge cerise / noir profond /
  jaune d'or, §9) arrive au Sprint 1.
