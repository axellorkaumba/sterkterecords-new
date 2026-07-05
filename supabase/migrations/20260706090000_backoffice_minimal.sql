-- ==============================================================================
-- Sterkte Records Distributor — Sprint 8 : Back-office minimal (§11.10)
--
-- Le back-office minimal du MVP (§3.1 : "voir/valider les sorties, gérer
-- les artistes label") demande que le staff puisse :
-- 1. Approuver/renvoyer une sortie en file de validation qualité — ce qui
--    suppose de pouvoir modifier `releases` (statut), pas seulement les lire
--    (déjà permis par `releases_select_own_or_staff` depuis le Sprint 4).
-- 2. Faire basculer un artiste entre le forfait Solo (self-service) et Label
--    (géré en interne, §7.1/§10.2) — ce qui suppose de pouvoir modifier
--    `artists`, pas seulement les lire.
--
-- Les policies UPDATE existantes (Sprint 4) ne couvraient que le
-- propriétaire (`owns_artist`) : on les remplace par des versions incluant
-- `is_staff()`, même principe de défense en profondeur que le reste du
-- schéma (§17) plutôt que de faire passer ces actions par le client
-- service_role alors qu'une session staff authentifiée existe déjà.
-- ==============================================================================

drop policy "releases_update_own" on public.releases;

create policy "releases_update_own_or_staff"
  on public.releases for update
  using (public.owns_artist(artist_id) or public.is_staff())
  with check (public.owns_artist(artist_id) or public.is_staff());

drop policy "artists_update_own" on public.artists;

create policy "artists_update_own_or_staff"
  on public.artists for update
  using (owner_id = auth.uid() or public.is_staff())
  with check (owner_id = auth.uid() or public.is_staff());
