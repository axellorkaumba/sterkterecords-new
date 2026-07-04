"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { requestModification, requestTakedown } from "../actions";
import type { Database } from "@/types/database.types";
import type { TunnelTrack } from "./types";

type ReleaseRow = Database["public"]["Tables"]["releases"]["Row"];

const STATUS_BADGE_VARIANT: Record<
  ReleaseRow["status"],
  "success" | "warning" | "destructive" | "outline" | "info"
> = {
  draft: "outline",
  in_review: "warning",
  delivering: "info",
  delivered: "success",
  error: "destructive",
  takedown_requested: "warning",
  removed: "outline",
};

export function ReleaseDetail({ release, tracks }: { release: ReleaseRow; tracks: TunnelTrack[] }) {
  const t = useTranslations("DistributionApp.detail");
  const tStatus = useTranslations("DistributionApp.statusLabels");
  const [modificationOpen, setModificationOpen] = useState(false);
  const [takedownOpen, setTakedownOpen] = useState(false);
  const [details, setDetails] = useState("");
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);

  const isLocked = release.status === "delivered" || release.status === "delivering";
  const canTakedown = release.status === "delivered";

  async function handleModificationSubmit() {
    setPending(true);
    await requestModification(release.id, details);
    setPending(false);
    setModificationOpen(false);
    setDetails("");
    toast.success(t("requestSent"));
  }

  async function handleTakedownConfirm() {
    setPending(true);
    await requestTakedown(release.id, reason);
    setPending(false);
    setTakedownOpen(false);
    toast.success(t("takedownRequested"));
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-8">
      <div className="flex items-center gap-3">
        <h1 className="text-h2 font-display">{release.title}</h1>
        <Badge variant={STATUS_BADGE_VARIANT[release.status]}>{tStatus(release.status)}</Badge>
      </div>

      {release.archived ? (
        <p className="text-caption text-muted-foreground">{t("archivedNote")}</p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t("tracksTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-1">
            {tracks.map((track) => (
              <li key={track.id} className="text-body flex items-center gap-2">
                <span>
                  {track.position}. {track.title}
                </span>
                {track.isrc ? (
                  <span className="text-caption text-muted-foreground font-mono">
                    {track.isrc}
                    {isLocked ? ` — ${t("lockedFieldNote")}` : ""}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Dialog open={modificationOpen} onOpenChange={setModificationOpen}>
          <DialogTrigger render={<Button variant="outline" />}>
            {t("requestModificationButton")}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("requestModificationDialogTitle")}</DialogTitle>
              <DialogDescription>{t("requestModificationDialogDescription")}</DialogDescription>
            </DialogHeader>
            <Textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder={t("detailsLabel")}
              rows={4}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setModificationOpen(false)}>
                {t("cancel")}
              </Button>
              <Button loading={pending} onClick={handleModificationSubmit}>
                {t("submitRequest")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {canTakedown ? (
          <Dialog open={takedownOpen} onOpenChange={setTakedownOpen}>
            <DialogTrigger render={<Button variant="destructive" />}>
              {t("takedownButton")}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("takedownDialogTitle")}</DialogTitle>
                <DialogDescription>{t("takedownDialogDescription")}</DialogDescription>
              </DialogHeader>
              <Input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={t("reasonLabel")}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setTakedownOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button variant="destructive" loading={pending} onClick={handleTakedownConfirm}>
                  {t("confirmTakedown")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>
    </div>
  );
}
