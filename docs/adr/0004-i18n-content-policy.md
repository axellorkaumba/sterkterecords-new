# ADR 0004 — Politique de contenu i18n : fr/en référence, ln en brouillon assumé

**Statut :** Validé par Axel l'or Kaumba (2026-07-04).

## Contexte

Le CDC (§21) recommande une relecture par un locuteur natif lingala avant
mise en production. Un premier essai de traduction lingala directe par
l'IA a été jugé risqué : mieux vaut un manque visible qu'une traduction
approximative qui semblerait légitime aux yeux d'un utilisateur.

## Décision

1. **`fr.json` et `en.json` sont la référence complète.** Toute nouvelle
   chaîne de texte de l'interface est ajoutée dans ces deux fichiers avec
   une vraie traduction, jamais laissée de côté.
2. **`ln.json` reste un brouillon assumé.** Chaque clé existe (structure
   identique aux deux autres fichiers), mais sa valeur est un marqueur
   explicite `"TODO(ln): <texte français>"` tant qu'elle n'a pas été
   relue par un locuteur natif. Aucune traduction générée ou approximative
   n'est acceptée comme valeur "finale".
3. **Parité stricte des clés entre les 3 fichiers**, vérifiée
   automatiquement par `scripts/check-i18n-parity.mjs` :
   - exécuté via `pnpm i18n:check` ;
   - en pre-commit (`.lintstagedrc.json`) dès qu'un fichier
     `src/i18n/messages/*.json` est modifié ;
   - en CI (`.github/workflows/ci.yml`), avant le build.

   Une clé ajoutée dans `fr.json` sans équivalent dans `en.json`/`ln.json`
   fait échouer le commit et la CI — impossible d'oublier une langue.

4. **Aucune chaîne de texte visible par l'utilisateur n'est codée en dur**
   dans les composants. Tout passe par `useTranslations`/`getTranslations`
   de next-intl, y compris dans `/app` et `/admin` (résolution de la
   locale : voir `docs/adr/0002-i18n-routing.md`). Ceci inclut les
   métadonnées de page (`<title>`, description) : `src/app/[locale]/layout.tsx`
   et `src/app/(private)/layout.tsx` lisent leurs titres depuis les
   namespaces `Metadata`/`PrivateArea`, pas depuis des littéraux.
5. **Relecture native lingala avant le Sprint 2**, conformément au CDC.
   Tant qu'elle n'a pas eu lieu, la mention `_status` en tête de `ln.json`
   documente l'état de brouillon, et `docs/adr/0002-i18n-routing.md`
   signale que les segments d'URL lingala (`/ln/connexion`, etc.) sont
   provisoires (identiques au français).

## Conséquences

- Une revue de code qui voit un nouveau `<p>Texte en dur</p>` dans
  `src/app/**` doit le refuser, quelle que soit la route (publique,
  auth, `/app`, `/admin`).
- Le script de parité doit être maintenu si la structure des messages
  évolue (ex. namespaces imbriqués plus profondément) : il compare des
  chemins de clés à plat (`Auth.login.placeholder`), pas juste les clés
  de premier niveau.
- La clé `_status` de `ln.json` est explicitement ignorée par le script de
  parité (métadonnée, pas une clé de contenu) — ne pas la dupliquer dans
  `fr.json`/`en.json`.
