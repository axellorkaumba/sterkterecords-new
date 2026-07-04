"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Disc3Icon, DiscAlbumIcon, MusicIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createDraftRelease } from "../actions";
import type { ReleaseTypeValue } from "../schemas";

const TYPE_OPTIONS: Array<{ value: ReleaseTypeValue; icon: typeof MusicIcon }> = [
  { value: "single", icon: MusicIcon },
  { value: "ep", icon: Disc3Icon },
  { value: "album", icon: DiscAlbumIcon },
];

export function TypeSelector() {
  const t = useTranslations("DistributionApp.typeStep");
  const [selected, setSelected] = useState<ReleaseTypeValue | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleContinue() {
    if (!selected) return;
    startTransition(() => {
      createDraftRelease(selected);
    });
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4 sm:p-8">
      <div>
        <p className="text-caption text-primary font-medium tracking-wide uppercase">{t("tag")}</p>
        <h1 className="text-h2 font-display">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {TYPE_OPTIONS.map((option) => (
          <Card
            key={option.value}
            role="button"
            tabIndex={0}
            onClick={() => setSelected(option.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelected(option.value);
              }
            }}
            className={cn(
              "cursor-pointer transition-colors",
              selected === option.value ? "ring-primary ring-2" : "hover:bg-muted/50",
            )}
          >
            <CardHeader>
              <option.icon className="text-primary size-6" aria-hidden="true" />
              <CardTitle>{t(`${option.value}.title`)}</CardTitle>
              <CardDescription>{t(`${option.value}.description`)}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Button className="w-fit" disabled={!selected} loading={isPending} onClick={handleContinue}>
        {t("continue")}
      </Button>
    </div>
  );
}
