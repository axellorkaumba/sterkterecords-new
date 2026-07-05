-- ==============================================================================
-- Sterkte Records Distributor — Sprint 6 : Abonnement & Paiements (§5, §11.2,
-- §11.5 partiel, §13.2)
--
-- Décision validée par Axel (voir docs/adr/0010-abonnement-paiements.md) :
-- moteur de tarification générique et piloté par configuration — plans,
-- prix par période/devise/région, fonctionnalités par plan, add-ons, coupons
-- — "aucune valeur codée en dur", pour permettre plus tard (back-office,
-- hors périmètre de ce sprint) de créer des plans/tarifs/promotions sans
-- toucher au code. Le lancement ne propose qu'un plan SOLO + un tarif
-- régional Afrique + un plan LABEL sur devis, mais le schéma supporte déjà
-- plusieurs plans, devises, régions, remises, essais et options.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- plans — catalogue des offres. `self_service = false` (LABEL) = pas de
-- checkout, orienté vers une prise de contact commerciale (§7, non
-- self-service dans le CDC).
-- ------------------------------------------------------------------------------
create table public.plans (
  id text primary key,
  self_service boolean not null default true,
  trial_days integer not null default 0,
  active boolean not null default true,
  sort_order integer not null default 0
);

comment on table public.plans is
  'Catalogue des offres d''abonnement (§5). Libellés/description marketing en i18n (namespace SubscriptionPage), pas ici — cette table pilote la structure commerciale, pas le texte éditorial.';

alter table public.plans enable row level security;

create policy "plans_select_active"
  on public.plans for select
  using (active);

grant select on public.plans to authenticated, anon;

insert into public.plans (id, self_service, trial_days, active, sort_order) values
  ('solo', true, 0, true, 10),
  ('label', false, 0, true, 20)
on conflict (id) do nothing;

-- ------------------------------------------------------------------------------
-- pricing_regions / pricing_region_countries — regroupement de pays pour un
-- tarif régional (§5.2 "Tarif régional Afrique"), configurable sans
-- modification de code : ajouter un pays éligible = une ligne insérée.
-- ------------------------------------------------------------------------------
create table public.pricing_regions (
  id text primary key,
  sort_order integer not null default 0
);

comment on table public.pricing_regions is
  'Regroupements de pays pour la tarification régionale (§5.2). "international" = tarif par défaut, "africa" = tarif régional Afrique au lancement — d''autres régions pourront être ajoutées sans changement de code.';

alter table public.pricing_regions enable row level security;

create policy "pricing_regions_select_all"
  on public.pricing_regions for select
  using (true);

grant select on public.pricing_regions to authenticated, anon;

insert into public.pricing_regions (id, sort_order) values
  ('international', 10),
  ('africa', 20)
on conflict (id) do nothing;

create table public.pricing_region_countries (
  region_id text not null references public.pricing_regions (id) on delete cascade,
  country_code char(2) not null references public.countries (code) on delete cascade,
  primary key (region_id, country_code)
);

alter table public.pricing_region_countries enable row level security;

create policy "pricing_region_countries_select_all"
  on public.pricing_region_countries for select
  using (true);

grant select on public.pricing_region_countries to authenticated, anon;

-- Pays éligibles au tarif régional Afrique au lancement — même liste que les
-- pays africains de `countries` (Sprint 3). Ajouter/retirer un pays éligible
-- plus tard : une ligne dans cette table, jamais une modification de code.
insert into public.pricing_region_countries (region_id, country_code)
select 'africa', code from public.countries
where code in (
  'CD','CG','CM','CI','SN','GA','BJ','TG','BF','ML','GN','GQ',
  'RW','BI','AO','KE','TZ','UG','ZA','MA','TN','DZ','EG','MU'
)
on conflict do nothing;

-- ------------------------------------------------------------------------------
-- plan_prices — prix par plan × région × période × devise. Table de config :
-- un nouveau tarif (nouvelle devise, nouvelle période régionale...) est une
-- ligne insérée, jamais une modification de code (voir pricing.ts).
-- ------------------------------------------------------------------------------
create type public.billing_period as enum ('monthly', 'annual');

