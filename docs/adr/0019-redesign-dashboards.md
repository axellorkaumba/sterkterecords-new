# ADR 0019 — Refonte des Dashboards Artiste et Label/Admin

**Statut :** Implémenté et vérifié par `typecheck`/`lint`/`build` + garde
d'authentification confirmée en navigateur — non vérifiable de bout en bout
sans projet Supabase réel (cf. contrainte d'environnement, ADR 0007 et
suivants).

## Contexte

Huitième et neuvième étapes du plan de refonte complète, après les 7 pages
marketing (ADR 0013-0018). Contrairement aux pages marketing statiques, les
dashboards sont des Server Components connectés à des données Supabase
réelles — toute décision ici devait respecter l'architecture existante
(RLS, requêtes typées) plutôt qu'inventer des données factices.

## Décisions

### 1. `ReleasesBanner` (Dashboard Artiste) — vraies pochettes, jamais le catalogue marketing

`src/app/(private)/app/releases-banner.tsx` : bandeau en tête du dashboard
montrant les vraies pochettes des sorties déjà livrées de l'artiste
connecté. Distinction importante actée dans le plan : **jamais**
`src/content/catalogue.ts` (vitrine marketing statique) ici — la requête
`releases` a été étendue (`id, title, artwork_url, status`, page.tsx) et le
bandeau n'affiche que les sorties `delivering`/`delivered` avec
`artwork_url` renseigné, via `getPublicUrl()` (déjà existant dans
`src/lib/storage/r2.ts`, explicitement documenté "artworks livrés aux DSP"
— jamais utilisé pour un brouillon, dont l'artwork n'est pas sur le bucket
public). État vide motivant (`EmptyState` existant) si l'artiste n'a encore
aucune sortie livrée — CTA vers `/app/distribution/nouvelle`.

### 2. Micro-animations de changement de statut (Dashboard Label/Admin)

`release-row.tsx` (file de validation, `/admin/sorties`) et `artist-row.tsx`
(liste des artistes, `/admin/artistes`) : composants client qui enveloppent
`<TableRow>` et déclenchent un bref flash de couleur (`bg-success/15` à
l'approbation, `bg-warning/15` au rejet, `bg-gold/10` à la bascule de
forfait) confirmant visuellement l'action avant que la donnée ne se
rafraîchisse. Transition CSS `background-color` uniquement (pas de
`transform` sur un `<tr>`, peu adapté aux animations Framer Motion en
contexte de mise en page table).

`ReviewActions` a été légèrement restructuré : il ne déclenche plus
`router.refresh()` directement, mais appelle `onApproved`/`onRejected`
remontés par `ReleaseRow`, qui affiche le flash puis temporise 450 ms avant
de rafraîchir — le temps que l'utilisateur voie la confirmation avant que
la ligne ne disparaisse (elle change de statut, donc sort de la file
`in_review`). `PlanToggleButton` reçoit un callback `onToggled` équivalent,
appelé après la fermeture du dialogue (la révalidation `revalidatePath`
déjà en place côté serveur reste inchangée).

### 3. Vue d'ensemble Admin (`/admin`) laissée telle quelle

Les 3 cartes de comptage (artistes/en attente/sorties) étaient déjà
raisonnablement sobres et fonctionnelles (pas de fond générique
"SaaS triste", pas de texte excessif) — retravailler leur mise en page
n'apportait pas de valeur proportionnée à l'effort, contrairement aux deux
tableaux ci-dessus où l'absence de feedback visuel à l'action était un vrai
manque UX.

## Vérification

- `pnpm typecheck`/`lint`/`i18n:check` (1041 clés, parité FR/EN/LN)/
  `css:check`/`build` : tous verts.
- `/app`, `/admin`, `/admin/artistes`, `/admin/sorties` redirigent
  correctement vers `/connexion?next=...` pour un visiteur non authentifié
  (vérifié en navigateur) — confirme qu'aucune régression n'a été
  introduite par ces changements.
- **Non vérifiable dans cet environnement** : le rendu réel du bandeau de
  pochettes, le flash de couleur sur action réelle, et le comportement de
  `getPublicUrl()` nécessitent un projet Supabase et un bucket R2 réels
  (contrainte documentée depuis l'ADR 0007).

## Suite

Dernière étape du plan : passe Design System (consolidation des
composants premium dans la vitrine `admin/design-system/page.tsx`, audit
accessibilité/`prefers-reduced-motion`).
