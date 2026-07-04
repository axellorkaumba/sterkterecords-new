# ADR 0001 — Stack applicative et outillage (Sprint 0)

**Statut :** Validé (choix explicites d'Axel l'or Kaumba en amont du Sprint 0).

## Décisions

| Sujet                          | Choix                                                          | Alternative écartée                                       |
| ------------------------------ | -------------------------------------------------------------- | --------------------------------------------------------- |
| Structure du repo              | Une seule app Next.js (App Router) avec route groups           | Monorepo Turborepo (apps/web + packages/*)                |
| Gestionnaire de paquets        | pnpm                                                           | npm, yarn                                                 |
| Provisioning des comptes tiers | Scaffold local d'abord, comptes réels connectés au déploiement | Connexion immédiate à des comptes existants               |
| Intégration LabelGrid          | Adaptateur mock en attendant la doc API (onboarding en cours)  | Attendre l'accès avant de coder le tunnel de distribution |

## Justification

Le périmètre du CDC (§6.1) ne nécessite pas plusieurs applications déployées
séparément à ce stade : site public, dashboard artiste et back-office
partagent le même domaine, la même base Supabase et la même charte. Un
monorepo ajouterait de la complexité (orchestration de build, versionning
de packages internes) sans bénéfice avant qu'une app mobile native ou un
second frontend n'existe réellement (`[V2]`, §3.3).

pnpm est retenu pour son installation rapide, son économie d'espace disque
(store de paquets partagé) et son support natif des restrictions de scripts
d'installation (`pnpm-workspace.yaml` → `allowBuilds`), qui améliore la
posture supply-chain par rapport à npm/yarn.

## Conséquences

- Toute nouvelle app (mobile natif `[V2]`, §3.3) déclenchera une réévaluation
  vers un monorepo à ce moment-là, pas avant.
- `pnpm-workspace.yaml` doit être maintenu à jour à chaque nouvelle
  dépendance native nécessitant un script d'installation (le CI échouera
  sinon avec `ERR_PNPM_IGNORED_BUILDS`).
