"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toggleArtistPlan } from "../actions";
import type { Database } from "@/types/database.types";

type ArtistPlan = Database["public"]["Enums"]["artist_plan"];

export function PlanToggleButton({
  artistId,
  currentPlan,
}: {
  artistId: string;
  currentPlan: ArtistPlan;
}) {
  const t = useTranslations("Admin.artists");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const targetPlan: ArtistPlan = currentPlan === "label" ? "solo" : "label";

  function handleConfirm() {
    startTransition(async () => {
      const result = await toggleArtistPlan(artistId, targetPlan);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        {t(`switchTo.${targetPlan}`)}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(`switchDialog.${targetPlan}.title`)}</DialogTitle>
          <DialogDescription>{t(`switchDialog.${targetPlan}.description`)}</DialogDescription>
        </DialogHeader>
        {error && <p className="text-destructive text-small">{t("switchError")}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("switchDialog.cancel")}
          </Button>
          <Button loading={pending} onClick={handleConfirm}>
            {t("switchDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
