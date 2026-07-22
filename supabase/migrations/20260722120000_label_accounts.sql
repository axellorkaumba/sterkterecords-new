-- ==============================================================================
-- Sterkte Records Distributor — Comptes Label, Phase 1 (ADR 0029)
-- Espace Label distinct du profil artiste : un compte inscrit comme Label
-- (profiles.role = 'manager', déjà dans l'enum depuis la migration
-- 20260704140000 mais jamais exploité) crée d'abord son espace label, puis
-- ses artistes un par un (artists.owner_id — déjà multi-artiste depuis
-- l'ADR 0027, aucun changement nécessaire côté artists/releases).
-- ==============================================================================

create table public.labels (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  slug text not null unique,
  name text not null,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);

comment on table public.labels is
  'Espace Label (ADR 0029) — un seul par owner_id (contrainte unique : contrairement aux artistes, un compte manager n''a qu''un espace label). Les artistes du label restent liés par artists.owner_id, pas par une FK vers labels — même owner_id que le label, réutilise tel quel le switcher multi-artiste de l''ADR 0027.';

alter table public.labels enable row level security;

create trigger set_updated_at
  before update on public.labels
  for each row execute function public.set_updated_at();

-- Mêmes policies que public.artists (20260704160000_dashboard_core.sql) —
-- accès propriétaire ou personnel interne uniquement.
create policy "labels_select_own_or_staff"
  on public.labels for select
  using (owner_id = auth.uid() or public.is_staff());

create policy "labels_insert_own"
  on public.labels for insert
  with check (owner_id = auth.uid());

create policy "labels_update_own"
  on public.labels for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

grant select, insert, update on public.labels to authenticated;

-- ------------------------------------------------------------------------------
-- handle_new_user() (définie dans 20260704140000_auth_profiles_and_roles.sql) :
-- ajoute la lecture de `account_type` dans les métadonnées d'inscription
-- (`signUp({ options: { data: { account_type: "label" } } })`, voir
-- src/app/[locale]/(auth)/actions.ts) pour attribuer le rôle `manager` dès la
-- création du profil. Défaut `artist` inchangé si absent (rétrocompatible
-- avec les inscriptions existantes, qui n'envoient pas ce champ).
-- ------------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, locale, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(new.raw_user_meta_data ->> 'locale', 'fr'),
    case
      when new.raw_user_meta_data ->> 'account_type' = 'label' then 'manager'::public.user_role
      else 'artist'::public.user_role
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
