-- ==============================================================================
-- Sterkte Records Distributor — Sprint 5 : Module Distribution (§11.4, cœur MVP)
-- Contributeurs/splits, plateformes, synchronisation LabelGrid, uploads
-- résumables (multipart S3 réel), rapports de validation (moteur modulaire).
-- RLS activée sur toutes les tables (§17).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Compléments releases/tracks (§11.4 étape 3) — colonnes déjà prévues au
-- schéma cible, pas de refonte des tables créées au Sprint 4.
-- ------------------------------------------------------------------------------
alter table public.releases
  add column sub_genre text,
  add column recording_date date,
  add column copyright_p text,
  add column copyright_c text,
  add column label_name text not null default 'Sterkte Records',
  add column release_time time,
  add column release_timezone text,
  add column current_step integer not null default 1,
  add column submitted_at timestamptz;

comment on column public.releases.current_step is
  'Étape du tunnel où en est le brouillon (1 à 9, §11.4) — permet de reprendre une sortie non terminée exactement où elle a été laissée.';

alter table public.tracks
  add column audio_hash text,
  add column sample_rate integer,
  add column bit_depth integer,
  add column codec text,
  add column loudness_lufs numeric(5, 2),
  add column file_size bigint;

comment on column public.tracks.audio_url is
  'Clé de l''objet R2 (pas une URL publique) — l''audio n''est jamais public par défaut (§17). Servi via URL présignée à la demande.';
comment on column public.tracks.audio_hash is
  'SHA-256 du fichier audio — détection de doublons (§11.4 étape 2).';

-- ------------------------------------------------------------------------------
-- contributors (§11.4 étape 4, §12) — rôle + répartition des royalties.
-- ------------------------------------------------------------------------------
create type public.contributor_role as enum (
  'main_artist',
  'featuring',
  'composer',
  'author',
  'producer',
  'mixing',
  'mastering'
);

