# ADR 0009 — Module Distribution (Sprint 5, §11.4 — cœur MVP)

**Statut :** Validé par Axel (2026-07-04/05) — deux décisions de cadrage explicitement demandées : upload multipart résumable complet, et moteur de validation modulaire "premium évolutif" avec règles réelles + architecture prête pour l'IA/OCR future.

## Contexte

Le §11.4 décrit le tunnel de distribution en 9 étapes (cœur du MVP), avec
sauvegarde automatique, contrôles automatiques poussés (audio, pochette,
métadonnées), et une gestion post-sortie stricte (aucune suppression
définitive). Axel a validé deux cadrages avant le début de ce sprint (voir
questions posées le 2026-07-04) :

1. **Upload multipart résumable complet** plutôt qu'une URL présignée simple.
2. **Moteur de validation "premium évolutif"** : toutes les vérifications
   réalisables de manière fiable en V1, une architecture modulaire prête
   pour l'IA/OCR (texte, logos, nudité, violence, filigrane, doublon de
   pochette) sans refonte future, des messages toujours compréhensibles
   (statut clair + explication + correction + lien vers la règle, jamais de
   jargon technique).

## Décisions

### 1. Upload multipart résumable réel

`src/lib/storage/r2.ts` implémente le cycle complet S3/R2
(`CreateMultipartUpload`/`UploadPart`/`CompleteMultipartUpload`/
`AbortMultipartUpload`). Les tables `upload_sessions`/`upload_parts`
(migration `20260704170000_distribution_module.sql`) persistent l'`UploadId`
et chaque part confirmée (ETag) : `startUploadSession` (dans
`src/lib/uploads/actions.ts`) reprend automatiquement une session
`in_progress` dont le hash SHA-256 correspond au fichier re-sélectionné
après un rechargement de page, en ne renvoyant que les parts manquantes.

**Prérequis d'infrastructure non automatisable depuis ce repo** : le bucket
R2 doit autoriser `PUT` en CORS pour l'origine du site et exposer l'en-tête
`ETag` (`Access-Control-Expose-Headers: ETag`), sans quoi
`useResumableUpload` (`src/hooks/use-resumable-upload.ts`) ne peut pas lire
l'ETag renvoyé par le navigateur pour compléter l'upload. À configurer une
fois dans le dashboard Cloudflare (ou via Wrangler/API) quand un bucket réel
existe.

**Simplification assumée** : les fichiers d'un même envoi (les pistes d'un
album) sont uploadés **séquentiellement**, pas en parallèle — un seul upload
actif à la fois. Le hook `useResumableUpload` est appelé une seule fois par
étape (pas une fois par fichier), ce qui aurait autrement nécessité soit un
hook par ligne (invalide en React — les hooks ne peuvent pas être appelés
dans une boucle dynamique), soit une réécriture de l'API du hook en
gestionnaire de file d'attente interne. Pour un nombre de pistes typique
(1 à 15), l'upload séquentiel reste rapide et évite cette complexité
supplémentaire ; chaque upload individuel reste, lui, pleinement résumable.

### 2. Moteur de validation modulaire — règles réelles + architecture IA-ready

`src/lib/validation/types.ts` définit `ValidationRule`/`ValidationReport` :
chaque règle est un objet `{ id, category, enabled, check }` indépendant,
activable/désactivable sans toucher au moteur (`runValidation`) ni aux
autres règles. Aucun message ne contient de texte en dur — toutes les
règles renvoient des clés i18n (`messageKey`/`explanationKey`/
`suggestionKey`), traduites par `ValidationReportView`
(`src/components/validation/validation-report-view.tsx`), avec un statut
clair (OK/Avertissement/Erreur), une explication et une proposition de
correction compréhensibles par un artiste débutant — jamais de message du
type "Validation Error".

**Règles audio réelles** (`src/lib/validation/audio/`) : parsing direct des
en-têtes WAV (RIFF/fmt) et FLAC (STREAMINFO bit-à-bit) pour le sample
rate/bit depth/canaux exacts (`AudioContext.decodeAudioData` rééchantillonne
souvent et perd cette information d'origine) ; parsing du premier frame MPEG
pour le MP3 (bitrate/sample rate, durée estimée — exacte en CBR,
approximative en VBR faute de scanner tous les frames, documenté comme
tel) ; décodage Web Audio API pour l'analyse du signal (silence début/fin,
écrêtage, pics anormaux, hash SHA-256 pour les doublons intra-envoi et
inter-catalogue, cohérence durée déclarée/réelle, intégrité du fichier).

**Niveau sonore : approximation assumée.** `estimateLoudness` calcule un
RMS global converti en dBFS — **ce n'est pas un calcul LUFS certifié
ITU-R BS.1770** (qui exige un filtre de pondération K + un portillonnage sur
blocs de 400 ms). Suffisant pour repérer une piste anormalement faible/forte
ou un pic isolé, documenté comme approximatif dans le code
(`signal-analysis.ts`), pas comme une certification broadcast.

