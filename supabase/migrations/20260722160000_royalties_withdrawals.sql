-- ==============================================================================
-- Sterkte Records Distributor — Module Royalties/Retraits (§11.5, V1)
-- Explicitement différé depuis l'ADR 0008/0009 ("wallet en lecture seule,
-- alimenté par... le module Royalties, à construire"). Demande d'Axel :
-- "Activer tout et construire tout pour que l'on puisse tout tester avant
-- lancement". Construit ici : moyen de retrait par artiste, demandes de
-- retrait, et le calcul automatique du solde wallet à partir des relevés
-- DSP déjà modélisés dans stats_monthly.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- payout_methods — un seul moyen de retrait actif par compte (comme un
-- artiste n'a qu'un seul wallet). `details` en jsonb : la forme dépend de
-- `method` (numéro de téléphone pour le mobile money, email pour PayPal,
-- coordonnées bancaires pour un virement) — validé côté application (Zod),
-- pas de contrainte de forme en base pour rester extensible sans migration.
-- ------------------------------------------------------------------------------
create table public.payout_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  method text not null check (method in ('airtel_money', 'orange_money', 'paypal', 'bank_transfer')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.payout_methods is
  'Moyen de retrait choisi par l''artiste (§11.5, module Royalties) — mêmes catégories que payment_proofs.payment_method (côté paiement entrant) pour rester cohérent, plus bank_transfer.';

alter table public.payout_methods enable row level security;

create trigger set_updated_at
  before update on public.payout_methods
  for each row execute function public.set_updated_at();

create policy "payout_methods_select_own_or_staff"
  on public.payout_methods for select
  using (user_id = auth.uid() or public.is_staff());

create policy "payout_methods_insert_own"
  on public.payout_methods for insert
  with check (user_id = auth.uid());

create policy "payout_methods_update_own"
  on public.payout_methods for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update on public.payout_methods to authenticated;

-- ------------------------------------------------------------------------------
-- withdrawals — une demande de retrait. `payout_method`/`payout_details`
-- sont capturés (snapshot) au moment de la demande plutôt que relus depuis
-- `payout_methods` à l'affichage : si l'artiste change son moyen de retrait
-- après coup, une demande déjà en attente doit rester payée sur les
-- coordonnées qu'il avait au moment de la demande, pas les nouvelles.
-- ------------------------------------------------------------------------------
create type public.withdrawal_status as enum ('pending', 'paid', 'rejected');

create table public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  currency char(3) not null references public.currencies (code),
  status public.withdrawal_status not null default 'pending',
  payout_method text not null,
  payout_details jsonb not null,
  requested_at timestamptz not null default now(),
  processed_by uuid references public.profiles (id) on delete set null,
  processed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.withdrawals is
  'Demande de retrait (§11.5, module Royalties). Traitement manuel par l''équipe (virement/mobile money exécuté hors système, même modèle opérationnel que la validation des paiements entrants, ADR 0026) — marqué payé ou refusé depuis /admin/finances.';

alter table public.withdrawals enable row level security;

create trigger set_updated_at
  before update on public.withdrawals
  for each row execute function public.set_updated_at();

create policy "withdrawals_select_own_or_staff"
  on public.withdrawals for select
  using (user_id = auth.uid() or public.is_staff());

-- Le montant demandé ne peut pas dépasser le solde disponible — vérifié côté
-- application (requestWithdrawal), pas en RLS déclarative : la RLS ne peut
-- pas relire wallet.balance_available (une autre table) dans un `with check`
-- de façon fiable sous concurrence, même limite que la validation de coupon
-- (voir ADR 0031 §5) — mieux vaut un contrôle explicite en Server Action.
create policy "withdrawals_insert_own"
  on public.withdrawals for insert
  with check (user_id = auth.uid() and status = 'pending');

create policy "withdrawals_update_staff"
  on public.withdrawals for update
  using (public.is_staff())
  with check (public.is_staff());

grant select, insert, update on public.withdrawals to authenticated;

-- ------------------------------------------------------------------------------
-- Calcul automatique du solde wallet — solde disponible = revenus reportés
-- (stats_monthly.revenue, tous artistes possédés) moins ce qui a déjà été
-- retiré (payé) ou est réservé par une demande en attente. `balance_pending`
-- reprend le sens déjà utilisé par le dashboard ("En attente", RevenueCard) :
-- le montant que l'artiste a demandé mais qui n'a pas encore été payé.
--
-- Recalcule à la volée via des triggers plutôt qu'un job planifié : tant que
-- le module Royalties n'a pas de vraie ingestion automatisée LabelGrid (hors
-- périmètre, voir /admin/finances — saisie manuelle de relevés en
-- attendant), toute écriture dans stats_monthly (même manuelle) doit
-- immédiatement se refléter dans le solde affiché à l'artiste.
-- ------------------------------------------------------------------------------
create or replace function public.recompute_wallet(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total_earned numeric(12, 2);
  v_pending numeric(12, 2);
  v_paid numeric(12, 2);
begin
  select coalesce(sum(sm.revenue), 0) into v_total_earned
  from public.stats_monthly sm
  join public.artists a on a.id = sm.artist_id
  where a.owner_id = target_user_id;

  select coalesce(sum(amount), 0) into v_pending
  from public.withdrawals
  where user_id = target_user_id and status = 'pending';

  select coalesce(sum(amount), 0) into v_paid
  from public.withdrawals
  where user_id = target_user_id and status = 'paid';

  update public.wallet
  set balance_available = greatest(v_total_earned - v_pending - v_paid, 0),
      balance_pending = v_pending,
      updated_at = now()
  where user_id = target_user_id;
end;
$$;

comment on function public.recompute_wallet(uuid) is
  'Recalcule wallet.balance_available/balance_pending pour un compte — appelée par les triggers ci-dessous, jamais directement par le client.';

create or replace function public.trigger_recompute_wallet_from_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
begin
  select owner_id into v_owner_id
  from public.artists
  where id = coalesce(new.artist_id, old.artist_id);

  if v_owner_id is not null then
    perform public.recompute_wallet(v_owner_id);
  end if;

  return coalesce(new, old);
end;
$$;

create trigger recompute_wallet_on_stats
  after insert or update or delete on public.stats_monthly
  for each row execute function public.trigger_recompute_wallet_from_stats();

create or replace function public.trigger_recompute_wallet_from_withdrawal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.recompute_wallet(coalesce(new.user_id, old.user_id));
  return coalesce(new, old);
end;
$$;

create trigger recompute_wallet_on_withdrawal
  after insert or update or delete on public.withdrawals
  for each row execute function public.trigger_recompute_wallet_from_withdrawal();
