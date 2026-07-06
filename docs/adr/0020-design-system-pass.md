# ADR 0020 — Passe Design System : consolidation + audit accessibilité

**Statut :** Implémenté et vérifié (build/typecheck/lint/i18n).

## Contexte

Dernière étape du plan de refonte artistique complète du site, après la
Home (ADR 0013/0014), Distribution (ADR 0015), Studio (ADR 0016), Booking
(ADR 0017), Tarifs/À propos/Contact (ADR 0018) et les deux Dashboards (ADR
0019). Objectif : formaliser les composants premium créés pendant la
refonte dans la vitrine interne `admin/design-system/page.tsx`, et vérifier
qu'aucun n'a été oublié côté `prefers-reduced-motion`.

## Décisions

### 1. Nouvelle section "Composants premium" dans la vitrine Design System

Ajout de quatre démonstrations à `admin/design-system/page.tsx` (déjà la
vitrine des composants `ui/` de base depuis le Sprint 1) : `AnimatedCounter`,
`StatStrip`, `PhotoMasonry` (avec de vraies photos déjà optimisées) et
`GrainOverlay`. La variante `premium` du bouton (ADR 0013) rejoint la
rangée de démonstration des boutons existante. `ScrollReveal`,
`ScrollSnapRow`, `ImageTextRow`, `FullBleedImage`, `CoverComposition` et
`ReleasePipeline` ne sont pas démontrés isolément dans cette vitrine
statique (`CoverComposition`/`ReleasePipeline` nécessitent un cycle
temporel pour être compris, `ScrollReveal` nécessite un scroll réel,
`ScrollSnapRow`/`ImageTextRow`/`FullBleedImage` sont déjà visibles en
contexte sur les pages qui les utilisent) — les montrer une seconde fois
hors contexte n'aurait pas apporté grand-chose de plus que ce que Studio/
Booking/À propos démontrent déjà en conditions réelles.

### 2. Audit `prefers-reduced-motion` : vérification systématique, pas seulement au cas par cas

Vérification automatisée (recherche de `repeat: Infinity` sans
`useReducedMotion` correspondant) sur l'ensemble de
`src/components/marketing/*.tsx` : **aucune animation en boucle sans garde
trouvée**. Chaque composant construit pendant la refonte
(`ambient-background`, `distribution-hero`, `studio-hero`, `booking-hero`,
`about-hero`, `cover-composition`, `release-pipeline`, `animated-counter`,
`scroll-reveal`) respecte déjà la contrainte actée depuis l'ADR 0013 :
`useReducedMotion()` vérifié explicitement, jamais seulement la règle CSS
globale de `globals.css` (qui ne couvre que les animations/transitions
CSS, pas les animations pilotées par `motion/react`).

## Vérification

- `pnpm typecheck`/`lint`/`i18n:check` (1041 clés, parité FR/EN/LN)/
  `css:check`/`build` : tous verts.
- Audit `prefers-reduced-motion` : script de recherche exécuté sur tous les
  composants marketing, aucune omission trouvée.
- **Non vérifié** : rendu visuel réel de la vitrine Design System (outil de
  capture d'écran en panne depuis le début du chantier Home, cf. ADR 0013)
  — à revérifier en navigateur, avec un audit Lighthouse mobile réel, après
  un premier déploiement (contrainte d'environnement documentée depuis
  l'ADR 0007).

## Bilan de la refonte artistique complète

Neuf pages/zones retravaillées en une session continue, du brief au code
vérifié : Home (ADR 0013/0014), Distribution (0015), Studio (0016),
Booking (0017), Tarifs/À propos/Contact (0018), Dashboards Artiste et
Label/Admin (0019), passe Design System (ce document). Nouveaux
composants premium réutilisables : `AmbientBackground`, `GrainOverlay`,
`ScrollReveal`, `AnimatedCounter`, `CoverComposition`, `CatalogueShowcase`,
`PlatformMarquee` (logos réels), `DistributionHero`, `ReleasePipeline`,
`StatStrip`, `FullBleedImage`, `StudioHero`, `PhotoMasonry`,
`ScrollSnapRow`, `BookingHero`, `PricingHero`, `AboutHero`, `ImageTextRow`,
`ContactHero`, `ReleasesBanner`, `ReleaseRow`, `ArtistRow`. Toutes les
pages marketing publiques restent prérendues statiquement (`●` SSG,
vérifié à chaque étape) ; toutes les pages privées restent protégées par
la garde d'authentification existante.

**Limite d'environnement constante sur l'ensemble du chantier** : aucune
vérification visuelle réelle (capture d'écran, animations en mouvement)
n'a été possible, l'outil de preview ayant cessé de produire des captures
d'écran dès la fin de la session précédente (`about:blank` lui-même ne
pouvait plus être capturé — panne indépendante du code, documentée en ADR
0013). Chaque page a été vérifiée par : lecture du HTML rendu (fetch
direct), snapshot d'accessibilité, inspection DOM (positions, tailles,
classes), vérification que toutes les images optimisées répondent 200 via
l'optimiseur `next/image`, et absence de débordement horizontal en mobile
(375px). Une vérification visuelle complète (Lighthouse mobile compris)
reste nécessaire après le premier déploiement réel.
