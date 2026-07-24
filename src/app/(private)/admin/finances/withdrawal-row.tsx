"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { markWithdrawalPaid, rejectWithdrawal, type PendingWithdrawal } from "../actions";

const PAYOUT_METHOD_LABELS: Record<string, string> = {
  airtel_money: "Airtel Money",
  orange_money: "Orange Money",
  paypal: "PayPal",
  bank_transfer: "Virement bancaire",
};

export function WithdrawalRow({ withdrawal }: { withdrawal: PendingWithdrawal }) {
  const t = useTranslations("Admin.finances");
  const [isPending, startTransition] = useTransition();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);

  function handlePay() {
    setError(null);
    startTransition(async () => {
      const result = await markWithdrawalPaid(withdrawal.id);
      if (result?.error) {
        setError(t("actionError"));
        return;
      }
      setResolved(true);
    });
  }

  function handleReject() {
    if (!reason.trim()) {
      setError(t("reasonRequired"));
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await rejectWithdrawal(withdrawal.id, reason);
      if (result?.error) {
        setError(t("actionError"));
        return;
      }
      setResolved(true);
    });
  }

  if (resolved) return null;

  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: withdrawal.currency,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-h4 font-display">
              {withdrawal.userFullName || withdrawal.userEmail || t("unknownAccount")}
            </CardTitle>
            <CardDescription>{withdrawal.userEmail}</CardDescription>
          </div>
          <span className="text-small text-muted-foreground">
            {new Date(withdrawal.requestedAt).toLocaleString()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted-foreground">{t("columns.amount")}</dt>
          <dd className="font-medium">{formatter.format(withdrawal.amount)}</dd>
          <dt className="text-muted-foreground">{t("columns.method")}</dt>
          <dd className="font-medium">
            {PAYOUT_METHOD_LABELS[withdrawal.payoutMethod] ?? withdrawal.payoutMethod}
          </dd>
        </dl>
        <div className="border-border bg-muted/50 rounded-lg border p-3 text-xs">
          {Object.entries(withdrawal.payoutDetails).map(([key, value]) => (
            <p key={key}>
              <span className="text-muted-foreground">{key} : </span>
              {value}
            </p>
          ))}
        </div>

        {error ? <p className="text-destructive text-small">{error}</p> : null}

        {showRejectForm ? (
          <div className="flex flex-col gap-2">
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={t("reasonPlaceholder")}
              rows={3}
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowRejectForm(false)}>
                {t("cancel")}
              </Button>
              <Button variant="destructive" size="sm" loading={isPending} onClick={handleReject}>
                {t("confirmReject")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowRejectForm(true)}>
              {t("rejectButton")}
            </Button>
            <Button size="sm" loading={isPending} onClick={handlePay}>
              {t("payButton")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
