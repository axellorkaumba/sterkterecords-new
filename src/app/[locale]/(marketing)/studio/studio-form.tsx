"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const HOURLY_RATE_ON_SITE = 50;
const HOURLY_RATE_MOBILE = 75;

/**
 * Formulaire de réservation studio — présentationnel pour l'instant.
 * La persistance (Supabase, calendrier, paiement d'acompte) arrive avec le
 * module Studio (§11.6 du CDC) ; ici, seule l'estimation de prix en temps
 * réel et la soumission (toast) sont câblées.
 */
export function StudioForm() {
  const t = useTranslations("Studio.form");
  const [studioType, setStudioType] = useState<"onSite" | "mobile">("onSite");
  const [duration, setDuration] = useState("2");
  const [date, setDate] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const rate = studioType === "mobile" ? HOURLY_RATE_MOBILE : HOURLY_RATE_ON_SITE;
  const price = Number(duration) * rate;

  function handleSubmit() {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(t("submit"));
    }, 600);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="studio-type">{t("studioType")}</Label>
          <Select
            value={studioType}
            onValueChange={(value) => value && setStudioType(value as typeof studioType)}
          >
            <SelectTrigger id="studio-type" className="w-full">
              {/* Base UI ne connaît le libellé d'un SelectItem qu'une fois monté
                  (popup ouvert au moins une fois) : sans render-prop explicite,
                  SelectValue affiche la valeur brute ("onSite") au premier rendu. */}
              <SelectValue>
                {(value: string) => (value === "mobile" ? t("mobileOption") : t("onSite"))}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="onSite">{t("onSite")}</SelectItem>
              <SelectItem value="mobile">{t("mobileOption")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="studio-duration">{t("duration")}</Label>
          <Select value={duration} onValueChange={(value) => value && setDuration(value)}>
            <SelectTrigger id="studio-duration" className="w-full">
              <SelectValue>{(value: string) => `${value}h`}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 8].map((h) => (
                <SelectItem key={h} value={String(h)}>
                  {h}h
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="studio-date">{t("date")}</Label>
        <Input
          id="studio-date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>

      {studioType === "mobile" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="studio-address">{t("address")}</Label>
          <Input
            id="studio-address"
            placeholder={t("addressPlaceholder")}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
        </div>
      )}

      <div className="border-border bg-card flex items-center justify-between rounded-md border px-4 py-3">
        <span className="text-small text-muted-foreground">{t("priceEstimate")}</span>
        <span className="font-display text-h3 text-or-400">${price}</span>
      </div>

      <Button size="lg" variant="gold" onClick={handleSubmit} loading={submitting}>
        {t("submit")}
      </Button>
    </div>
  );
}
