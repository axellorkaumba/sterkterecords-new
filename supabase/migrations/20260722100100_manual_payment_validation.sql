-- ==============================================================================
-- Sterkte Records Distributor — Validation manuelle des paiements (§10.1, §5)
-- Voir docs/adr/0026-validation-manuelle-paiements.md pour le détail de la
-- décision et sa justification (déviation du CDC §10.1 "paiement avant accès").
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- admin_users — comptes nommés de l'équipe de validation, INDÉPENDANTS de
-- Supabase Auth/`profiles` (demande explicite d'Axel : identifiants propres,
-- pas de connexion via le même système que les artistes/staff back-office).
-- RLS activée sans aucune policy authenticated/anon : accès exclusif via le
-- client service_role depuis les Server Actions de `/validations` (même
-- principe que `coupons`, données sensibles jamais exposées au client).
-- Comptes créés via `scripts/create-admin-user.mjs` (hash bcrypt généré
-- localement, jamais en clair dans une migration).
-- ------------------------------------------------------------------------------
create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  display_name text not null,
  password_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

comment on table public.admin_users is
  'Comptes individuels nommés pour le dashboard de validation des paiements (/validations) — auth séparée de Supabase, jamais lue/écrite par un client authentifié.';

alter table public.admin_users enable row level security;

-- ------------------------------------------------------------------------------
-- plans — ajout du forfait Pro (intermédiaire Solo/Label) et du plafond
-- d'artistes par forfait (§ demande d'Axel : "pas plus de 5 artistes" pour
-- Label). Label devient self-service (preuve manuelle ou checkout automatisé)
-- au lieu de "sur devis" — voir ADR 0026, point 2.
-- ------------------------------------------------------------------------------
alter table public.plans add column max_artists integer;

comment on column public.plans.max_artists is
  'Nombre maximum d''artistes que peut créer un compte sur ce forfait. NULL = illimité. Vérifié applicativement (createArtistProfile), pas par contrainte SQL — cohérent avec le reste du moteur de tarification (config, pas de logique métier en base).';

update public.plans set max_artists = 1 where id = 'solo';
update public.plans set self_service = true, max_artists = 5 where id = 'label';

insert into public.plans (id, self_service, trial_days, active, sort_order, max_artists) values
  ('pro', true, 0, true, 15, 1)
on conflict (id) do nothing;

-- ------------------------------------------------------------------------------
-- plan_prices — tarifs Pro/Label (§5). Dérivés de la recherche concurrentielle
-- validée par Axel (DistroKid/TuneCore/Ditto/Amuse, 2026) : positionnement
-- "mid-market" sous ces références, tout en restant rentable via des rails de
-- paiement moins coûteux (mobile money/PayPal) que les cartes.
--
-- Devise internationale = EUR (cohérent avec `solo`, déjà en EUR). Tarif
-- régional Afrique en USD, dérivé proportionnellement du ratio déjà établi
-- pour `solo` (9,99 $ / 19,99 € annuel international ≈ 50%) plutôt que
-- d'inventer un nouveau point de prix non validé (voir ADR 0010) : 34,99 × 50%
-- ≈ 17,49 $ (Pro), 59,99 × 50% ≈ 29,99 $ (Label). Pas de tarif mensuel
-- régional, même limite que `solo` (aucun point de prix mensuel Afrique validé).
-- ------------------------------------------------------------------------------
insert into public.plan_prices (plan_id, region_id, period, currency_code, amount) values
  ('pro', 'international', 'monthly', 'EUR', 4.49),
  ('pro', 'international', 'annual', 'EUR', 34.99),
  ('pro', 'africa', 'annual', 'USD', 17.49),
  ('label', 'international', 'monthly', 'EUR', 7.49),
  ('label', 'international', 'annual', 'EUR', 59.99),
  ('label', 'africa', 'annual', 'USD', 29.99)
on conflict (plan_id, region_id, period) do nothing;

insert into public.plan_features (plan_id, feature_key, enabled) values
  ('pro', 'unlimited_releases', true),
  ('pro', 'all_dsps', true),
  ('pro', 'monthly_stats', true),
  ('label', 'unlimited_releases', true),
  ('label', 'all_dsps', true),
  ('label', 'monthly_stats', true),
  ('label', 'multi_artist', true)
on conflict (plan_id, feature_key) do nothing;

-- ------------------------------------------------------------------------------
-- payment_proofs — preuve de paiement manuelle (mobile money/PayPal, capture
-- uploadée par l'artiste) en attente de validation par l'équipe interne
-- (`admin_users`). Approuvée → crée `subscriptions` + `payments` (voir Server
-- Action `approvePaymentProof`). `ocr_text`/`ocr_amount` sont un indice
-- best-effort (Tesseract.js, §"si tu as un système de vérification
-- automatique") : jamais utilisés pour auto-valider, uniquement affichés à
-- l'équipe pour accélérer la relecture manuelle.
-- ------------------------------------------------------------------------------
create type public.payment_proof_status as enum ('pending', 'approved', 'rejected');

create table public.payment_proofs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id text not null references public.plans (id),
  period public.billing_period not null,
  region_id text not null references public.pricing_regions (id),
  amount numeric(10, 2) not null,
  currency_code char(3) not null references public.currencies (code),
  payment_method text not null check (payment_method in ('airtel_money', 'orange_money', 'paypal_manual')),
  screenshot_r2_key text not null,
  ocr_text text,
  ocr_amount numeric(10, 2),
  status public.payment_proof_status not null default 'pending',
  rejection_reason text,
  reviewed_by uuid references public.admin_users (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.payment_proofs is
  'File de validation des paiements manuels (§10.1, ADR 0026). Écriture des colonnes de revue (status/reviewed_by/reviewed_at/rejection_reason) réservée au client service_role — admin_users n''est pas un utilisateur Supabase authentifié.';

alter table public.payment_proofs enable row level security;

create policy "payment_proofs_select_own"
  on public.payment_proofs for select
  using (user_id = auth.uid());

create policy "payment_proofs_insert_own"
  on public.payment_proofs for insert
  with check (user_id = auth.uid() and status = 'pending');

grant select, insert on public.payment_proofs to authenticated;
