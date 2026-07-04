"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { SearchIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { replacePlatforms } from "../actions";
import type { DspInfo } from "./types";

const CATEGORY_COLORS: Record<DspInfo["category"], string> = {
  streaming: "bg-primary/15 text-primary",
  social: "bg-gold/15 text-gold",
  video: "bg-info/15 text-info",
  afrique: "bg-success/15 text-success",
};

/**
 * Icône générique (initiale + couleur par catégorie) plutôt que les logos
 * officiels des DSP (Spotify, Apple Music...) : ces logos sont des marques
 * déposées, pas reproduites ici (voir docs/adr/0009-distribution-module.md).
 */
function DspIcon({ dsp }: { dsp: DspInfo }) {
  return (
    <span
      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${CATEGORY_COLORS[dsp.category]}`}
      aria-hidden="true"
    >
      {dsp.name.charAt(0)}
    </span>
  );
}

interface StepPlatformsProps {
  releaseId: string;
  availableDsps: DspInfo[];
  selectedDsps: string[];
  onSelectedDspsChange: (dsps: string[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepPlatforms({
  releaseId,
  availableDsps,
  selectedDsps,
  onSelectedDspsChange,
  onBack,
  onNext,
}: StepPlatformsProps) {
  const t = useTranslations("DistributionApp.platformsStep");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const filteredDsps = useMemo(
    () => availableDsps.filter((dsp) => dsp.name.toLowerCase().includes(search.toLowerCase())),
    [availableDsps, search],
  );

  const groupedByCategory = useMemo(() => {
    const groups = new Map<DspInfo["category"], DspInfo[]>();
    for (const dsp of filteredDsps) {
      const list = groups.get(dsp.category) ?? [];
      list.push(dsp);
      groups.set(dsp.category, list);
    }
    return groups;
  }, [filteredDsps]);

  function toggleDsp(dspId: string) {
    onSelectedDspsChange(
      selectedDsps.includes(dspId)
        ? selectedDsps.filter((id) => id !== dspId)
        : [...selectedDsps, dspId],
    );
  }

  async function handleNext() {
    setSaving(true);
    await replacePlatforms(releaseId, selectedDsps);
    setSaving(false);
    onNext();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon
              className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              className="pl-8"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSelectedDspsChange(availableDsps.map((dsp) => dsp.id))}
          >
            {t("selectAll")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSelectedDspsChange([])}
          >
            {t("deselectAll")}
          </Button>
        </div>

        <p className="text-caption text-muted-foreground">
          {t("selectedCount", { count: selectedDsps.length })}
        </p>

        {[...groupedByCategory.entries()].map(([category, dsps]) => (
          <div key={category} className="flex flex-col gap-2">
            <p className="text-small text-muted-foreground font-medium">
              {t(`categories.${category}`)}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {dsps.map((dsp) => (
                <label
                  key={dsp.id}
                  className="border-border hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2"
                >
                  <Checkbox
                    checked={selectedDsps.includes(dsp.id)}
                    onCheckedChange={() => toggleDsp(dsp.id)}
                  />
                  <DspIcon dsp={dsp} />
                  <span className="text-small">{dsp.name}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            {t("back")}
          </Button>
          <Button
            type="button"
            disabled={selectedDsps.length === 0}
            loading={saving}
            onClick={handleNext}
          >
            {t("next")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
