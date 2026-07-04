"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { CheckCircle2Icon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { submitRelease } from "../actions";

interface StepSubmitProps {
  releaseId: string;
  onBack: () => void;
}

export function StepSubmit({ releaseId, onBack }: StepSubmitProps) {
  const t = useTranslations("DistributionApp.submitStep");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
        {error ? (
          <p role="alert" className="text-destructive text-small">
            {error}
          </p>
        ) : null}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack} disabled={submitting}>
            {t("back")}
          </Button>
          <Button
            type="button"
            loading={submitting}
            loadingText={t("submitting")}
            onClick={handleSubmit}
          >
            {t("submitButton")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
