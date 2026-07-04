"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PlusIcon, XIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { replaceContributors } from "../actions";
import type { ContributorRole, TunnelContributor, TunnelTrack } from "./types";

const ROLES: ContributorRole[] = [
  "main_artist",
  "featuring",
  "composer",
  "author",
  "producer",
  "mixing",
  "mastering",
];

interface StepContributorsProps {
  releaseId: string;
  tracks: TunnelTrack[];
  onTracksChange: (tracks: TunnelTrack[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepContributors({
  releaseId,
  tracks,
  onTracksChange,
  onBack,
  onNext,
}: StepContributorsProps) {
  const t = useTranslations("DistributionApp.contributorsStep");
  const [saving, setSaving] = useState(false);

  function updateTrackContributors(trackIndex: number, contributors: TunnelContributor[]) {
    const updated = [...tracks];
    updated[trackIndex] = { ...updated[trackIndex]!, contributors };
    onTracksChange(updated);
  }

  function addContributor(trackIndex: number) {
    updateTrackContributors(trackIndex, [
      ...tracks[trackIndex]!.contributors,
      { role: "main_artist", name: "", splitPct: 0 },
    ]);
  }

  function removeContributor(trackIndex: number, contributorIndex: number) {
    updateTrackContributors(
      trackIndex,
      tracks[trackIndex]!.contributors.filter((_, i) => i !== contributorIndex),
    );
  }

  function patchContributor(
    trackIndex: number,
    contributorIndex: number,
    patch: Partial<TunnelContributor>,
  ) {
    const contributors = tracks[trackIndex]!.contributors.map((contributor, i) =>
      i === contributorIndex ? { ...contributor, ...patch } : contributor,
    );
    updateTrackContributors(trackIndex, contributors);
  }

  async function handleNext() {
    setSaving(true);
    await Promise.all(
      tracks.map((track) => replaceContributors(releaseId, track.id, track.contributors)),
    );
    setSaving(false);
    onNext();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {tracks.map((track, trackIndex) => {
          const sum = track.contributors.reduce((total, c) => total + c.splitPct, 0);
          const isSumOk = Math.abs(sum - 100) <= 0.01;

          return (
            <div key={track.id} className="flex flex-col gap-3">
              <p className="text-small font-medium">
                {t("trackTitle", { position: trackIndex + 1, title: track.title || "—" })}
              </p>

              {track.contributors.map((contributor, contributorIndex) => (
                <div
                  key={contributorIndex}
                  className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_100px_auto]"
                >
                  <div className="flex flex-col gap-1">
                    <Label className="sr-only">{t("roleLabel")}</Label>
                    <Select
                      value={contributor.role}
                      onValueChange={(value) =>
                        patchContributor(trackIndex, contributorIndex, {
                          role: value as ContributorRole,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue>{(value: ContributorRole) => t(`roles.${value}`)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {t(`roles.${role}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder={t("nameLabel")}
                    value={contributor.name}
                    onChange={(event) =>
                      patchContributor(trackIndex, contributorIndex, { name: event.target.value })
                    }
                  />
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    placeholder={t("splitLabel")}
                    value={contributor.splitPct}
                    onChange={(event) =>
                      patchContributor(trackIndex, contributorIndex, {
                        splitPct: Number(event.target.value),
                      })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("removeContributor")}
                    onClick={() => removeContributor(trackIndex, contributorIndex)}
                  >
                    <XIcon className="size-3.5" aria-hidden="true" />
                  </Button>
                </div>
              ))}

              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addContributor(trackIndex)}
                >
                  <PlusIcon aria-hidden="true" />
                  {t("addContributor")}
                </Button>
                {track.contributors.length > 0 ? (
                  <p className={cn("text-caption", isSumOk ? "text-success" : "text-destructive")}>
                    {isSumOk ? t("sumOk") : t("sumError", { sum: sum.toFixed(1) })}
                  </p>
                ) : null}
              </div>

              {trackIndex < tracks.length - 1 ? <Separator /> : null}
            </div>
          );
        })}

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            {t("back")}
          </Button>
          <Button type="button" loading={saving} onClick={handleNext}>
            {t("next")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
