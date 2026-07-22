-- ==============================================================================
-- Sterkte Records Distributor — Validation manuelle des paiements (§10.1, §5)
--
-- Décision validée par Axel (voir docs/adr/0026-validation-manuelle-paiements.md) :
-- accès immédiat à `/app/distribution` dès l'inscription (renverse la règle
-- "paiement avant accès" du §10.1 initial), validation du compte a posteriori
-- par une équipe interne via un dashboard dédié, hors Supabase Auth (identifiants
-- propres, comptes nommés) — le paiement se fait par preuve manuelle (mobile
-- money/PayPal, capture uploadée) en plus du checkout automatisé existant.
--
-- `ALTER TYPE ... ADD VALUE` ne peut pas être utilisé dans la même transaction
-- que l'utilisation de cette nouvelle valeur (restriction Postgres, déjà
-- rencontrée pour PayPal — voir 20260713200000) : les 3 valeurs ajoutées ici
-- (nouveau forfait Pro, rail de paiement manuel, nouveau type d'upload) sont
-- donc isolées dans cette migration, consommées uniquement dans la suivante.
-- ==============================================================================

alter type public.artist_plan add value if not exists 'pro';
alter type public.payment_provider add value if not exists 'manual';
alter type public.upload_kind add value if not exists 'payment_proof';
