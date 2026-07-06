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
import { Textarea } from "@/components/ui/textarea";
import { approveRelease, rejectRelease } from "../actions";

interface ReviewActionsProps {
  releaseId: string;
  /** Déclenche le flash de statut + le rafraîchissement différé (cf. release-row.tsx). */
  onApproved: () => void;
  onRejected: () => void;
}

export function ReviewActions({ releaseId, onApproved, onRejected }: ReviewActionsProps) {
  const t = useTranslations("Admin.releases");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approveRelease(releaseId);
      if (result.error) {
        setError(result.error);
        return;
      }
      onApproved();
    });
  }

  function handleReject() {
    setError(null);
    startTransition(async () => {
      const result = await rejectRelease(releaseId, reason);
      if (result.error) {
        setError(result.error);
        return;
      }
      setRejectOpen(false);
      onRejected();
    });
  }

  return (
    <div className="flex gap-2">
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogTrigger render={<Button variant="outline" size="sm" />}>
          {t("rejectButton")}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rejectDialogTitle")}</DialogTitle>
            <DialogDescription>{t("rejectDialogDescription")}</DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t("reasonPlaceholder")}
            rows={4}
          />
          {error && <p className="text-destructive text-small">{t("actionError")}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              {t("rejectDialogCancel")}
            </Button>
            <Button
              variant="destructive"
              loading={pending}
              disabled={!reason.trim()}
              onClick={handleReject}
            >
              {t("rejectDialogConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button size="sm" loading={pending} onClick={handleApprove}>
        {t("approveButton")}
      </Button>
    </div>
  );
}
