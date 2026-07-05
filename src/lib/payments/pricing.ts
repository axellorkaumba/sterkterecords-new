import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { BillingPeriod, PaymentProviderId } from "./types";

type Client = SupabaseClient<Database>;
type PlanPriceRow = Database["public"]["Tables"]["plan_prices"]["Row"];

export const DEFAULT_REGION_ID = "international";

/**
 * Région tarifaire d'un pays (§5.2 "tarif régional"), pilotée par la table
 * de config `pricing_region_countries` — jamais de liste de pays en dur ici.
 * Repli sur la région internationale si le pays est absent/inconnu.
 */
export async function resolveRegionForCountry(
  supabase: Client,
  countryCode: string | null,
): Promise<string> {
  if (!countryCode) return DEFAULT_REGION_ID;

  const { data } = await supabase
    .from("pricing_region_countries")
    .select("region_id")
    .eq("country_code", countryCode)
    .maybeSingle();

  return data?.region_id ?? DEFAULT_REGION_ID;
}

/** Rail de paiement par défaut d'un pays (§11.5), piloté par `countries.default_payment_provider`. */
export async function resolveProviderForCountry(
  supabase: Client,
  countryCode: string | null,
): Promise<PaymentProviderId> {
  if (!countryCode) return "stripe";

  const { data } = await supabase
    .from("countries")
    .select("default_payment_provider")
    .eq("code", countryCode)
    .maybeSingle();

  return data?.default_payment_provider ?? "stripe";
}

/** Tous les tarifs disponibles pour un plan dans une région (alimente le sélecteur mensuel/annuel). */
export async function listPlanPrices(
  supabase: Client,
  planId: string,
  regionId: string,
): Promise<PlanPriceRow[]> {
  const { data } = await supabase
    .from("plan_prices")
    .select("*")
    .eq("plan_id", planId)
    .eq("region_id", regionId)
    .eq("active", true);

  return data ?? [];
}

export async function getPlanPrice(
  supabase: Client,
  planId: string,
  regionId: string,
  period: BillingPeriod,
): Promise<PlanPriceRow | null> {
  const { data } = await supabase
    .from("plan_prices")
    .select("*")
    .eq("plan_id", planId)
    .eq("region_id", regionId)
    .eq("period", period)
    .eq("active", true)
    .maybeSingle();

  return data ?? null;
}

export async function getAddonPrice(
  supabase: Client,
  addonId: string,
  regionId: string,
): Promise<{ currency: string; amount: number } | null> {
  const { data } = await supabase
    .from("addon_prices")
    .select("currency_code, amount")
    .eq("addon_id", addonId)
    .eq("region_id", regionId)
    .eq("active", true)
    .maybeSingle();

  if (!data) return null;
  return { currency: data.currency_code, amount: data.amount };
}

export interface AppliedCoupon {
  discountType: Database["public"]["Enums"]["discount_type"];
  discountValue: number;
}

/** Valide un coupon via la fonction SECURITY DEFINER — ne lit jamais la table `coupons` directement (§ commercial sensible). */
export async function validateCoupon(
  supabase: Client,
  code: string,
  planId: string,
): Promise<AppliedCoupon | null> {
  const { data } = await supabase.rpc("validate_coupon", {
    coupon_code: code,
    target_plan_id: planId,
  });

  const row = data?.[0];
  if (!row) return null;
  return { discountType: row.discount_type, discountValue: row.discount_value };
}

/** Applique une remise à un montant, jamais en dessous de 0. */
export function applyDiscount(amount: number, coupon: AppliedCoupon | null): number {
  if (!coupon) return amount;
  const discounted =
    coupon.discountType === "percent"
      ? amount * (1 - coupon.discountValue / 100)
      : amount - coupon.discountValue;
  return Math.max(0, Math.round(discounted * 100) / 100);
}
