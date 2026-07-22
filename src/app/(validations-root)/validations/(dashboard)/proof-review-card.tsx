"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { approvePaymentProof, rejectPaymentProof, type PendingPaymentProof } from "./actions";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  airtel_money: "Airtel Money",
  orange_money: "Orange Money",
  paypal_manual: "PayPal (preuve manuelle)",
};

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(amount);
}

export function ProofReviewCard({ proof }: { proof: PendingPaymentProof }) {
  const [isPending, startTransition] = useTransition();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approvePaymentProof(proof.id);
      if (result?.error) {
        setError("Impossible d'approuver cette preuve. Réessaie.");
        return;
      }
      setResolved(true);
    });
  }

  function handleReject() {
    if (!reason.trim()) {
      setError("Indique un motif de refus.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await rejectPaymentProof(proof.id, reason);
      if (result?.error) {
        setError("Impossible de refuser cette preuve. Réessaie.");
        return;
      }
      setResolved(true);
    });
  }

  if (resolved) return null;

  const amountMismatch = proof.ocrAmount != null && Math.abs(proof.ocrAmount - proof.amount) > 0.5;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-h4 font-display">
              {proof.userFullName || proof.userEmail || "Compte inconnu"}
            </CardTitle>
            <CardDescription>{proof.userEmail}</CardDescription>
          </div>
          <span className="text-small text-muted-foreground">
            {new Date(proof.createdAt).toLocaleString("fr-FR")}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row">
        <a
          href={proof.screenshotUrl}
          target="_blank"
          rel="noreferrer"
          className="border-border block shrink-0 overflow-hidden rounded-lg border sm:w-48"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- capture privée servie via URL présignée R2, next/image inutile ici */}
          <img
            src={proof.screenshotUrl}
            alt="Capture du paiement"
            className="h-auto w-full object-contain"
          />
        </a>

        <div className="flex flex-1 flex-col gap-3">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <dt className="text-muted-foreground">Forfait</dt>
            <dd className="font-medium capitalize">
              {proof.planId} — {proof.period === "monthly" ? "mensuel" : "annuel"}
            </dd>
            <dt className="text-muted-foreground">Montant déclaré</dt>
            <dd className="font-medium">{formatAmount(proof.amount, proof.currencyCode)}</dd>
            <dt className="text-muted-foreground">Moyen de paiement</dt>
            <dd className="font-medium">
              {PAYMENT_METHOD_LABELS[proof.paymentMethod] ?? proof.paymentMethod}
            </dd>
          </dl>

          {proof.ocrText ? (
            <div
              className={
                amountMismatch
                  ? "border-warning/40 bg-warning/10 rounded-lg border p-3 text-xs"
                  : "border-border bg-muted/50 rounded-lg border p-3 text-xs"
              }
            >
              <p className="mb-1 font-medium">
                Texte détecté automatiquement (indice, à vérifier — jamais une validation) :
              </p>
              {proof.ocrAmount != null ? (
                <p>
                  Montant détecté : {proof.ocrAmount}
                  {amountMismatch ? " — ne correspond pas au montant déclaré" : ""}
                </p>
              ) : null}
              <p className="text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                {proof.ocrText}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">
              Aucun texte détecté automatiquement — vérifie la capture manuellement.
            </p>
          )}

          {error ? (
            <p role="alert" className="text-destructive text-small">
              {error}
            </p>
          ) : null}

          {showRejectForm ? (
            <div className="flex flex-col gap-2">
              <Textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Motif du refus (visible par l'artiste)"
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRejectForm(false)}
                  disabled={isPending}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  loading={isPending}
                  onClick={handleReject}
                >
                  Confirmer le refus
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button type="button" loading={isPending} onClick={handleApprove}>
                Approuver
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setShowRejectForm(true)}
              >
                Refuser
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
