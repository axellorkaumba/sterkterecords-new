/**
 * Modèle de contenu pour le catalogue de sorties réelles mis en avant sur
 * le site marketing (Hero + section "Notre catalogue", cf. ADR redesign
 * Home). Volontairement séparé des données `releases` de l'app (Supabase,
 * Sprint 4/5) : ceci est une vitrine marketing statique et sélectionnée à
 * la main, pas le flux temps réel des sorties d'un artiste connecté.
 *
 * `year`/`platforms` sont volontairement optionnels : on affiche déjà les
 * pochettes réelles disponibles plutôt que d'attendre d'avoir toutes les
 * métadonnées (§ pas de fausses données inventées, cf. ADR 0006).
 */
export interface CatalogueRelease {
  slug: string;
  title: string;
  artist: string;
  /** Chemin sous public/, ex. "/covers/feyme-mami-wata.avif". */
  coverSrc: string;
  year?: number;
  platforms?: string[];
  /** Sortie compilation/label plutôt qu'un artiste solo (ex. "Kulturre Vol. 01"). */
  isCompilation?: boolean;
}
