-- ==============================================================================
-- Sterkte Records Distributor — Sprint 4 : Dashboard artiste (§11.3)
-- Schéma minimal nécessaire au dashboard : artists, releases/tracks (colonnes
-- déjà conformes au §12 — le tunnel de distribution du Sprint suivant, §11.4,
-- les complètera sans les recréer), stats_monthly, wallet, notifications.
-- RLS activée sur toutes les tables (§17), scoping "propriétaire uniquement"
-- (pas encore de comptes équipe/managers multi-artistes — §7.2, V1 ultérieur).
-- ==============================================================================

create type public.artist_plan as enum ('solo', 'label');

create type public.release_type as enum ('single', 'ep', 'album');

-- Cycle de vie §11.4 : Brouillon → En validation → En cours de livraison →
-- Livrée → (En erreur / Retrait en cours → Retirée).
create type public.release_status as enum (
  'draft',
  'in_review',
  'delivering',
  'delivered',
  'error',
  'takedown_requested',
  'removed'
);

create type public.notification_channel as enum ('inapp', 'email', 'whatsapp');

-- ------------------------------------------------------------------------------
-- artists (§12, §10.1 — onboarding profil artiste après inscription).
-- ------------------------------------------------------------------------------
create table public.artists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  slug text not null unique,
  name text not null,
  bio text,
  avatar_url text,
  links jsonb not null default '{}'::jsonb,
  plan public.artist_plan not null default 'solo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.artists is
  'Profil artiste (§10.1, §12). Un seul artiste par owner_id au MVP self-service — les comptes équipe/managers multi-artistes (§7.2) arriveront avec le forfait Label.';

alter table public.artists enable row level security;

create trigger set_updated_at
  before update on public.artists
  for each row execute function public.set_updated_at();

create or replace function public.owns_artist(target_artist_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.artists
    where id = target_artist_id and owner_id = auth.uid()
  );
$$;

comment on function public.owns_artist(uuid) is
  'Vrai si l''utilisateur courant possède cet artiste. SECURITY DEFINER pour servir de base aux policies releases/tracks/stats_monthly sans dupliquer la jointure.';

create policy "artists_select_own_or_staff"
  on public.artists for select
  using (owner_id = auth.uid() or public.is_staff());

create policy "artists_insert_own"
  on public.artists for insert
  with check (owner_id = auth.uid());

create policy "artists_update_own"
  on public.artists for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

grant select, insert, update on public.artists to authenticated;

-- ------------------------------------------------------------------------------
-- releases — colonnes conformes au §12 ; le tunnel à 9 étapes (§11.4, Sprint
-- suivant) ajoutera les métadonnées détaillées (contributeurs, splits...)
-- sans modifier ce qui existe déjà.
-- ------------------------------------------------------------------------------
create table public.releases (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists (id) on delete cascade,
  type public.release_type not null,
  title text not null,
  upc text,
  genre text,
  language text,
  explicit boolean not null default false,
  apple_artwork boolean not null default false,
  artwork_url text,
  release_date date,
  status public.release_status not null default 'draft',
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.releases is
  'Sorties (§11.4, §12). Jamais supprimées (archived à la place, §11.4 "aucune suppression définitive").';

alter table public.releases enable row level security;

create trigger set_updated_at
  before update on public.releases
  for each row execute function public.set_updated_at();

create or replace function public.owns_release(target_release_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.releases r
    join public.artists a on a.id = r.artist_id
    where r.id = target_release_id and a.owner_id = auth.uid()
  );
$$;

create policy "releases_select_own_or_staff"
  on public.releases for select
  using (public.owns_artist(artist_id) or public.is_staff());

create policy "releases_insert_own"
  on public.releases for insert
  with check (public.owns_artist(artist_id));

create policy "releases_update_own"
  on public.releases for update
  using (public.owns_artist(artist_id))
  with check (public.owns_artist(artist_id));

grant select, insert, update on public.releases to authenticated;

-- ------------------------------------------------------------------------------
-- tracks (§12) — "Top titres" du dashboard, détaillé par le tunnel Distribution.
-- ------------------------------------------------------------------------------
create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references public.releases (id) on delete cascade,
  position integer not null default 1,
  title text not null,
  isrc text,
  audio_url text,
  duration integer,
  explicit boolean not null default false,
  version text,
  created_at timestamptz not null default now()
);

comment on column public.tracks.duration is 'Durée en secondes.';

alter table public.tracks enable row level security;

create policy "tracks_select_own_or_staff"
  on public.tracks for select
  using (public.owns_release(release_id) or public.is_staff());

create policy "tracks_insert_own"
  on public.tracks for insert
  with check (public.owns_release(release_id));

create policy "tracks_update_own"
  on public.tracks for update
  using (public.owns_release(release_id))
  with check (public.owns_release(release_id));

grant select, insert, update on public.tracks to authenticated;

-- ------------------------------------------------------------------------------
-- stats_monthly (§12, §13.1) — remplie par le job de reporting mensuel
-- LabelGrid (à construire avec le module Royalties, V1) : aucune policy
-- INSERT/UPDATE pour le client, lecture seule pour le propriétaire.
-- ------------------------------------------------------------------------------
create table public.stats_monthly (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists (id) on delete cascade,
  track_id uuid references public.tracks (id) on delete cascade,
  period date not null,
  dsp text not null,
  country text,
  streams bigint not null default 0,
  revenue numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

comment on column public.stats_monthly.period is 'Premier jour du mois du reporting (ex. 2026-06-01 pour juin 2026).';

alter table public.stats_monthly enable row level security;

create policy "stats_monthly_select_own_or_staff"
  on public.stats_monthly for select
  using (public.owns_artist(artist_id) or public.is_staff());

grant select on public.stats_monthly to authenticated;

-- ------------------------------------------------------------------------------
-- wallet (§11.3, §11.5) — créé automatiquement à l'inscription (comme
-- profiles). Aucune policy INSERT/UPDATE pour le client : alimenté par les
-- webhooks paiement/le job de royalties (service_role), à construire avec
-- le module Royalties (V1).
-- ------------------------------------------------------------------------------
create table public.wallet (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  currency char(3) not null default 'USD' references public.currencies (code),
  balance_available numeric(12, 2) not null default 0,
  balance_pending numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.wallet enable row level security;

create trigger set_updated_at
  before update on public.wallet
  for each row execute function public.set_updated_at();

create policy "wallet_select_own"
  on public.wallet for select
  using (user_id = auth.uid());

grant select on public.wallet to authenticated;

create or replace function public.handle_new_user_wallet()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.wallet (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_wallet
  after insert on auth.users
  for each row execute function public.handle_new_user_wallet();

-- ------------------------------------------------------------------------------
-- notifications (§11.3, §12, §14) — écrites par le service_role (emails/
-- événements système), lues/marquées lues par leur destinataire.
-- ------------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  channel public.notification_channel not null default 'inapp',
  type text not null,
  payload jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "notifications_select_own"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "notifications_update_own"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, update on public.notifications to authenticated;
