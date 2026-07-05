"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2Icon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { submitRelease, createAddonCheckoutAction, hasAddonBeenPaid } from "../actions";

interface StepSubmitProps {
  releaseId: string;
  appleArtworkAddon: boolean;
  onBack: () => void;
}

export function StepSubmit({ releaseId, appleArtworkAddon, onBack }: StepSubmitProps) {
  const t = useTranslations("DistributionApp.submitStep");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [payingAddon, setPayingAddon] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [addonPaid, setAddonPaid] = useState(searchParams.get("addonPaid") === "1");

  useEffect(() => {
    if (!appleArtworkAddon || addonPaid) return;
    hasAddonBeenPaid(releaseId).then(setAddonPaid);
    // Vérifié une seule fois au montage (+ optimiste via ?addonPaid=1 au retour du checkout) —
    // pas de polling, cohérent avec le reste du produit (statuts webhook, jamais garantis instantanés).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePayAddon() {
    setPayingAddon(true);
    setError(null);
    const result = await createAddonCheckoutAction(releaseId);
    setPayingAddon(false);
    if (result?.error) {
      setError(t("addonPaymentError"));
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const result = await submitRelease(releaseId);
    setSubmitting(false);
    if (result.error) {
      setError(result.error === "incomplete" ? t("errorIncomplete") : t("error"));
      return;
    }
    setSuccess(true);
  }

  const needsAddonPayment = appleArtworkAddon && !addonPaid;

  if (success) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <CheckCircle2Icon className="text-success size-10" aria-hidden="true" />
          <CardTitle className="text-h3 font-display">{t("successTitle")}</CardTitle>
          <CardDescription>{t("successDescription")}</CardDescription>
          <Button className="mt-2" onClick={() => router.push(`/app/distribution/${releaseId}`)}>
            {t("viewRelease")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {needsAddonPayment ? (
          <p className="text-small text-muted-foreground">{t("addonPaymentRequired")}</p>
        ) : null}
        {error ? (
          <p role="alert" className="text-destructive text-small">
            {error}
          </p>
        ) : null}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={submitting || payingAddon}
          >
            {t("back")}
          </Button>
          {needsAddonPayment ? (
            <Button
              type="button"
              loading={payingAddon}
              loadingText={t("addonPaymentPending")}
              onClick={handlePayAddon}
            >
              {t("addonPaymentButton")}
            </Button>
          ) : (
            <Button
              type="button"
              loading={submitting}
              loadingText={t("submitting")}
              onClick={handleSubmit}
            >
              {t("submitButton")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
