-- ==============================================================================
-- Sterkte Records Distributor — Multi-artistes Label (ADR 0026, suite)
-- Met à jour uniquement le commentaire de `public.artists` : le plafond "un
-- seul artiste par owner_id" ne tient plus depuis que le forfait Label peut
-- posséder jusqu'à 5 artistes (plafond appliqué côté application dans
-- createArtistProfile, src/app/(private)/app/actions.ts, via plans.max_artists).
-- Aucun changement de schéma/RLS : owner_id, les policies et owns_artist()
-- supportaient déjà nativement plusieurs artistes par propriétaire.
-- ==============================================================================

comment on table public.artists is
  'Profil artiste (§10.1, §12). Plusieurs artistes possibles par owner_id — plafonné par plans.max_artists (1 pour Solo/Pro, 5 pour Label, ADR 0026). Le compte choisit un artiste "actif" côté application (cookie, voir src/lib/artists/active-artist.ts) ; la RLS reste scopée par artist_id, pas par owner_id, donc aucune migration de policy n''est nécessaire.';
