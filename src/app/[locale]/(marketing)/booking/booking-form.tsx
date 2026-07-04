"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const ARTIST_EVENT_TYPES = ["concert", "festival", "showcase", "private", "corporate"] as const;
const VENUE_EVENT_TYPES = ["concert", "videoShoot", "private", "other"] as const;

/**
 * Formulaire de booking — présentationnel (§11.7 du CDC). La liste
 * d'artistes réservables sera branchée sur les artistes signés une fois le
 * roster disponible (voir docs/adr/0006) ; en attendant, saisie libre.
 */
export function BookingForm() {
  const t = useTranslations("Booking");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(successMessage: string) {
    return (event: React.FormEvent) => {
      event.preventDefault();
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        toast.success(successMessage);
      }, 600);
    };
  }

  return (
    <Tabs defaultValue="artist">
      <TabsList>
        <TabsTrigger value="artist">{t("tabs.artist")}</TabsTrigger>
        <TabsTrigger value="venue">{t("tabs.venue")}</TabsTrigger>
      </TabsList>

      <TabsContent value="artist" className="mt-6">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(t("artistForm.submit"))}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="booking-artist">{t("artistForm.artistLabel")}</Label>
            <Input id="booking-artist" placeholder={t("artistForm.artistPlaceholder")} required />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="booking-event-type">{t("artistForm.eventType")}</Label>
              <Select>
                <SelectTrigger id="booking-event-type" className="w-full">
                  <SelectValue placeholder={t("artistForm.eventTypePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {ARTIST_EVENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`artistForm.eventTypes.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="booking-date">{t("artistForm.date")}</Label>
              <Input id="booking-date" type="date" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="booking-budget">{t("artistForm.budget")}</Label>
              <Input id="booking-budget" placeholder={t("artistForm.budgetPlaceholder")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="booking-location">{t("artistForm.location")}</Label>
              <Input id="booking-location" placeholder={t("artistForm.locationPlaceholder")} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="booking-message">{t("artistForm.message")}</Label>
            <Textarea id="booking-message" placeholder={t("artistForm.messagePlaceholder")} />
          </div>
          <Button type="submit" size="lg" loading={submitting}>
            {t("artistForm.submit")}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="venue" className="mt-6">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(t("venueForm.submit"))}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="venue-event-type">{t("venueForm.eventType")}</Label>
            <Select>
              <SelectTrigger id="venue-event-type" className="w-full">
                <SelectValue placeholder={t("venueForm.eventTypePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {VENUE_EVENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`venueForm.eventTypes.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="venue-date">{t("venueForm.date")}</Label>
              <Input id="venue-date" type="date" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="venue-duration">{t("venueForm.duration")}</Label>
              <Input id="venue-duration" placeholder={t("venueForm.durationPlaceholder")} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="venue-message">{t("venueForm.message")}</Label>
            <Textarea id="venue-message" placeholder={t("venueForm.messagePlaceholder")} />
          </div>
          <Button type="submit" size="lg" loading={submitting}>
            {t("venueForm.submit")}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}