create table public.contributors (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks (id) on delete cascade,
  role public.contributor_role not null,
  name text not null,
  split_pct numeric(5, 2) not null check (split_pct >= 0 and split_pct <= 100),
  -- Rattachement à un compte artiste (paiement direct) — [V1], colonne prête.
  linked_user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.contributors enable row level security;

create or replace function public.owns_track(target_track_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.tracks t
    join public.releases r on r.id = t.release_id
    join public.artists a on a.id = r.artist_id
    where t.id = target_track_id and a.owner_id = auth.uid()
  );
$$;

create policy "contributors_select_own_or_staff"
  on public.contributors for select
  using (public.owns_track(track_id) or public.is_staff());

create policy "contributors_insert_own"
  on public.contributors for insert
  with check (public.owns_track(track_id));

create policy "contributors_update_own"
  on public.contributors for update
  using (public.owns_track(track_id))
  with check (public.owns_track(track_id));

create policy "contributors_delete_own"
  on public.contributors for delete
  using (public.owns_track(track_id));

grant select, insert, update, delete on public.contributors to authenticated;

-- ------------------------------------------------------------------------------
-- release_platforms (§11.4 étape 6, §12) — DSP sélectionnés pour une sortie.
-- ------------------------------------------------------------------------------
create table public.release_platforms (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references public.releases (id) on delete cascade,
  dsp text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (release_id, dsp)
);

alter table public.release_platforms enable row level security;

create policy "release_platforms_select_own_or_staff"
  on public.release_platforms for select
  using (public.owns_release(release_id) or public.is_staff());

create policy "release_platforms_insert_own"
  on public.release_platforms for insert
  with check (public.owns_release(release_id));

create policy "release_platforms_delete_own"
  on public.release_platforms for delete
  using (public.owns_release(release_id));

grant select, insert, delete on public.release_platforms to authenticated;

-- ------------------------------------------------------------------------------
-- labelgrid_sync (§13.1, §12) — miroir de l'état de livraison côté LabelGrid.
-- Écrit par le serveur (Server Action de soumission + futur webhook) : pas de
-- policy INSERT/UPDATE pour le client, lecture seule pour le propriétaire.
-- ------------------------------------------------------------------------------
create table public.labelgrid_sync (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references public.releases (id) on delete cascade,
  external_id text not null,
  status text not null,
  last_synced_at timestamptz not null default now(),
  payload jsonb,
  created_at timestamptz not null default now()
);

alter table public.labelgrid_sync enable row level security;

create policy "labelgrid_sync_select_own_or_staff"
  on public.labelgrid_sync for select
  using (public.owns_release(release_id) or public.is_staff());

grant select on public.labelgrid_sync to authenticated;

-- ------------------------------------------------------------------------------
-- upload_sessions / upload_parts (§11.4 étape 2 — "multipart/resumable")
-- Suivi réel des parts S3 déjà envoyées : une session interrompue (fermeture
-- d'onglet, coupure réseau) peut être reprise en ne renvoyant que les parts
-- manquantes (voir src/lib/storage/r2.ts, useResumableUpload).
-- ------------------------------------------------------------------------------
create type public.upload_kind as enum ('audio', 'artwork');
create type public.upload_status as enum ('in_progress', 'completed', 'aborted');

create table public.upload_sessions (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid not null references public.profiles (id) on delete cascade,
  kind public.upload_kind not null,
  file_name text not null,
  file_size bigint not null,
  mime_type text not null,
  r2_key text not null,
  r2_upload_id text not null,
  part_size bigint not null,
  total_parts integer not null,
  status public.upload_status not null default 'in_progress',
  sha256_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.upload_sessions is
  'Une ligne par upload multipart S3/R2 en cours ou terminé. r2_upload_id = UploadId retourné par CreateMultipartUpload.';

alter table public.upload_sessions enable row level security;

create trigger set_updated_at
  before update on public.upload_sessions
  for each row execute function public.set_updated_at();

create policy "upload_sessions_select_own"
  on public.upload_sessions for select
  using (uploader_id = auth.uid());

create policy "upload_sessions_insert_own"
  on public.upload_sessions for insert
  with check (uploader_id = auth.uid());

create policy "upload_sessions_update_own"
  on public.upload_sessions for update
  using (uploader_id = auth.uid())
  with check (uploader_id = auth.uid());

grant select, insert, update on public.upload_sessions to authenticated;

create table public.upload_parts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.upload_sessions (id) on delete cascade,
  part_number integer not null,
  etag text not null,
  size bigint not null,
  uploaded_at timestamptz not null default now(),
  unique (session_id, part_number)
);

comment on table public.upload_parts is
  'Parts déjà envoyées avec succès à R2 (ETag renvoyé par UploadPart) — permet à une session reprise de sauter les parts déjà présentes.';

alter table public.upload_parts enable row level security;

create policy "upload_parts_select_own"
  on public.upload_parts for select
  using (
    exists (
      select 1 from public.upload_sessions s
      where s.id = session_id and s.uploader_id = auth.uid()
    )
  );

create policy "upload_parts_insert_own"
  on public.upload_parts for insert
  with check (
    exists (
      select 1 from public.upload_sessions s
      where s.id = session_id and s.uploader_id = auth.uid()
    )
  );

grant select, insert on public.upload_parts to authenticated;

-- ------------------------------------------------------------------------------
-- validation_reports (§11.4 — moteur de validation modulaire) — un rapport
-- par exécution du moteur contre une entité (piste, sortie, upload de
-- pochette). `report` contient la liste des résultats de règles (statut,
-- message, explication, suggestion, lien) — voir
-- src/lib/validation/engine.ts pour la forme exacte.
-- ------------------------------------------------------------------------------
create table public.validation_reports (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('track', 'release', 'artwork')),
  entity_id uuid not null,
  report jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.validation_reports enable row level security;

create or replace function public.owns_validation_entity(target_entity_type text, target_entity_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if target_entity_type = 'track' then
    return public.owns_track(target_entity_id);
  elsif target_entity_type = 'release' then
    return public.owns_release(target_entity_id);
  elsif target_entity_type = 'artwork' then
    return exists (
      select 1 from public.upload_sessions where id = target_entity_id and uploader_id = auth.uid()
    );
  end if;
  return false;
end;
$$;

create policy "validation_reports_select_own_or_staff"
  on public.validation_reports for select
  using (public.owns_validation_entity(entity_type, entity_id) or public.is_staff());

create policy "validation_reports_insert_own"
  on public.validation_reports for insert
  with check (public.owns_validation_entity(entity_type, entity_id));

grant select, insert on public.validation_reports to authenticated;
