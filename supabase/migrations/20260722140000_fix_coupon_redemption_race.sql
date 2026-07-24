-- ==============================================================================
-- Sterkte Records Distributor — Correctif audit : rachat de coupon au-delà
-- de max_redemptions (voir la revue ligne-par-ligne demandée par Axel).
-- ==============================================================================

-- `increment_coupon_redemption` faisait un `redemptions_count = redemptions_count + 1`
-- inconditionnel — `validate_coupon` vérifie bien `redemptions_count < max_redemptions`
-- au moment du checkout, mais l'incrément réel n'a lieu que plus tard, dans
-- le webhook, une fois le paiement confirmé. Entre les deux, aucune réservation :
-- si `max_redemptions` a par exemple une place restante, deux paiements
-- concurrents peuvent tous les deux passer `validate_coupon` avant qu'aucun
-- des deux `increment_coupon_redemption` n'ait tourné, dépassant le plafond.
-- Rendu conditionnel/atomique : la ligne `coupons` étant verrouillée par
-- l'UPDATE lui-même, deux appels concurrents se sérialisent — le second
-- réévalue la clause WHERE contre la valeur déjà incrémentée par le premier.
-- Le compteur ne peut donc plus jamais dépasser `max_redemptions`, même sous
-- forte concurrence (la fenêtre entre `validate_coupon` et le paiement réel
-- reste, par nature d'un paiement asynchrone, mais le compteur reste borné).
create or replace function public.increment_coupon_redemption(coupon_code text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.coupons
  set redemptions_count = redemptions_count + 1
  where code = coupon_code
    and (max_redemptions is null or redemptions_count < max_redemptions);
$$;
