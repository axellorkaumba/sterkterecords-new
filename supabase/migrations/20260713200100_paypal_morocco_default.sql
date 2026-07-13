-- Bascule le Maroc sur PayPal comme rail de paiement par défaut : Stripe et
-- Flutterwave n'y permettent pas de recevoir des paiements. Voir migration
-- précédente et docs/adr/0025-paypal-payment-provider.md.
--
-- La RDC ('CD') reste volontairement sur 'flutterwave' — PayPal n'y accepte
-- que l'envoi, pas la réception ; aucun rail confirmé n'existe encore pour
-- ce marché (voir l'ADR pour les pistes explorées, ex. CinetPay, à valider).
update public.countries set default_payment_provider = 'paypal' where code = 'MA';
