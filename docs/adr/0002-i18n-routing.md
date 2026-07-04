# ADR 0002 — Routage i18n : préfixe de locale public uniquement

**Statut :** Proposé — implémenté au Sprint 0 pour poser l'architecture,
**à confirmer explicitement avant le Sprint 2** (contenu éditorial complet)
et le Sprint 3 (auth), car un changement de structure de routes coûte plus
cher une fois le contenu réel écrit.

## Contexte

Le §8 (arborescence) du CDC montre `/[fr|en|ln]/…` comme variante de langue
sous l'arbre **PUBLIC**, mais ne montre aucun préfixe de locale sur les
arbres **AUTH** ou **APP/BACK-OFFICE** (`/app`, `/admin`). Le §19 (SEO)
exige `hreflang` — un besoin propre aux pages indexables, donc au site
public. Le §21 (i18n) ne tranche pas explicitement le cas du dashboard privé.

## Décision

1. Le site public **et** les pages d'authentification vivent sous
   `src/app/[locale]/...` avec `next-intl` (préfixe `as-needed` : `fr` sans
   préfixe, `/en/...`, `/ln/...`).
2. Le dashboard artiste (`/app`) et le back-office (`/admin`) vivent hors de
   ce segment, sans préfixe de locale dans l'URL. Leur langue sera résolue
   via la colonne `profiles.locale` (§12) une fois l'authentification en
   place (Sprint 3), avec un cookie de secours avant connexion.
3. Techniquement, ceci nécessite **deux root layouts** distincts
   (`src/app/[locale]/layout.tsx` et `src/app/(private)/layout.tsx`), motif
   supporté nativement par Next.js quand aucun layout commun n'existe
   au-dessus (pas de `src/app/layout.tsx`).

## Justification

- Aucun enjeu SEO à indexer un dashboard privé authentifié dans 3 langues :
  préfixer ses URLs n'apporterait rien et doublerait la surface de routes.
- Le §7 (rôles) et les tables `profiles`/`team_members` (§12) portent déjà
  la notion d'utilisateur authentifié à qui rattacher une préférence de
  langue — plus cohérent qu'une langue portée par l'URL pour une session
  déjà identifiée.
- Réversible à faible coût tant que peu de pages existent (Sprint 0) ;
  coûteux à changer après le Sprint 2 (contenu public) ou le Sprint 4
  (dashboard construit).

## Ce qui reste à valider avec Axel

- Confirmer qu'aucune page de `/app` ou `/admin` n'a besoin d'être indexée
  ou partagée publiquement dans une langue donnée (ex. une page de résultats
  publique liée au Smart Link `[V2]`, §11.4, qui elle sera bien sous
  `[locale]` puisqu'orientée grand public).
- Confirmer le choix `as-needed` (fr sans préfixe) plutôt que `always`
  (`/fr/...` explicite partout), qui simplifierait le hreflang au prix
  d'URLs `/fr/...` moins "propres" pour le marché historique.
