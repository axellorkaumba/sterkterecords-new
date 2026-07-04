-- ==============================================================================
-- Sterkte Records Distributor — Migration de base
-- Sprint 0 : extensions Postgres + fonctions utilitaires réutilisées par
-- toutes les migrations métier à venir (Auth §11.2, Distribution §11.4,
-- Royalties §11.5, etc.). Aucune table métier ici : c'est de la config pure.
-- ==============================================================================

-- uuid-ossp : génération d'UUID côté SQL (uuid_generate_v4) — pratique pour
-- des defaults de colonnes, en complément de gen_random_uuid() (pgcrypto).
create extension if not exists "uuid-ossp" with schema extensions;

-- pgcrypto : gen_random_uuid(), hachage — utilisé comme default sur les
-- colonnes `id uuid primary key default gen_random_uuid()` de tout le schéma.
create extension if not exists "pgcrypto" with schema extensions;

-- pg_trgm : recherche floue/similarité, prépare la recherche Postgres FTS
-- `[MVP]` du §16 avant une éventuelle migration vers Meilisearch en `[V2]`.
create extension if not exists "pg_trgm" with schema extensions;

-- ------------------------------------------------------------------------------
-- Fonction utilitaire : maintien automatique de `updated_at`.
-- Chaque table métier avec une colonne `updated_at timestamptz` doit déclarer :
--
--   create trigger set_updated_at
--     before update on public.ma_table
--     for each row execute function public.set_updated_at();
--
-- ------------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Met à jour automatiquement la colonne updated_at avant chaque UPDATE. À attacher via un trigger BEFORE UPDATE sur chaque table métier.';