create table public.plan_prices (
  id uuid primary key default gen_random_uuid(),
  plan_id text not null references public.plans (id) on delete cascade,
  region_id text not null references public.pricing_regions (id) on delete cascade,
  period public.billing_period not null,
  currency_code char(3) not null references public.currencies (code),
  amount numeric(10, 2) not null,
  active boolean not null default true,
  unique (plan_id, region_id, period)
);

alter table public.plan_prices enable row level security;

create policy "plan_prices_select_active"
  on public.plan_prices for select
  using (active);

grant select on public.plan_prices to authenticated, anon;

-- Tarifs exacts du §5.2 : SOLO mensuel/annuel en EUR (référence
-- internationale), tarif régional Afrique annuel en USD. Pas de tarif
-- mensuel régional : le CDC ne donne qu'un point de prix annuel pour
-- l'Afrique — mieux vaut ne rien inventer que fabriquer un chiffre non
-- validé (voir docs/adr/0010). Ajouter un mensuel régional plus tard = une
-- ligne insérée ici.
insert into public.plan_prices (plan_id, region_id, period, currency_code, amount) values
  ('solo', 'international', 'monthly', 'EUR', 2.49),
  ('solo', 'international', 'annual', 'EUR', 19.99),
  ('solo', 'africa', 'annual', 'USD', 9.99)
on conflict (plan_id, region_id, period) do nothing;

-- ------------------------------------------------------------------------------
-- plan_features — fonctionnalités activables/désactivables par plan (§7),
-- prépare une différenciation multi-plans future sans changement de code.
-- Non consommée pour bloquer une fonctionnalité au lancement (un seul plan
-- self-service) — sert de socle pour le jour où plusieurs plans coexistent.
-- ------------------------------------------------------------------------------
create table public.plan_features (
  plan_id text not null references public.plans (id) on delete cascade,
  feature_key text not null,
  enabled boolean not null default true,
  primary key (plan_id, feature_key)
);

alter table public.plan_features enable row level security;

create policy "plan_features_select_all"
  on public.plan_features for select
  using (true);

grant select on public.plan_features to authenticated, anon;

insert into public.plan_features (plan_id, feature_key, enabled) values
  ('solo', 'unlimited_releases', true),
  ('solo', 'all_dsps', true),
  ('solo', 'monthly_stats', true)
on conflict (plan_id, feature_key) do nothing;

-- ------------------------------------------------------------------------------
-- addons / addon_prices — catalogue générique d'options payantes à la
-- commande (§5.3 "Artwork Apple Music +10 €" au lancement ; expedited
-- release, Content ID... plus tard sans changement de schéma).
-- ------------------------------------------------------------------------------
create table public.addons (
  id text primary key,
  billing text not null default 'one_time' check (billing in ('one_time', 'recurring')),
  active boolean not null default true,
  sort_order integer not null default 0
);

alter table public.addons enable row level security;

create policy "addons_select_active"
  on public.addons for select
  using (active);

grant select on public.addons to authenticated, anon;

insert into public.addons (id, billing, active, sort_order) values
  ('apple_music_artwork', 'one_time', true, 10)
on conflict (id) do nothing;

create table public.addon_prices (
  id uuid primary key default gen_random_uuid(),
  addon_id text not null references public.addons (id) on delete cascade,
  region_id text not null references public.pricing_regions (id) on delete cascade,
  currency_code char(3) not null references public.currencies (code),
  amount numeric(10, 2) not null,
  active boolean not null default true,
  unique (addon_id, region_id, currency_code)
);

alter table public.addon_prices enable row level security;

create policy "addon_prices_select_active"
  on public.addon_prices for select
  using (active);

grant select on public.addon_prices to authenticated, anon;

insert into public.addon_prices (addon_id, region_id, currency_code, amount) values
  ('apple_music_artwork', 'international', 'EUR', 10.00),
  ('apple_music_artwork', 'africa', 'USD', 10.00)
on conflict (addon_id, region_id, currency_code) do nothing;

-- ------------------------------------------------------------------------------
-- coupons — remises/promotions (§ demandé par Axel : "architecture prête
-- pour... des remises... des promotions, des coupons"). Table volontairement
-- non lisible par `authenticated`/`anon` (données commerciales sensibles) :
-- validée uniquement via `validate_coupon`, SECURITY DEFINER, qui ne renvoie
-- que le nécessaire. Aucune ligne au lancement (pas de promotion active) —
-- créées plus tard par le back-office (hors périmètre de ce sprint).
-- ------------------------------------------------------------------------------
create type public.discount_type as enum ('percent', 'fixed');

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type public.discount_type not null,
  discount_value numeric(10, 2) not null,
  plan_id text references public.plans (id) on delete cascade,
  max_redemptions integer,
  redemptions_count integer not null default 0,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  active boolean not null default true
);

