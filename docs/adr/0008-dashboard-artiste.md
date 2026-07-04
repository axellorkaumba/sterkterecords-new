# ADR 0008 — Dashboard artiste (Sprint 4)

**Statut :** Validé par Axel (2026-07-04) sur le point nav (voir "Décision validée" ci-dessous) ; le reste applique des adaptations d'ordre mineur documentées ici, cohérentes avec les sprints précédents.

## Contexte

Le §11.3 du CDC décrit le dashboard artiste : en-tête (nom + avatar + sélecteur
d'artistes pour les managers), cartes streams/revenus/sorties, top titres,
graphique streams par mois, actions rapides, notifications. Les données
proviennent d'une **remontée mensuelle automatique via l'API LabelGrid**
(§13.1) — un job qui n'existe pas encore (construit avec le module Royalties,
V1). Le §8 (arborescence) liste toute la nav `/app` (Distribution,
Statistiques, Revenus, Studio, Booking, Featuring, Consulting, Contrats,
Équipe, Notifications, Paramètres), dont la plupart des pages sont des
sprints futurs distincts.

## Décision validée par Axel : nav complète avec badges "Bientôt disponible"

Question posée : nav minimale (seuls Vue d'ensemble + Paramètres, chaque
sprint ajoute son entrée) vs nav complète dès maintenant (tous les liens du
§8, ceux sans page réelle grisés avec un badge). **Axel a choisi la nav
complète.** `src/components/private/app-sidebar-nav.tsx` liste les 12 entrées
du §8 ; seuls `/app` et `/app/parametres` sont cliquables, le reste est
affiché désactivé avec un badge `AppNav.comingSoon` — montre la structure
complète du produit sans créer de lien mort (les routes non construites
renverraient un 404).

## Autres décisions (adaptations mineures)

### 1. Onboarding artiste avant paiement/forfait

Le §10.1 place l'onboarding profil artiste (nom, photo, bio, liens) **après**
le choix du forfait et le paiement. Ces étapes n'existent pas encore (module
Distribution/Paiements, sprints suivants). Comme un dashboard vide de tout
artiste n'a rien à afficher, l'onboarding (`src/app/(private)/app/onboarding-form.tsx`)
se déclenche dès la première visite de `/app` sans artiste existant — le
choix de forfait/paiement viendra s'insérer avant cette étape quand le
module sera construit, sans changer le schéma `artists` (déjà conforme au
§12).

### 2. Schéma releases/tracks minimal, complété par le tunnel Distribution

`supabase/migrations/20260704160000_dashboard_core.sql` crée `releases` et
`tracks` avec les colonnes déjà spécifiées au §12 (pas de colonnes
inventées), mais sans les tables annexes qu'un tunnel à 9 étapes (§11.4)
demandera (`contributors`, `release_platforms`, `labelgrid_sync`). Le
Sprint Distribution ajoutera ces tables par une nouvelle migration sans
modifier celle-ci — seul `releases.status` (déjà un enum complet reflétant
le cycle de vie du §11.4) sera exploité par le tunnel.

### 3. "Streams (30 jours)" interprété comme "dernier mois rapporté"

Les données de stats sont mensuelles par construction (§13.1, "remontée
mensuelle"), pas un flux quotidien permettant une vraie fenêtre glissante de
30 jours. La carte "Streams" affiche donc le dernier mois disponible (`period`
le plus récent dans `stats_monthly`) et sa variation vs le mois précédent,
avec la mention explicite de la date de reporting (§11.3 : "Données à jour
au {date}") pour ne jamais laisser croire à une fraîcheur quotidienne
inexistante.

### 4. `wallet` en lecture seule côté client

Créé automatiquement à l'inscription (trigger `handle_new_user_wallet`,
même mécanique que `profiles`), mais aucune policy RLS d'écriture pour
`authenticated` : le solde ne sera modifié que par les webhooks de paiement
et le job de reporting royalties (`service_role`), tous deux à construire
avec le module Royalties (V1, §11.5).

### 5. Actions rapides désactivées

"Nouvelle sortie", "Voir les statistiques" et "Demander un retrait" ciblent
des pages pas encore construites — désactivées avec la mention
"Bientôt disponible" plutôt que des liens vers des 404, cohérent avec le
traitement de la nav (décision ci-dessus).

### 6. Contrainte d'environnement (inchangée depuis le Sprint 3)

Toujours aucun projet Supabase réel connecté. Le dashboard, l'onboarding et
la migration sont vérifiés par `typecheck`/`lint`/`build`, et par test
navigateur pour la garde d'authentification (`/app` → `/connexion?next=/app`,
comportement inchangé après l'ajout de la nav). Le rendu réel avec un artiste
et des données de stats (onboarding → dashboard peuplé) reste à valider dès
qu'un projet Supabase existe.
