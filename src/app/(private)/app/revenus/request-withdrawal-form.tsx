"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { requestWithdrawal } from "./actions";

const KNOWN_ERRORS = ["no_payout_method", "insufficient_balance", "invalid", "unknown"] as const;

export function RequestWithdrawalForm({
  availableBalance,
  currency,
}: {
  availableBalance: number;
  currency: string;
}) {
  const t = useTranslations("Revenue");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    setSuccess(false);
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError(t("errors.invalid"));
      return;
    }
    if (parsedAmount > availableBalance) {
      setError(t("errors.insufficient_balance"));
      return;
    }
    startTransition(async () => {
      const result = await requestWithdrawal({ amount: parsedAmount });
      if (result?.error) {
        const code = KNOWN_ERRORS.find((known) => known === result.error) ?? "unknown";
        setError(t(`errors.${code}`));
        return;
      }
      setSuccess(true);
      setAmount("");
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label>{t("amountLabel", { currency })}</Label>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0.00"
        />
      </div>
      {error ? <p className="text-destructive text-small">{error}</p> : null}
      {success ? <p className="text-success text-small">{t("requestSuccess")}</p> : null}
      <Button
        className="w-fit"
        loading={isPending}
        disabled={availableBalance <= 0}
        onClick={handleSubmit}
      >
        {t("submitRequest")}
      </Button>
    </div>
  );
}
