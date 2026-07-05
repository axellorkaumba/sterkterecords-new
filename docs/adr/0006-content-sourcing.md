# ADR 0006 — Sources du contenu éditorial du site public (Sprint 2)

**Statut :** Informatif — documente des décisions déjà prises avec Axel, et
signale deux incohérences à trancher.

## Sources utilisées, par ordre de priorité

1. **CGU détaillées** (collées par Axel dans la conversation, v1.0 juillet 2026) — source canonique pour `/legal/cgu`, et pour le modèle de
   tarification (voir point 2 ci-dessous).
2. **`CONTENT SITE STERKTE RECORDS.pdf`** (`~/Downloads`) — contenu éditorial
   par page (Accueil, À propos, Distribution, Studio, Booking, Featuring,
   Consulting, emails, footer), politique de confidentialité complète,
   tableau des meta-titles/descriptions. Correspond à l'Annexe C du CDC.
3. **`sterkte-records-webapp.zip`** (`~/Downloads`, prototype React/Vite
   déployé sur Vercel) — a fourni le texte exact du hero, des sections, des
   formulaires, et surtout les **tarifs studio réels** (Enregistrement 50
   $/h, Mixage & Mastering 200 $/titre, Studio mobile 75 $/h) qui n'étaient
   que des placeholders ("XX $/heure") dans le PDF.

Le contenu FR est repris **tel quel** de ces sources (§Annexe C du CDC :
"réutilisés tels quels"). Les traductions EN sont de moi, à relire. Le
lingala reste en brouillon `TODO(ln)` (docs/adr/0004).

## Ce qui n'a PAS été repris

- **Roster "Nos artistes"** : les données du prototype (`ARTISTS_DATA`)
  sont des profils fictifs avec des photos stock Unsplash. Les reprendre
  aurait fait passer des photos de banque d'images pour de vrais artistes
  signés — inacceptable. La page `/artistes` du §8 du CDC est donc
  **reportée** jusqu'à ce que de vraies données d'artistes existent.
- **FAQ (`/aide`)** : aucune des sources ne contient de FAQ. Le contenu de
  cette page (8 questions) est rédigé à partir des faits déjà établis
  ailleurs (délais CGU Art. 10, seuil de retrait CGU Art. 9.2, formats
  acceptés CGU Art. 11.2) — à relire par Axel comme tout contenu nouveau.

## Deux incohérences trouvées entre les sources — à trancher

### 1. Modèle de tarification (bloquant pour `/tarifs`)

- **CDC §5** : abonnement forfaitaire façon DistroKid (Solo 2,49 €/mois ou
  19,99 €/an), l'artiste garde **100 %** des royalties. Le CDC qualifie
  lui-même cette grille de _"recommandée"_ — donc non figée.
  Prix : SOLO Mensuel 2,49 €, SOLO Annuel 19,99 €, régional Afrique
  ~9,99 $/an, LABEL sur devis.
- **CGU Art. 5.2 et 8** : modèle à paliers avec **partage de revenus**
  (Free 0 €/70 %, Artist 15 €/an/75 %, Pro 35 €/an/80 %, Label 99 €/an/85 %),
  avec un exemple de calcul chiffré détaillé.

**Décision retenue pour `/tarifs` (Sprint 2) :** le modèle des CGU, parce
qu'il est daté, chiffré avec un exemple de calcul complet, et que le CDC
qualifie sa propre grille de simple recommandation. **À confirmer
explicitement avec Axel** — si le modèle CDC §5 est en fait le bon, il
faudra ré-écrire `/tarifs`, les CGU (Art. 5, 8, 9), et le futur schéma de
`subscriptions`/`royalty_ledger` en conséquence.

> **Résolu au Sprint 6.** Axel a tranché en faveur du modèle CDC §5, avec
> une évolution : SOLO (mensuel/annuel) + AFRIQUE (tarif régional, pays
> éligibles configurables) + LABEL (sur devis), 100 % des royalties
> reversées à l'artiste, aucune valeur codée en dur (moteur de tarification
> générique). `/tarifs`, les CGU (Art. 2, 5, 8, 9, 16) et le schéma
> `subscriptions`/`payments` ont été ré-écrits en conséquence — voir
> `docs/adr/0010-abonnement-paiements.md`.

### 2. Année de fondation du label

- **CDC §1** : "fondé en 2021".
- **PDF de contenu ET prototype webapp** (deux sources indépendantes) :
  "Fondé en 2020".

Les pages `/a-propos` utilisent **2020**, cohérent entre les deux sources
éditoriales. À confirmer avec Axel — probable coquille dans le CDC.
