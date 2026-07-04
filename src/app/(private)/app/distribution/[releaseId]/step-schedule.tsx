"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { AlertTriangleIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { updateReleaseSchedule } from "../actions";
import { scheduleSchema, RECOMMENDED_MIN_LEAD_DAYS, type ScheduleValues } from "../schemas";
import type { TunnelReleaseData } from "./types";

function getTimezoneOptions(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return ["UTC", "Africa/Lubumbashi", "Africa/Casablanca", "Europe/Paris", "America/New_York"];
  }
}

interface StepScheduleProps {
  releaseId: string;
  release: TunnelReleaseData;
  onReleaseChange: (release: TunnelReleaseData) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepSchedule({
  releaseId,
  release,
  onReleaseChange,
  onBack,
  onNext,
}: StepScheduleProps) {
  const t = useTranslations("DistributionApp.scheduleStep");
  const timezones = useMemo(getTimezoneOptions, []);
  const [saving, setSaving] = useState(false);

  const form = useForm<ScheduleValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      releaseDate: release.releaseDate,
      releaseTime: release.releaseTime,
      releaseTimezone: release.releaseTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const releaseDate = form.watch("releaseDate");
  const leadDays = releaseDate
    ? Math.round((new Date(releaseDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const showShortLeadWarning = leadDays !== null && leadDays < RECOMMENDED_MIN_LEAD_DAYS;

  async function onSubmit(values: ScheduleValues) {
    setSaving(true);
    await updateReleaseSchedule(releaseId, values);
    onReleaseChange({ ...release, ...values, releaseTime: values.releaseTime ?? "" });
    setSaving(false);
    onNext();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="releaseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("dateLabel")}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showShortLeadWarning ? (
              <p className="text-warning-foreground bg-warning/10 flex items-center gap-2 rounded-md px-3 py-2 text-sm">
                <AlertTriangleIcon className="size-4 shrink-0" aria-hidden="true" />
                {t("shortLeadWarning", { days: RECOMMENDED_MIN_LEAD_DAYS })}
              </p>
            ) : null}

            <FormField
              control={form.control}
              name="releaseTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("timeLabel")}</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="releaseTimezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("timezoneLabel")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue>{(value: string) => value}</SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onBack}>
                {t("back")}
              </Button>
              <Button type="submit" loading={saving}>
                {t("next")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
