"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PlayIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUploader } from "@/components/ui/file-uploader";
import { ValidationReportView } from "@/components/validation/validation-report-view";
import { useResumableUpload } from "@/hooks/use-resumable-upload";
import { buildArtworkValidationContext } from "@/lib/validation/artwork/context";
import { ARTWORK_RULES } from "@/lib/validation/artwork/rules";
import { runValidation, type ValidationReport } from "@/lib/validation/types";
import { updateReleaseArtwork } from "../actions";
import type { TunnelReleaseData } from "./types";

const SELF_DECLARATION_KEYS = ["noText", "noLogo", "noUrl", "noQrCode"] as const;

interface StepArtworkProps {
  releaseId: string;
  release: TunnelReleaseData;
  onReleaseChange: (release: TunnelReleaseData) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepArtwork({
  releaseId,
  release,
  onReleaseChange,
  onBack,
  onNext,
}: StepArtworkProps) {
  const t = useTranslations("DistributionApp.artworkStep");
  const tValidation = useTranslations("Validation");
  const { state: uploadState, upload } = useResumableUpload("artwork");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationReport | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [appleAddon, setAppleAddon] = useState(release.appleArtworkAddon);
  const [declarations, setDeclarations] = useState<
    Record<(typeof SELF_DECLARATION_KEYS)[number], boolean>
  >({ noText: false, noLogo: false, noUrl: false, noQrCode: false });
  const [artworkKey, setArtworkKey] = useState<string | null>(release.artworkKey);
  const [saving, setSaving] = useState(false);

  async function handleFileSelected(files: File[]) {
    const file = files[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setIsProcessing(true);

    const context = await buildArtworkValidationContext(file);
    const report = await runValidation(ARTWORK_RULES, context);
    setValidation(report);
    setIsProcessing(false);

    if (report.status === "error") return;

    const result = await upload(file);
    if (result) {
      setArtworkKey(result.r2Key);
    }
  }

  async function handleNext() {
    setSaving(true);
    await updateReleaseArtwork(releaseId, artworkKey ?? "", appleAddon);
    onReleaseChange({ ...release, artworkKey, appleArtworkAddon: appleAddon });
    setSaving(false);
    onNext();
  }

  const allDeclared = SELF_DECLARATION_KEYS.every((key) => declarations[key]);
  const canContinue = !!artworkKey && (!validation || validation.status !== "error") && allDeclared;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 flex-col gap-3">
            {/* Pas de prop `files` : l'aperçu personnalisé ci-contre remplace la
                liste de fichiers du composant — `removeFileLabel`/`defaultErrorMessage`
                ne sont donc jamais rendus, mais restent requis par le type. */}
            <FileUploader
              accept="image/jpeg,image/png"
              onFilesSelected={handleFileSelected}
              dropzoneLabel={t("dropzoneLabel")}
              dropzoneHint={t("dropzoneHint")}
              removeFileLabel={() => t("dropzoneLabel")}
              defaultErrorMessage={t("dropzoneHint")}
            />
            {isProcessing ||
            uploadState.status === "uploading" ||
            uploadState.status === "hashing" ? (
              <Progress value={uploadState.status === "uploading" ? uploadState.progress : null} />
            ) : null}
            {validation ? (
              <ValidationReportView report={validation} emptyLabel={tValidation("status.ok")} />
            ) : null}
          </div>

          {previewUrl ? (
            <div className="flex shrink-0 flex-col items-center gap-2">
              <p className="text-caption text-muted-foreground">{t("previewLabel")}</p>
              <div className="relative size-40 overflow-hidden rounded-xl shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob URL), next/image inutile ici */}
                <img src={previewUrl} alt="" className="size-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-black/50 px-2 py-1">
                  <PlayIcon className="size-3 fill-white text-white" aria-hidden="true" />
                  <div className="h-1 flex-1 rounded-full bg-white/30">
                    <div className="h-1 w-1/3 rounded-full bg-white" />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="border-border flex items-start gap-2.5 rounded-lg border p-3">
          <Checkbox
            checked={appleAddon}
            onCheckedChange={(checked) => setAppleAddon(checked === true)}
          />
          <div>
            <p className="text-small font-medium">{t("appleAddonLabel")}</p>
            <p className="text-caption text-muted-foreground">{t("appleAddonDescription")}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-small font-medium">{t("selfDeclarationTitle")}</p>
          {SELF_DECLARATION_KEYS.map((key) => (
            <div key={key} className="flex items-center gap-2.5">
              <Checkbox
                checked={declarations[key]}
                onCheckedChange={(checked) =>
                  setDeclarations((current) => ({ ...current, [key]: checked === true }))
                }
              />
              <p className="text-small">{t(`selfDeclaration.${key}`)}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            {t("back")}
          </Button>
          <Button type="button" disabled={!canContinue} loading={saving} onClick={handleNext}>
            {t("next")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
