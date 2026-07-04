-- ==============================================================================
-- Sterkte Records Distributor — Sprint 3 : Authentification & comptes (§11.2)
-- Rôles (§7.1), table `profiles` (§12), verrou anti-élévation de privilège,
-- `audit_log` (§12, §17). RLS activée sur toutes les tables (§17).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Rôles (§7.1 du CDC). Seul `artist` est attribuable via le formulaire public
-- d'inscription (§10.1, self-service) — tous les autres rôles sont attribués
-- côté back-office (invitation d'équipe §7.2, création manuelle du premier
-- super_admin, voir docs/adr/0007-auth-architecture.md).
-- ------------------------------------------------------------------------------
create type public.user_role as enum (
  'super_admin',   -- Axel — tous les droits, configuration plateforme
  'accounting',    -- Virements, royalties, retraits, exports financiers
  'support',       -- Tickets, demandes booking/featuring/consulting
  'ar_manager',    -- A&R / Manager artistique (Diadème) — artistes signés
  'marketing',     -- Contenus, campagnes, pré-saves (Abigail)
  'manager',       -- Compte client, forfait Label — pilote plusieurs artistes
  'artist',        -- Un seul profil, gère ses sorties/stats/retraits (défaut)
  'team_member',   -- Invité sur un projet artiste, droits limités (§7.2)
  'organizer'      -- Compte léger pour réserver via Booking (§10.5)
);

-- ------------------------------------------------------------------------------
-- profiles — étend auth.users (1:1, même id). Créée automatiquement par le
-- trigger `handle_new_user` ci-dessous : aucune policy d'INSERT pour les
-- rôles `anon`/`authenticated`, la ligne n'existe que via ce trigger
-- (SECURITY DEFINER) ou le client `service_role` (défense en profondeur, §17).
-- ------------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'artist',
  full_name text,
  avatar_url text,
  country text check (country ~ '^[A-Z]{2}$'),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  locale text not null default 'fr' check (locale in ('fr', 'en', 'ln')),
  notify_email boolean not null default true,
  notify_whatsapp boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Profil applicatif 1:1 avec auth.users. Créé uniquement par le trigger handle_new_user (voir plus bas) ou par le client service_role — jamais directement par le client (§17).';
comment on column public.profiles.country is 'Code pays ISO 3166-1 alpha-2 (ex. CD, MA) — utilisé pour la devise auto (§11.2).';
comment on column public.profiles.currency is 'Code devise ISO 4217 (ex. USD, EUR, CDF).';

alter table public.profiles enable row level security;

create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------------------
-- Fonctions helper de rôle — SECURITY DEFINER pour éviter la récursion RLS
-- (une policy sur `profiles` qui interrogerait `profiles` directement se
-- bloquerait elle-même). Utilisées par les policies ici et par les futures
-- migrations (back-office, §11.10).
-- ------------------------------------------------------------------------------
create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('super_admin', 'accounting', 'support', 'ar_manager', 'marketing')
  );
$$;

comment on function public.is_staff() is
  'Vrai si l''utilisateur courant a un rôle interne Sterkte Records (§7.1). Sert de base à toutes les policies back-office.';

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'super_admin'
  );
$$;

comment on function public.is_super_admin() is
  'Vrai si l''utilisateur courant est super_admin (Axel). Seul rôle autorisé à modifier le rôle d''un autre profil.';

-- ------------------------------------------------------------------------------
-- Policies profiles
-- ------------------------------------------------------------------------------
create policy "profiles_select_own_or_staff"
  on public.profiles for select
  using (auth.uid() = id or public.is_staff());

create policy "profiles_update_own_or_super_admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_super_admin())
  with check (auth.uid() = id or public.is_super_admin());

-- Pas de policy INSERT/DELETE pour anon/authenticated : la ligne est créée
-- par `handle_new_user` (trigger SECURITY DEFINER) et supprimée en cascade
-- quand `auth.users` est supprimé par le client service_role (suppression de
-- compte RGPD, voir Server Action `deleteAccount`).

grant select, update on public.profiles to authenticated;

-- ------------------------------------------------------------------------------
-- Verrou anti-élévation de privilège : seul un super_admin (ou le
-- service_role, qui contourne RLS ET ce trigger) peut changer `role`.
-- Un utilisateur qui modifie son propre profil (nom, langue, devise...) ne
-- peut pas s'auto-promouvoir `super_admin` via l'API.
-- ------------------------------------------------------------------------------
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.role() <> 'service_role'
     and not public.is_super_admin() then
    raise exception 'Seul un super_admin peut modifier le rôle d''un profil.';
  end if;
  return new;
end;
$$;

create trigger protect_profile_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- ------------------------------------------------------------------------------
-- Trigger de création automatique du profil à l'inscription (§10.1).
-- `full_name`/`locale` proviennent des `options.data` passées à
-- `supabase.auth.signUp()` (voir Server Action `signUp`) — `locale` reprend
-- la langue de la page d'inscription au moment de l'action.
-- ------------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, locale)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(new.raw_user_meta_data ->> 'locale', 'fr')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------------------
-- audit_log (§12, §17) — traçabilité des actions sensibles. Écrite
-- exclusivement par le client service_role (Server Actions serveur uniquement,
-- voir src/lib/supabase/admin.ts) : aucune policy INSERT/UPDATE/DELETE pour
-- anon/authenticated, et aucun GRANT correspondant (défense en profondeur).
-- Lecture réservée au personnel interne (back-office, §11.10).
-- ------------------------------------------------------------------------------
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  diff jsonb,
  created_at timestamptz not null default now()
);

comment on table public.audit_log is
  'Journal des actions sensibles (§17). Écrit uniquement via le client service_role côté serveur — jamais depuis le client.';

alter table public.audit_log enable row level security;

create policy "audit_log_select_staff"
  on public.audit_log for select
  using (public.is_staff());

grant select on public.audit_log to authenticated;
