"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ValidationReportView } from "@/components/validation/validation-report-view";
import { METADATA_RULES } from "@/lib/validation/metadata/rules";
import { runValidation, type ValidationReport } from "@/lib/validation/types";
import type { CatalogFingerprint, DspInfo, TunnelReleaseData, TunnelTrack } from "./types";

interface StepSummaryProps {
  release: TunnelReleaseData;
  tracks: TunnelTrack[];
  platforms: string[];
  availableDsps: DspInfo[];
  catalogFingerprint: CatalogFingerprint;
  onBack: () => void;
  onNext: () => void;
}

export function StepSummary({
  release,
  tracks,
  platforms,
  availableDsps,
  catalogFingerprint,
  onBack,
  onNext,
}: StepSummaryProps) {
  const t = useTranslations("DistributionApp.summaryStep");
  const [report, setReport] = useState<ValidationReport | null>(null);

  useEffect(() => {
    let cancelled = false;
    runValidation(METADATA_RULES, {
      release: {
        title: release.title,
        genre: release.genre,
        language: release.language,
        explicit: release.explicit,
        releaseDate: release.releaseDate || null,
        recordingDate: release.recordingDate || null,
      },
      upc: release.upc,
      tracks: tracks.map((track) => ({
        title: track.title,
        isrc: track.isrc || null,
        explicit: track.explicit,
        contributors: track.contributors.map((c) => ({
          role: c.role,
          name: c.name,
          splitPct: c.splitPct,
        })),
      })),
      existingIsrcs: catalogFingerprint.isrcs,
      existingUpcs: catalogFingerprint.upcs,
      existingTitles: catalogFingerprint.titles,
    }).then((result) => {
      if (!cancelled) setReport(result);
    });
    return () => {
      cancelled = true;
    };
  }, [release, tracks, catalogFingerprint]);

  const platformNames = platforms
    .map((id) => availableDsps.find((dsp) => dsp.id === id)?.name ?? id)
    .join(", ");

  const canSubmit = !report || report.status !== "error";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div>
          <p className="text-small text-muted-foreground font-medium">{t("releaseSection")}</p>
          <p className="text-body">{release.title}</p>
          <p className="text-caption text-muted-foreground">
            {release.genre} · {release.language} · {release.releaseDate}
          </p>
        </div>

        <Separator />

        <div>
          <p className="text-small text-muted-foreground font-medium">{t("tracksSection")}</p>
          <ul className="flex flex-col gap-1">
            {tracks.map((track) => (
              <li key={track.id} className="text-body">
                {track.position}. {track.title}
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        <div>
          <p className="text-small text-muted-foreground font-medium">{t("platformsSection")}</p>
          <p className="text-body">{platformNames}</p>
        </div>

        <Separator />

        <div>
          <p className="text-small text-muted-foreground font-medium">{t("priceTitle")}</p>
          <div className="flex justify-between">
            <span className="text-body">{t("basePlan")}</span>
            <span className="text-body">—</span>
          </div>
          {release.appleArtworkAddon ? (
            <div className="flex justify-between">
              <span className="text-body">{t("appleAddon")}</span>
              <span className="text-body">$10</span>
            </div>
          ) : null}
          <div className="flex justify-between font-medium">
            <span className="text-body">{t("total")}</span>
            <span className="text-body">{release.appleArtworkAddon ? "$10" : "$0"}</span>
          </div>
        </div>

        <Separator />

        <div>
          <p className="text-small mb-2 font-medium">{t("validationTitle")}</p>
          {report ? <ValidationReportView report={report} emptyLabel={t("validationOk")} /> : null}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            {t("back")}
          </Button>
          <Button type="button" disabled={!canSubmit} onClick={onNext}>
            {t("next")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
