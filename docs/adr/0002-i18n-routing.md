# ADR 0002 — Routage i18n : chemins localisés public/auth, cookie puis `profiles.locale` en privé

**Statut :** Validé par Axel l'or Kaumba (2026-07-04).

## Contexte

Le §8 (arborescence) du CDC montre `/[fr|en|ln]/…` comme variante de langue
sous l'arbre **PUBLIC**, sans préfixe sur **AUTH** ni **APP/BACK-OFFICE**
(`/app`, `/admin`). Le §19 (SEO) exige `hreflang`. Axel a précisé deux
points au-delà de la lecture initiale du §8 :

1. Les pages d'authentification doivent suivre la **même logique que le
   site public**, y compris des **chemins traduits** (pas seulement
   préfixés) : `/fr/connexion`, `/en/login`, `/ln/...`.
2. Une fois connecté, toute l'app bascule sur `/app` / `/admin` (sans
   préfixe), la langue étant pilotée par `profiles.locale` et modifiable à
   tout moment dans les paramètres.

## Décision

### 1. Site public + authentification → chemins localisés sous `[locale]`

`src/app/[locale]/(marketing)` et `src/app/[locale]/(auth)` restent sous un
seul dossier canonique par route (en français : `connexion`, `inscription`,
`mot-de-passe-oublie`, `verification-email`). La traduction du **segment
d'URL** (pas seulement le préfixe de langue) est déclarée dans
`src/i18n/routing.ts` via l'option `pathnames` de next-intl :

| Route interne (dossier) | `fr`                   | `en`               | `ln`                                      |
| ----------------------- | ---------------------- | ------------------ | ----------------------------------------- |
| `/`                     | `/`                    | `/`                | `/`                                       |
| `/connexion`            | `/connexion`           | `/login`           | `/connexion` _(TODO relecture, ADR 0004)_ |
| `/inscription`          | `/inscription`         | `/signup`          | `/inscription`                            |
| `/mot-de-passe-oublie`  | `/mot-de-passe-oublie` | `/forgot-password` | `/mot-de-passe-oublie`                    |
| `/verification-email`   | `/verification-email`  | `/verify-email`    | `/verification-email`                     |

Le proxy next-intl (`src/proxy.ts`) réécrit en interne l'URL localisée vers
le dossier canonique — un seul jeu de fichiers de page à maintenir, pas de
duplication de dossiers par langue. Toute route publique/auth ajoutée dans
un sprint suivant doit être déclarée dans `pathnames`, sinon `Link`/
`redirect` typés (`src/i18n/navigation.ts`) ne compilent pas — c'est voulu,
ça empêche d'oublier une traduction de chemin.

### 2. Dashboard (`/app`) + back-office (`/admin`) → pas de préfixe

Inchangé par rapport à la version précédente de cet ADR : aucun enjeu SEO à
indexer un dashboard privé dans 3 langues. La langue est résolue dans
`src/i18n/request.ts` :

1. Utilisateur authentifié → `profiles.locale` (Sprint 3, table `profiles`
   du §12 du CDC), modifiable dans `/app/parametres` à tout moment (§21).
2. Avant connexion / pas encore branché → cookie `sterkte_locale` (même
   cookie que celui posé par le site public via `localeCookie` de
   next-intl).
3. Repli final → `fr` (locale par défaut).

Quand l'utilisateur change sa langue dans les paramètres, le Server Action
correspondant (Sprint 4) devra mettre à jour `profiles.locale` **et**
rafraîchir le cookie `sterkte_locale`, pour que le site public retrouve la
même langue s'il y retourne.

### 3. Justification technique (deux root layouts)

Next.js autorise plusieurs "root layouts" (chacun avec `<html>/<body>`)
tant qu'aucun layout commun n'existe au-dessus. `src/app/[locale]/layout.tsx`
et `src/app/(private)/layout.tsx` en sont deux instances indépendantes ;
les deux appellent désormais `getMessages()`/`NextIntlClientProvider` de
la même façon, seule la résolution de la locale en amont diffère (URL vs
cookie/`profiles.locale`).

## Conséquences

- Un lien vers `/connexion` généré par erreur avec `next/link` au lieu de
  `Link` de `@/i18n/navigation` produirait une URL non traduite pour
  `en`/`ln` — à surveiller en revue de code au Sprint 3 (formulaires
  auth) et Sprint 2 (liens du site public vers l'auth).
- Toute nouvelle page publique/auth doit être ajoutée à `pathnames` dans
  le même changement, pas après coup.
