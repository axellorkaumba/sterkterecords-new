-- ==============================================================================
-- Sterkte Records Distributor — Collaborateurs par artiste, Phase 2 (ADR 0030)
-- Invitation d'un tiers sur un artiste précis (§7.2, différé depuis
-- l'ADR 0008, toujours hors périmètre de l'ADR 0027). Coupe volontaire pour
-- cette Phase 2 : accès LECTURE SEULE uniquement (dashboard/catalogue/stats),
-- quel que soit `permission` — `owns_artist()`/`owns_release()` restent
-- inchangées (donc réservées au propriétaire) pour TOUTES les policies
-- d'écriture (insert/update sur releases/tracks/...). `permission = 'manage'`
-- est un champ prêt pour une Phase future qui donnerait de vrais droits
-- d'édition, non câblé ici (voir docs/adr/0030-collaborateurs-phase-2.md).
-- ==============================================================================

create type public.collaborator_permission as enum ('view', 'manage');
create type public.collaborator_status as enum ('pending', 'accepted', 'revoked');

create table public.artist_collaborators (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists (id) on delete cascade,
  invited_email text not null,
  -- Renseigné seulement à l'acceptation (accept_artist_collaborator_invite) —
  -- l'invité peut ne pas encore avoir de compte au moment de l'invitation.
  user_id uuid references public.profiles (id) on delete cascade,
  permission public.collaborator_permission not null default 'view',
  status public.collaborator_status not null default 'pending',
  -- Jeton opaque de l'email d'invitation — un UUID v4 offre la même
  -- imprévisibilité qu'un token aléatoire dédié, sans dépendre de pgcrypto.
  token text not null unique default gen_random_uuid()::text,
  invited_by uuid not null references public.profiles (id) on delete cascade,
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (artist_id, invited_email)
);

comment on table public.artist_collaborators is
  'Invitation d''un tiers sur un artiste précis (ADR 0030, Phase 2). Lecture seule pour l''invité quel que soit `permission` — voir le commentaire en tête de fichier.';

alter table public.artist_collaborators enable row level security;

create trigger set_updated_at
  before update on public.artist_collaborators
  for each row execute function public.set_updated_at();

create policy "artist_collaborators_select"
  on public.artist_collaborators for select
  using (public.owns_artist(artist_id) or user_id = auth.uid() or public.is_staff());

create policy "artist_collaborators_insert_owner"
  on public.artist_collaborators for insert
  with check (public.owns_artist(artist_id) and invited_by = auth.uid());

create policy "artist_collaborators_update_owner"
  on public.artist_collaborators for update
  using (public.owns_artist(artist_id))
  with check (public.owns_artist(artist_id));

grant select, insert, update on public.artist_collaborators to authenticated;

-- ------------------------------------------------------------------------------
-- Acceptation d'une invitation — fonction dédiée plutôt qu'une policy UPDATE
-- ouverte à l'invité (qui aurait dû exposer `user_id`/`status`/`accepted_at`
-- en écriture à n'importe quel utilisateur authentifié). SECURITY DEFINER :
-- contourne la RLS mais ne fait qu'une chose précise, avec `where token = ...
-- and status = 'pending'` comme seule porte d'entrée.
-- ------------------------------------------------------------------------------
create or replace function public.accept_artist_collaborator_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_artist_id uuid;
begin
  update public.artist_collaborators
  set user_id = auth.uid(), status = 'accepted', accepted_at = now()
  where token = p_token and status = 'pending'
  returning artist_id into v_artist_id;

  return v_artist_id;
end;
$$;

comment on function public.accept_artist_collaborator_invite(text) is
  'Accepte une invitation via son token — seul point d''entrée pour qu''un invité modifie sa propre ligne artist_collaborators (voir commentaire ci-dessus).';

grant execute on function public.accept_artist_collaborator_invite(text) to authenticated;

-- ------------------------------------------------------------------------------
-- Helpers de lecture partagée — utilisés uniquement par des policies SELECT,
-- jamais par une policy insert/update (voir note en tête de fichier).
-- ------------------------------------------------------------------------------
create or replace function public.is_artist_collaborator(target_artist_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.artist_collaborators
    where artist_id = target_artist_id
      and user_id = auth.uid()
      and status = 'accepted'
  );
$$;

create or replace function public.is_release_collaborator(target_release_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.releases r
    where r.id = target_release_id and public.is_artist_collaborator(r.artist_id)
  );
$$;

-- ------------------------------------------------------------------------------
-- Extension des policies SELECT existantes (ALTER POLICY, pas de
-- comportement nouveau pour un compte sans collaborateur — cette clause
-- supplémentaire est toujours fausse tant qu'aucune ligne
-- artist_collaborators acceptée n'existe). Écriture (insert/update)
-- volontairement inchangée sur toutes ces tables (cf. note en tête de
-- fichier) : contributors/validation_reports (édition fine du tunnel) hors
-- périmètre de cette Phase 2, laissées à `owns_release` seul.
-- ------------------------------------------------------------------------------
alter policy "artists_select_own_or_staff" on public.artists
  using (owner_id = auth.uid() or public.is_staff() or public.is_artist_collaborator(id));

alter policy "releases_select_own_or_staff" on public.releases
  using (
    public.owns_artist(artist_id) or public.is_staff() or public.is_artist_collaborator(artist_id)
  );

alter policy "tracks_select_own_or_staff" on public.tracks
  using (
    public.owns_release(release_id) or public.is_staff() or public.is_release_collaborator(release_id)
  );

alter policy "stats_monthly_select_own_or_staff" on public.stats_monthly
  using (
    public.owns_artist(artist_id) or public.is_staff() or public.is_artist_collaborator(artist_id)
  );

alter policy "release_platforms_select_own_or_staff" on public.release_platforms
  using (
    public.owns_release(release_id) or public.is_staff() or public.is_release_collaborator(release_id)
  );

alter policy "labelgrid_sync_select_own_or_staff" on public.labelgrid_sync
  using (
    public.owns_release(release_id) or public.is_staff() or public.is_release_collaborator(release_id)
  );
