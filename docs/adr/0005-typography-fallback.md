# ADR 0005 — Polices de substitution en attendant Clash Display / Satoshi

**Statut :** Proposé — à valider par Axel l'or Kaumba (choix de substitution
temporaire, pas une remise en cause du choix Clash Display/Satoshi du CDC).

## Contexte

Le §9.2 du CDC prescrit **Clash Display** (titres) et **Satoshi** (corps),
toutes deux distribuées par **Fontshare** sous licence commerciale
gratuite. Ni l'une ni l'autre n'est disponible sur Google Fonts, donc pas
chargeable via `next/font/google`. Les intégrer correctement nécessite de
télécharger les fichiers `.woff2` depuis fontshare.com (après acceptation
de leur licence) et de les servir en local via `next/font/local`.

Cette action doit être faite par quelqu'un de l'équipe (ou moi si on me
fournit un accès), pas devinée : je ne fabrique pas de fichiers de police.

## Décision (provisoire)

En attendant ces fichiers, `src/lib/fonts.ts` utilise :

| Rôle             | Police CDC (§9.2) | Substitut provisoire                   | Pourquoi                                                                                                             |
| ---------------- | ----------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Corps / UI       | Satoshi           | **Inter**                              | Explicitement autorisé comme repli par le CDC lui-même                                                               |
| Titres / Display | Clash Display     | **Bricolage Grotesque** (Google Fonts) | Profil visuel proche (grotesque contemporaine à forte personnalité), disponible immédiatement sans risque de licence |
| Monospace        | JetBrains Mono    | **JetBrains Mono**                     | Identique — disponible sur Google Fonts, aucune substitution nécessaire                                              |

Tout le reste du design system (composants, tokens) référence uniquement
les tokens `font-sans` / `font-display` / `font-mono` — jamais un nom de
police en dur. Le remplacement par les vraies polices Fontshare se fera
donc dans ce seul fichier, sans toucher aux composants.

## Ce qu'il reste à faire

1. Télécharger `Clash Display` et `Satoshi` depuis
   [fontshare.com](https://www.fontshare.com) (licence à lire et accepter).
2. Déposer les fichiers `.woff2` dans `src/fonts/`.
3. Remplacer dans `src/lib/fonts.ts` les imports `next/font/google` par
   `next/font/local`, en gardant les mêmes noms de variables CSS
   (`--font-body`, `--font-display-raw`) pour que rien d'autre ne change.
4. Supprimer cet ADR une fois fait, ou le marquer "Résolu".

## Conséquences si non traité avant la mise en production

Le rendu visuel restera correct et professionnel (Inter/Bricolage
Grotesque sont des polices de qualité), mais ne correspondra pas
exactement à l'identité "Clash Display + Satoshi" voulue par la marque.
