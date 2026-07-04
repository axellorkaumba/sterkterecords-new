-- ==============================================================================
-- Sterkte Records Distributor — Sprint 3 (amendement validé par Axel) :
-- pays/devises en table de configuration plutôt qu'en dur dans le code
-- (§11.2 — "devise auto/pays"). Ajouter un marché ou une devise devient une
-- ligne insérée ici, jamais une modification de code (voir
-- docs/adr/0007-auth-architecture.md).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- currencies — ISO 4217. Liste métier validée par Axel : les devises
-- effectivement utilisées dans les règlements Sterkte Records (Afrique
-- francophone/anglophone, Maghreb, Europe, Amérique du Nord).
-- ------------------------------------------------------------------------------
create table public.currencies (
  code char(3) primary key,
  active boolean not null default true,
  sort_order integer not null default 0
);

comment on table public.currencies is
  'Devises disponibles dans l''UI (Paramètres > Langue & devise, §11.2). Libellés dérivés à l''affichage via Intl.DisplayNames (pas de colonne "name" — évite de maintenir des traductions ici).';

alter table public.currencies enable row level security;

create policy "currencies_select_active"
  on public.currencies for select
  using (active);

grant select on public.currencies to authenticated, anon;

insert into public.currencies (code, sort_order) values
  ('USD', 10),
  ('EUR', 20),
  ('CDF', 30),
  ('XAF', 40),
  ('XOF', 50),
  ('GBP', 60),
  ('CAD', 70),
  ('MAD', 80),
  ('ZAR', 90),
  ('KES', 100),
  ('TZS', 110)
on conflict (code) do nothing;

-- ------------------------------------------------------------------------------
-- countries — ISO 3166-1 alpha-2. Marchés où Sterkte Records est susceptible
-- d'opérer dès les premières années (Afrique francophone/anglophone + RDC,
-- Maghreb, principaux marchés de streaming européens, Amérique du Nord) —
-- liste métier validée par Axel, pas la liste ISO complète (~195 pays).
-- `default_currency` alimente la résolution "devise auto" (§11.2) : pour les
-- pays dont la devise nationale n'est pas dans `currencies` (ex. GNF, RWF,
-- TND...), repli pragmatique sur USD/EUR (réévaluable en ajoutant la devise
-- native à `currencies` puis en réassignant `default_currency` — jamais de
-- changement de code).
-- ------------------------------------------------------------------------------
create table public.countries (
  code char(2) primary key,
  default_currency char(3) not null references public.currencies (code),
  active boolean not null default true,
  sort_order integer not null default 0
);

comment on table public.countries is
  'Pays disponibles dans l''UI (Paramètres > Profil, §11.2). Libellés dérivés à l''affichage via Intl.DisplayNames.';

alter table public.countries enable row level security;

create policy "countries_select_active"
  on public.countries for select
  using (active);

grant select on public.countries to authenticated, anon;

insert into public.countries (code, default_currency, sort_order) values
  -- Afrique
  ('CD', 'CDF', 10),  -- RD Congo
  ('CG', 'XAF', 20),  -- Congo-Brazzaville
  ('CM', 'XAF', 30),  -- Cameroun
  ('CI', 'XOF', 40),  -- Côte d'Ivoire
  ('SN', 'XOF', 50),  -- Sénégal
  ('GA', 'XAF', 60),  -- Gabon
  ('BJ', 'XOF', 70),  -- Bénin
  ('TG', 'XOF', 80),  -- Togo
  ('BF', 'XOF', 90),  -- Burkina Faso
  ('ML', 'XOF', 100), -- Mali
  ('GN', 'USD', 110), -- Guinée (franc guinéen absent de la liste — repli USD)
  ('GQ', 'XAF', 120), -- Guinée Équatoriale
  ('RW', 'USD', 130), -- Rwanda (franc rwandais absent — repli USD)
  ('BI', 'USD', 140), -- Burundi (franc burundais absent — repli USD)
  ('AO', 'USD', 150), -- Angola (kwanza absent — repli USD)
  ('KE', 'KES', 160), -- Kenya
  ('TZ', 'TZS', 170), -- Tanzanie
  ('UG', 'USD', 180), -- Ouganda (shilling ougandais absent — repli USD)
  ('ZA', 'ZAR', 190), -- Afrique du Sud
  ('MA', 'MAD', 200), -- Maroc
  ('TN', 'USD', 210), -- Tunisie (dinar tunisien absent — repli USD)
  ('DZ', 'USD', 220), -- Algérie (dinar algérien absent — repli USD)
  ('EG', 'USD', 230), -- Égypte (livre égyptienne absente — repli USD)
  ('MU', 'USD', 240), -- Maurice (roupie mauricienne absente — repli USD)
  -- Europe
  ('FR', 'EUR', 300),
  ('BE', 'EUR', 310),
  ('CH', 'EUR', 320), -- Suisse (franc suisse absent de la liste — repli EUR)
  ('LU', 'EUR', 330),
  ('DE', 'EUR', 340),
  ('GB', 'GBP', 350),
  ('NL', 'EUR', 360),
  ('ES', 'EUR', 370),
  ('IT', 'EUR', 380),
  ('PT', 'EUR', 390),
  -- Amérique du Nord
  ('CA', 'CAD', 400),
  ('US', 'USD', 410)
on conflict (code) do nothing;

-- ------------------------------------------------------------------------------
-- profiles.country / profiles.currency — remplace les CHECK par des FK vers
-- les tables de configuration ci-dessus (référence unique, pas de valeur
-- orpheline possible).
-- ------------------------------------------------------------------------------
alter table public.profiles
  drop constraint if exists profiles_country_check;

alter table public.profiles
  drop constraint if exists profiles_currency_check;

alter table public.profiles
  add constraint profiles_country_fkey foreign key (country) references public.countries (code);

alter table public.profiles
  alter column currency drop default;

alter table public.profiles
  add constraint profiles_currency_fkey foreign key (currency) references public.currencies (code);

alter table public.profiles
  alter column currency set default 'USD';