comment on column public.coupons.plan_id is
  'NULL = coupon applicable à tous les plans. Non NULL = restreint à un plan précis.';

alter table public.coupons enable row level security;
-- Aucune policy select/insert/update pour authenticated/anon : accès exclusif
-- via `validate_coupon` (SECURITY DEFINER) ou le client admin (service_role).

create or replace function public.validate_coupon(coupon_code text, target_plan_id text)
returns table (discount_type public.discount_type, discount_value numeric)
language sql
security definer
set search_path = public
stable
as $$
  select c.discount_type, c.discount_value
  from public.coupons c
  where c.code = coupon_code
    and c.active
    and c.valid_from <= now()
    and (c.valid_until is null or c.valid_until > now())
    and (c.max_redemptions is null or c.redemptions_count < c.max_redemptions)
    and (c.plan_id is null or c.plan_id = target_plan_id);
$$;

comment on function public.validate_coupon(text, text) is
  'Valide un code coupon pour un plan donné sans exposer la table `coupons`. Renvoie 0 ligne si invalide/expiré/épuisé.';

grant execute on function public.validate_coupon(text, text) to authenticated;

create or replace function public.increment_coupon_redemption(coupon_code text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.coupons set redemptions_count = redemptions_count + 1 where code = coupon_code;
$$;

comment on function public.increment_coupon_redemption(text) is
  'Incrémente le compteur de rédemptions après un paiement réussi (appelé depuis les webhooks PSP, service_role).';

-- ------------------------------------------------------------------------------
-- countries.default_payment_provider — rail de paiement par défaut par pays
-- (§11.5 : "Stripe indisponible en RDC... PSP par défaut pour la RDC est
-- Flutterwave"). Config, pas de code : changer le rail d'un pays = un UPDATE.
-- ------------------------------------------------------------------------------
create type public.payment_provider as enum ('stripe', 'flutterwave');

alter table public.countries
  add column default_payment_provider public.payment_provider not null default 'stripe';

update public.countries set default_payment_provider = 'flutterwave'
where code in (
  'CD','CG','CM','CI','SN','GA','BJ','TG','BF','ML','GN','GQ',
  'RW','BI','AO','KE','TZ','UG','ZA','MA','TN','DZ','EG','MU'
);

-- ------------------------------------------------------------------------------
-- subscriptions (§12, §5) — un abonnement actif par utilisateur au MVP.
-- Écriture réservée au service_role (webhooks PSP) : jamais modifiée
-- directement par le client, même le champ `status` (même principe que
-- `wallet`, Sprint 4).
-- ------------------------------------------------------------------------------
create type public.subscription_status as enum ('incomplete', 'active', 'past_due', 'canceled');

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id text not null references public.plans (id),
  period public.billing_period not null,
  status public.subscription_status not null default 'incomplete',
  provider public.payment_provider not null,
  external_id text,
  coupon_id uuid references public.coupons (id),
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create trigger set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (user_id = auth.uid());

grant select on public.subscriptions to authenticated;

-- ------------------------------------------------------------------------------
-- payments (§12) — historique des paiements (abonnement initial/renouvellement,
-- add-ons). Écriture réservée au service_role (webhooks), lecture propriétaire.
-- ------------------------------------------------------------------------------
create type public.payment_type as enum ('subscription', 'addon');
create type public.payment_status as enum ('pending', 'succeeded', 'failed', 'refunded');

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.payment_type not null,
  provider public.payment_provider not null,
  amount numeric(10, 2) not null,
  currency char(3) not null references public.currencies (code),
  status public.payment_status not null default 'pending',
  external_id text,
  release_id uuid references public.releases (id),
  addon_id text references public.addons (id),
  coupon_id uuid references public.coupons (id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on column public.payments.release_id is 'Renseigné uniquement pour type=addon (Apple Music Artwork §5.3).';

alter table public.payments enable row level security;

create policy "payments_select_own"
  on public.payments for select
  using (user_id = auth.uid());

grant select on public.payments to authenticated;
