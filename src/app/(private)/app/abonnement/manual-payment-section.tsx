"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/ui/file-uploader";
import { useResumableUpload } from "@/hooks/use-resumable-upload";
import { MANUAL_PAYMENT_METHODS, type ManualPaymentMethodId } from "@/lib/payments/manual-contacts";
import { cn } from "@/lib/utils";
import { submitPaymentProof } from "./actions";
import type { BillingPeriod } from "@/lib/payments";

interface ManualPaymentSectionProps {
  planId: "solo" | "pro" | "label";
  period: BillingPeriod;
  onSubmitted: () => void;
}

export function ManualPaymentSection({ planId, period, onSubmitted }: ManualPaymentSectionProps) {
  const t = useTranslations("SubscriptionPage.manualPayment");
  const { state: uploadState, upload } = useResumableUpload("payment_proof");
  const [method, setMethod] = useState<ManualPaymentMethodId>("airtel_money");
  const [screenshotKey, setScreenshotKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleFileSelected(files: File[]) {
    const file = files[0];
    if (!file) return;
    setError(null);
    setScreenshotKey(null);
    const result = await upload(file);
    if (result) setScreenshotKey(result.r2Key);
  }

  function handleSubmit() {
    if (!screenshotKey) {
      setError(t("screenshotRequired"));
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await submitPaymentProof({
        planId,
        period,
        paymentMethod: method,
        screenshotR2Key: screenshotKey,
      });
      if (result?.error) {
        setError(t("submitError"));
        return;
      }
      onSubmitted();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h4 font-display">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {MANUAL_PAYMENT_METHODS.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => setMethod(contact.id)}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                method === contact.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50",
              )}
            >
              <p className="text-small font-medium">{contact.label}</p>
              <p className="text-caption text-muted-foreground">{contact.contact}</p>
              <p className="text-caption text-muted-foreground">{contact.accountName}</p>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setMethod("paypal_manual")}
            className={cn(
              "rounded-lg border p-3 text-left transition-colors",
              method === "paypal_manual"
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/50",
            )}
          >
            <p className="text-small font-medium">{t("paypalLabel")}</p>
            <p className="text-caption text-muted-foreground">{t("paypalHint")}</p>
          </button>
        </div>

        <FileUploader
          accept="image/jpeg,image/png,image/webp"
          onFilesSelected={handleFileSelected}
          dropzoneLabel={t("dropzoneLabel")}
          dropzoneHint={t("dropzoneHint")}
          removeFileLabel={(fileName) => t("removeFile", { fileName })}
          defaultErrorMessage={t("submitError")}
        />

        {uploadState.status === "hashing" || uploadState.status === "uploading" ? (
          <p className="text-caption text-muted-foreground">{t("uploading")}</p>
        ) : screenshotKey ? (
          <p className="text-caption text-success">{t("uploaded")}</p>
        ) : null}

        {error ? (
          <p role="alert" className="text-destructive text-small">
            {error}
          </p>
        ) : null}

        <Button
          type="button"
          className="w-fit"
          disabled={!screenshotKey}
          loading={isPending}
          onClick={handleSubmit}
        >
          {t("submitCta")}
        </Button>
      </CardContent>
    </Card>
  );
}
