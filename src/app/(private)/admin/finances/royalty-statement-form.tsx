"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { recordRoyaltyStatement } from "../actions";

interface ArtistOption {
  id: string;
  name: string;
}
interface DspOption {
  id: string;
  name: string;
}

/**
 * Saisie manuelle d'un relevé DSP (§11.5) — en attendant une vraie
 * ingestion automatisée LabelGrid. `period` est un `<input type="month">`
 * reconstitué en date "premier du mois" (`stats_monthly.period`, voir sa
 * convention documentée dans la migration 20260704160000).
 */
export function RoyaltyStatementForm({
  artists,
  dsps,
}: {
  artists: ArtistOption[];
  dsps: DspOption[];
}) {
  const t = useTranslations("Admin.finances.statementForm");
  const [artistId, setArtistId] = useState(artists[0]?.id ?? "");
  const [periodMonth, setPeriodMonth] = useState("");
  const [dsp, setDsp] = useState(dsps[0]?.id ?? "");
  const [country, setCountry] = useState("");
  const [streams, setStreams] = useState("");
  const [revenue, setRevenue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    setSuccess(false);
    if (!artistId || !periodMonth || !dsp) {
      setError(t("error"));
      return;
    }
    startTransition(async () => {
      const result = await recordRoyaltyStatement({
        artistId,
        period: `${periodMonth}-01`,
        dsp,
        country: country || undefined,
        streams: Number(streams) || 0,
        revenue: Number(revenue) || 0,
      });
      if (result?.error) {
        setError(t("error"));
        return;
      }
      setSuccess(true);
      setStreams("");
      setRevenue("");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>{t("artistLabel")}</Label>
          <Select value={artistId} onValueChange={(value) => value && setArtistId(value)}>
            <SelectTrigger className="w-full">
              <SelectValue>{() => artists.find((a) => a.id === artistId)?.name ?? ""}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {artists.map((artist) => (
                <SelectItem key={artist.id} value={artist.id}>
                  {artist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>{t("dspLabel")}</Label>
          <Select value={dsp} onValueChange={(value) => value && setDsp(value)}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {() => dsps.find((option) => option.id === dsp)?.name ?? ""}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {dsps.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>{t("periodLabel")}</Label>
          <Input
            type="month"
            value={periodMonth}
            onChange={(event) => setPeriodMonth(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>{t("countryLabel")}</Label>
          <Input
            value={country}
            onChange={(event) => setCountry(event.target.value.toUpperCase())}
            placeholder="CD"
            maxLength={2}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>{t("streamsLabel")}</Label>
          <Input
            type="number"
            min="0"
            value={streams}
            onChange={(event) => setStreams(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>{t("revenueLabel")}</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={revenue}
            onChange={(event) => setRevenue(event.target.value)}
          />
        </div>
      </div>

      {error ? <p className="text-destructive text-small">{error}</p> : null}
      {success ? <p className="text-success text-small">{t("success")}</p> : null}

      <Button className="w-fit" loading={isPending} onClick={handleSubmit}>
        {t("submit")}
      </Button>
    </div>
  );
}
