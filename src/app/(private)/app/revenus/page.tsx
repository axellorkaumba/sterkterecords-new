import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { WalletIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RequestWithdrawalForm } from "./request-withdrawal-form";

export async function generateMetadata() {
  const t = await getTranslations("Revenue");
  return { title: t("title") };
}

const STATUS_BADGE_VARIANT = {
  pending: "warning",
  paid: "success",
  rejected: "destructive",
} as const;

/**
 * Solde/retraits (§11.5, module Royalties). `wallet.balance_available`/
 * `balance_pending` sont recalculés automatiquement par trigger
 * (`recompute_wallet`, migration 20260722160000) à partir de
 * `stats_monthly.revenue` et des retraits — cette page ne fait que lire,
 * jamais écrire dans `wallet` directement.
 */
export default async function RevenuePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const t = await getTranslations("Revenue");

  const [{ data: wallet }, { data: payoutMethod }, { data: withdrawals }] = await Promise.all([
    supabase
      .from("wallet")
      .select("balance_available, balance_pending, currency")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("payout_methods").select("method").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("withdrawals")
      .select("id, amount, currency, status, requested_at")
      .eq("user_id", user.id)
      .order("requested_at", { ascending: false }),
  ]);

  const currency = wallet?.currency ?? "USD";
  const formatter = new Intl.NumberFormat(undefined, { style: "currency", currency });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-8">
      <div>
        <h1 className="text-h2 font-display">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-small text-muted-foreground font-medium">
              {t("availableLabel")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-h2 tabular-nums">
              {formatter.format(wallet?.balance_available ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-small text-muted-foreground font-medium">
              {t("pendingLabel")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-h2 tabular-nums">
              {formatter.format(wallet?.balance_pending ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("requestTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {!payoutMethod ? (
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-small">{t("noPayoutMethod")}</p>
              <Button
                className="w-fit"
                size="sm"
                render={<Link href="/app/parametres" />}
                nativeButton={false}
              >
                {t("setPayoutMethodCta")}
              </Button>
            </div>
          ) : (
            <RequestWithdrawalForm
              availableBalance={wallet?.balance_available ?? 0}
              currency={currency}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("historyTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {!withdrawals || withdrawals.length === 0 ? (
            <EmptyState icon={WalletIcon} title={t("historyEmpty")} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columns.date")}</TableHead>
                  <TableHead>{t("columns.amount")}</TableHead>
                  <TableHead>{t("columns.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>{new Date(withdrawal.requested_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: withdrawal.currency,
                      }).format(withdrawal.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE_VARIANT[withdrawal.status]}>
                        {t(`status.${withdrawal.status}`)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
