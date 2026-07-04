# ADR 0003 — Adaptateur LabelGrid mocké en attendant la documentation API

**Statut :** Validé (confirmé explicitement par Axel avant le Sprint 0).

## Contexte

Le §13.1 du CDC indique que le mapping exact des endpoints/champs LabelGrid
se fera contre la documentation live lors de l'intégration, l'onboarding
étant en cours. On ne peut donc pas coder le vrai client maintenant.

## Décision

- `src/lib/labelgrid/types.ts` définit le contrat cible (`LabelGridClient`)
  côté produit Sterkte Records : livraison de sortie, liste des DSP,
  statut de livraison, reporting mensuel — repris des responsabilités
  listées au §13.1 et des tables `labelgrid_sync`/`stats_monthly` (§12).
- `src/lib/labelgrid/mock-client.ts` implémente ce contrat avec des données
  fixtures, permettant de construire tout le tunnel de distribution (§11.4)
  sans dépendance externe.
- `src/lib/labelgrid/index.ts` bascule automatiquement du mock vers une
  implémentation réelle (`RealLabelGridClient`, à créer) dès que
  `LABELGRID_API_KEY` est défini — mais lève explicitement une erreur tant
  que cette implémentation réelle n'existe pas, plutôt que d'échouer
  silencieusement.

## Conséquences

- Le reste du produit (Server Actions du tunnel de distribution, jobs de
  reporting) code contre l'interface `LabelGridClient`, jamais contre
  l'implémentation. Brancher le vrai client à l'intégration ne touchera
  qu'un seul fichier (`real-client.ts`, à créer).
- Le contrat actuel (`SubmitReleaseInput`, `DspInfo`, etc.) est une
  hypothèse de travail : il devra probablement être ajusté champ par champ
  contre la doc réelle sans casser les appelants grâce à l'interface.
