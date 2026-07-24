"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { savePayoutMethod } from "./actions";
import { payoutMethodSchema, type PayoutMethodValues } from "./schemas";

type Method = "airtel_money" | "orange_money" | "paypal" | "bank_transfer";
const METHODS: Method[] = ["airtel_money", "orange_money", "paypal", "bank_transfer"];

interface ExistingPayoutMethod {
  method: Method;
  details: Record<string, string>;
}

/**
 * Moyen de retrait (§11.5, module Royalties) — état local simple plutôt que
 * react-hook-form : la forme des champs change avec `method` (union
 * discriminée `payoutMethodSchema`), plus direct à gérer qu'un resolver Zod
 * sur un schéma dont la forme dépend d'un autre champ.
 */
export function PayoutTab({ existing }: { existing: ExistingPayoutMethod | null }) {
  const t = useTranslations("Account.payout");
  const [method, setMethod] = useState<Method>(existing?.method ?? "airtel_money");
  const [fields, setFields] = useState<Record<string, string>>(existing?.details ?? {});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function updateField(key: string, value: string) {
    setSuccess(false);
    setFields((current) => ({ ...current, [key]: value }));
  }

  function handleMethodChange(value: string | null) {
    if (!value) return;
    setMethod(value as Method);
    setFields({});
    setSuccess(false);
  }

  function handleSubmit() {
    setError(null);
    setSuccess(false);
    const parsed = payoutMethodSchema.safeParse({ method, ...fields } as PayoutMethodValues);
    if (!parsed.success) {
      setError(t("error"));
      return;
    }
    startTransition(async () => {
      const result = await savePayoutMethod(parsed.data);
      if (result?.error) {
        setError(t("error"));
        return;
      }
      setSuccess(true);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>{t("methodLabel")}</Label>
          <Select value={method} onValueChange={handleMethodChange}>
            <SelectTrigger className="w-full">
              <SelectValue>{() => t(`methods.${method}`)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {METHODS.map((option) => (
                <SelectItem key={option} value={option}>
                  {t(`methods.${option}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {method === "airtel_money" || method === "orange_money" ? (
          <>
            <div className="flex flex-col gap-2">
              <Label>{t("phoneLabel")}</Label>
              <Input
                value={fields.phone ?? ""}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="+243…"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("holderNameLabel")}</Label>
              <Input
                value={fields.holderName ?? ""}
                onChange={(event) => updateField("holderName", event.target.value)}
              />
            </div>
          </>
        ) : null}

        {method === "paypal" ? (
          <div className="flex flex-col gap-2">
            <Label>{t("emailLabel")}</Label>
            <Input
              type="email"
              value={fields.email ?? ""}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </div>
        ) : null}

        {method === "bank_transfer" ? (
          <>
            <div className="flex flex-col gap-2">
              <Label>{t("accountHolderLabel")}</Label>
              <Input
                value={fields.accountHolder ?? ""}
                onChange={(event) => updateField("accountHolder", event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("ibanLabel")}</Label>
              <Input
                value={fields.iban ?? ""}
                onChange={(event) => updateField("iban", event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("bankNameLabel")}</Label>
              <Input
                value={fields.bankName ?? ""}
                onChange={(event) => updateField("bankName", event.target.value)}
              />
            </div>
          </>
        ) : null}

        {error ? <p className="text-destructive text-small">{error}</p> : null}
        {success ? <p className="text-success text-small">{t("saved")}</p> : null}

        <Button className="w-fit" loading={isPending} onClick={handleSubmit}>
          {t("submit")}
        </Button>
      </CardContent>
    </Card>
  );
}
