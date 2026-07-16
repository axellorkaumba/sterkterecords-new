"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowDownIcon, ArrowUpIcon, XIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUploader } from "@/components/ui/file-uploader";
import { ValidationReportView } from "@/components/validation/validation-report-view";
import { useResumableUpload } from "@/hooks/use-resumable-upload";
import { buildAudioValidationContext } from "@/lib/validation/audio/context";
import { AUDIO_RULES } from "@/lib/validation/audio/rules";
import { runValidation, type ValidationReport } from "@/lib/validation/types";
import { addTrack, removeTrack, reorderTracks } from "../actions";
import { TRACK_COUNT_RANGE } from "../schemas";
import type { CatalogFingerprint, TunnelTrack } from "./types";
import type { Database } from "@/types/database.types";
import { cn } from "@/lib/utils";

type ReleaseType = Database["public"]["Enums"]["release_type"];

interface QueueItem {
  clientId: string;
  fileName: string;
  status: "validating" | "uploading" | "done" | "error";
  validation: ValidationReport | null;
}

interface StepAudioProps {
  releaseId: string;
  releaseType: ReleaseType;
  tracks: TunnelTrack[];
  onTracksChange: (tracks: TunnelTrack[]) => void;
  catalogFingerprint: CatalogFingerprint;
  onNext: () => void;
}

export function StepAudio({
  releaseId,
  releaseType,
  tracks,
  onTracksChange,
  catalogFingerprint,
  onNext,
}: StepAudioProps) {
  const t = useTranslations("DistributionApp.audioStep");
  const tValidation = useTranslations("Validation");
  const { state: uploadState, upload } = useResumableUpload("audio");
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const range = TRACK_COUNT_RANGE[releaseType];
  const uploadingItem = queue.find((item) => item.status === "uploading");

  async function handleFilesSelected(files: File[]) {
    const sessionHashes = [...tracks.map((track) => track.audioHash)];

    for (const file of files) {
      const clientId = crypto.randomUUID();
      setQueue((current) => [
        ...current,
        { clientId, fileName: file.name, status: "validating", validation: null },
      ]);

      const context = await buildAudioValidationContext(
        file,
        sessionHashes,
        catalogFingerprint.audioHashes,
      );
      const report = await runValidation(AUDIO_RULES, context);
      setQueue((current) =>
        current.map((item) =>
          item.clientId === clientId ? { ...item, validation: report } : item,
        ),
      );

      if (report.status === "error") {
        setQueue((current) =>
          current.map((item) => (item.clientId === clientId ? { ...item, status: "error" } : item)),
        );
        continue;
      }

      setQueue((current) =>
        current.map((item) =>
          item.clientId === clientId ? { ...item, status: "uploading" } : item,
        ),
      );

      const result = await upload(file);
      if (!result) {
        setQueue((current) =>
          current.map((item) => (item.clientId === clientId ? { ...item, status: "error" } : item)),
        );
        continue;
      }

      sessionHashes.push(result.sha256Hash);

      const duration = context.decodedDurationSeconds ?? context.declaredDurationSeconds;
      const trackResult = await addTrack(releaseId, {
        audioR2Key: result.r2Key,
        fileSize: file.size,
        durationSeconds: duration,
        sampleRateHz: context.sampleRateHz,
        bitDepth: context.bitDepth,
        codec: context.format,
        loudnessLufs: null,
        audioHash: result.sha256Hash,
      });

      if (trackResult.trackId) {
        onTracksChange([
          ...tracks,
          {
            id: trackResult.trackId,
            position: tracks.length + 1,
            title: "",
            version: "",
            isrc: "",
            explicit: false,
            duration,
            audioHash: result.sha256Hash,
            contributors: [],
          },
        ]);
        setQueue((current) =>
          current.map((item) => (item.clientId === clientId ? { ...item, status: "done" } : item)),
        );
      } else {
        setQueue((current) =>
          current.map((item) => (item.clientId === clientId ? { ...item, status: "error" } : item)),
        );
      }
    }
  }

  async function handleRemove(trackId: string) {
    await removeTrack(releaseId, trackId);
    onTracksChange(tracks.filter((track) => track.id !== trackId));
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= tracks.length) return;
    const reordered = [...tracks];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved!);
    const withPositions = reordered.map((track, i) => ({ ...track, position: i + 1 }));
    onTracksChange(withPositions);
    await reorderTracks(
      releaseId,
      withPositions.map((track) => track.id),
    );
  }

  const canContinue = tracks.length >= range.min && tracks.length <= range.max;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FileUploader
          accept="audio/wav,audio/x-wav,audio/flac,audio/mpeg,audio/mp3"
          multiple
          onFilesSelected={handleFilesSelected}
          dropzoneLabel={t("dropzoneLabel")}
          dropzoneHint={t("dropzoneHint")}
          removeFileLabel={(fileName) => t("removeFile", { fileName })}
          defaultErrorMessage={t("defaultErrorMessage")}
        />

        <p className="text-small text-muted-foreground">
          {t("trackCountHint", { count: tracks.length, min: range.min, max: range.max })}
        </p>

        {queue
          .filter((item) => item.status !== "done")
          .map((item) => (
            <div
              key={item.clientId}
              className="border-border flex flex-col gap-2 rounded-lg border p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-small truncate font-medium">{item.fileName}</span>
                <span
                  className={cn(
                    "text-caption",
                    item.status === "error" ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {item.status === "validating"
                    ? t("analyzing")
                    : item.status === "uploading"
                      ? uploadState.status === "hashing"
                        ? t("analyzing")
                        : t("uploading")
                      : item.status === "error"
                        ? t("defaultErrorMessage")
                        : null}
                </span>
              </div>
              {item.status === "uploading" && uploadingItem?.clientId === item.clientId ? (
                <Progress value={uploadState.progress} />
              ) : null}
              {item.validation ? (
                <ValidationReportView
                  report={item.validation}
                  emptyLabel={tValidation("status.ok")}
                />
              ) : null}
            </div>
          ))}

        {tracks.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {tracks.map((track, index) => (
              <li
                key={track.id}
                className="border-border bg-card flex items-center gap-3 rounded-md border px-3 py-2"
              >
                <span className="text-small text-muted-foreground w-6 shrink-0 tabular-nums">
                  {track.position}
                </span>
                <span className="text-small flex-1 truncate">
                  {track.title || track.audioHash.slice(0, 8)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("moveUp")}
                  disabled={index === 0}
                  onClick={() => handleMove(index, -1)}
                >
                  <ArrowUpIcon className="size-3.5" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("moveDown")}
                  disabled={index === tracks.length - 1}
                  onClick={() => handleMove(index, 1)}
                >
                  <ArrowDownIcon className="size-3.5" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("remove")}
                  onClick={() => handleRemove(track.id)}
                >
                  <XIcon className="size-3.5" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-col gap-2">
          {!canContinue ? (
            <p className="text-caption text-muted-foreground">
              {t("minTracksWarning", { min: range.min })}
            </p>
          ) : null}
          <Button className="w-fit" disabled={!canContinue} onClick={onNext}>
            {t("next")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