**Règles pochette réelles** (`src/lib/validation/artwork/`) : dimensions/
ratio/poids/format via Canvas ; détection CMJN via parsing réel du marqueur
SOF JPEG (nombre de composantes couleur + marqueur Adobe APP14) — l'API
`Image`/`Canvas` du navigateur n'expose ce nombre de composantes nulle part
autrement ; flou (variance du Laplacien), image vide (variance des
niveaux de gris), marges blanches/transparentes (échantillonnage des bords)
— toutes calculées sur une version réduite (300 px) de l'image pour rester
rapides dans le thread principal, les vérifications de dimensions utilisant
elles les dimensions réelles.

**Règles métadonnées réelles** (`src/lib/validation/metadata/`) : champs
requis, cohérence artiste principal/featuring/dates/contenu explicite,
format ISRC, **checksum UPC-A réel** (norme GS1, mod 10), somme des splits =
100 %, doublons ISRC/UPC/titre dans le catalogue de l'artiste.

**Non construit ce sprint (validé avec Axel), architecture prête pour plus
tard** : détection de texte interdit/logos de plateformes/URLs/QR codes/
contenu explicite/nudité/violence/filigrane/pochette déjà distribuée. Ces
règles nécessitent un service de vision par ordinateur externe (OCR/ML) —
aucune fausse détection simulée. `ARTWORK_RULES`/`AUDIO_RULES` sont de
simples tableaux : ajouter une de ces règles plus tard = ajouter un objet
`{ id, category, enabled: true, check: async (ctx) => ... }` qui appelle le
service choisi, sans toucher au moteur ni aux règles existantes. En
attendant, l'étape 5 (pochette) fait auto-déclarer ces points à l'artiste
(case à cocher par règle, § `artworkStep.selfDeclaration`).

**Séquencement de la validation métadonnées dans le tunnel** : les règles
qui dépendent des contributeurs (artiste principal présent, somme des
splits) ne peuvent pas s'exécuter utilement à l'étape 3 (Métadonnées),
puisque les contributeurs ne sont saisis qu'à l'étape 4. Le rapport
**complet** (`METADATA_RULES`) ne s'exécute qu'à l'étape 8 (Récapitulatif),
conformément au §11.4 qui y place justement le "rapport de validation
listant erreurs et avertissements". Les étapes 3 et 4 gardent leurs propres
retours immédiats (validation de formulaire React Hook Form + Zod, somme des
splits affichée en direct).

### 3. DSP sans logos officiels reproduits

`step-platforms.tsx` affiche chaque plateforme (Spotify, Apple Music,
Deezer...) avec une icône générique (initiale + couleur par catégorie),
jamais le logo officiel — ce sont des marques déposées, et aucun asset SVG
de ces logos n'existe dans le dépôt (`mock-client.ts` référence des chemins
`/dsp/*.svg` hérités du Sprint 0, jamais servis).

### 4. Option Artwork Apple Music : prix affiché, pas de paiement réel

Le §11.4 étape 5 mentionne "+10 $" recalculé automatiquement. Le prix est
affiché et pris en compte dans le récapitulatif (étape 8), mais **aucune
charge réelle n'est effectuée** à la soumission (étape 9) : le module
Paiements/Royalties (§11.5, V1) n'existe pas encore (cohérent avec les
Sprints 3/4, où le même constat a été fait pour l'abonnement et les
retraits).

### 5. Gestion post-sortie : requêtes journalisées, pas de workflow d'approbation

"Demander une modification" (§11.4, recommandation Q16) journalise la
demande dans `audit_log` (action `modification_requested`) pour traitement
manuel par l'équipe — pas de ticketing/workflow d'approbation automatisé
dans ce sprint (relèverait du back-office, §11.10, sprint séparé). Le
takedown (`requestTakedown`) passe le statut à `takedown_requested` et
archive la sortie (jamais de suppression définitive, §11.4) ; le passage
final à `removed` sera fait par le job de synchronisation LabelGrid (§13.1,
même limite que la transition `delivering` → `delivered`, qui reste figée
faute de job de statut/webhook — pas construit ce sprint, ni le précédent).

### 6. `LabelGridClient` étendu avec `requestTakedown`

Ajout d'une méthode au contrat défini au Sprint 0 (`src/lib/labelgrid/types.ts`)
pour couvrir le retrait (§11.4) — cohérent avec le principe de l'adaptateur
(ADR 0003) : le contrat évolue avec les besoins produit réels, l'implémentation
mock reste triviale, la vraie implémentation attendra la doc API LabelGrid.

### 7. Contrainte d'environnement (inchangée)

Toujours aucun projet Supabase réel connecté, ni bucket R2 réel. Le schéma,
les policies RLS, l'upload multipart et les règles de validation sont
vérifiés par `typecheck`/`lint`/`build` et par lecture/cohérence interne. Le
test de bout en bout réel (upload réel vers R2, session résumée après une
vraie coupure réseau, soumission LabelGrid réelle) reste à faire dès qu'un
projet Supabase et un bucket R2 existent.
