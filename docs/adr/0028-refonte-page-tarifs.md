# ADR 0028 — Refonte de la page publique `/tarifs`

**Statut :** Implémenté.

## Contexte

Repéré lors d'un audit demandé par Axel ("Vérifie tout ce qui est en place
actuellement et dis moi ce qui ne marche pas") : la page marketing publique
`/tarifs` n'avait jamais été mise à jour depuis l'ADR 0026 (3 forfaits
self-service Solo/Pro/Label). Elle affichait encore l'ancien modèle à deux
tarifs — Solo (international) + Afrique présentée comme une carte séparée —
et un forfait Label "sur devis" avec un CTA "Nous contacter", alors que
Label est désormais un forfait self-service comme les deux autres. Le
forfait Pro n'apparaissait nulle part.

Priorisé par Axel avant la partie paiements automatisés (Stripe/Flutterwave,
abandonnée — voir note plus bas), avec la consigne "on commence avec ça".

## Décisions

### 1. Grille à 3 cartes (Solo/Pro/Label), pas 2+1

Remplace les 3 cartes disparates de l'ancienne page (Solo avec toggle
mensuel/annuel inline, Afrique comme "4e forfait" à part, Label sans prix)
par 3 cartes structurellement identiques — même forme que
`SubscriptionPicker` (`/app/abonnement`), pour rester cohérent avec ce que
l'artiste voit une fois connecté. Nouveau composant client
`src/components/marketing/pricing-plans.tsx`, isolé du reste de la page
(elle reste un Server Component) car il a besoin d'état pour le toggle
mensuel/annuel.

### 2. Toggle mensuel/annuel partagé, tarif Afrique en note fixe

Un seul toggle au-dessus des 3 cartes (plutôt que 3 toggles indépendants
comme avant sur la seule carte Solo) : plus lisible, et évite de refaire
3 fois la même interaction. Le tarif Afrique reste affiché en note fixe
sous chaque carte (`{price}/an`, toujours visible, pas de bascule dédiée) —
il n'y a pas de tarif mensuel Afrique à afficher (ADR 0010 : "aucune valeur
codée en dur, mieux vaut ne rien inventer qu'un chiffre non validé"), un
second toggle aurait donc été à moitié vide selon la sélection.

### 3. Prix toujours en dur dans les messages i18n, pas lus depuis `plan_prices`

Choix déjà documenté dans l'ADR 0010 et reconduit tel quel : la page reste
prérendue statiquement (SSG), donc pas de lecture Supabase au build. C'est
justement l'absence de mécanisme de synchronisation qui a permis à cette
page de devenir obsolète après l'ADR 0026 — reste un compromis assumé, mais
qui veut dire concrètement qu'**un changement de prix futur nécessite une
mise à jour manuelle de cette page**, en plus de la base de données. Pas de
tâche récurrente automatisée pour l'instant ; à surveiller au prochain
changement de grille tarifaire.

### 4. FAQ : `labelPricing` devient `labelPlan`

L'ancienne question "Pourquoi le forfait Label n'a-t-il pas de prix
public ?" n'a plus de sens (il en a un). Remplacée par "Qu'est-ce que le
forfait Label change par rapport à Solo/Pro ?", répondant sur le plafond de
5 artistes plutôt que sur un accompagnement sur mesure inexistant.

## Hors périmètre de ce chantier

**Stripe/Flutterwave abandonnés** (décision d'Axel, confirmée dans cette
session) : les clés ne seront pas configurées. Cela laisse un point ouvert
non traité ici — `resolveProviderForCountry`
(`src/lib/payments/pricing.ts`) retombe encore sur `"stripe"` par défaut
pour tout pays dont `countries.default_payment_provider` n'est pas
explicitement renseigné, ce qui reproduirait le crash constaté à l'audit
pour ces pays. Faudra soit changer ce défaut vers `"paypal"`/`"manual"`,
soit s'assurer que tous les pays actifs ont une valeur explicite en base —
pas fait dans ce chantier, qui ne portait que sur `/tarifs`.
