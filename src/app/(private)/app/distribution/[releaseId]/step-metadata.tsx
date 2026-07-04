"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { updateReleaseMetadata, updateTrackMetadata } from "../actions";
import { releaseMetadataSchema, trackMetadataSchema } from "../schemas";
import type { TunnelReleaseData, TunnelTrack } from "./types";

const formSchema = z.object({
  release: releaseMetadataSchema,
  tracks: z.array(trackMetadataSchema),
});
type FormValues = z.infer<typeof formSchema>;

interface StepMetadataProps {
  release: TunnelReleaseData;
  tracks: TunnelTrack[];
  onReleaseChange: (release: TunnelReleaseData) => void;
  onTracksChange: (tracks: TunnelTrack[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepMetadata({
  release,
  tracks,
  onReleaseChange,
  onTracksChange,
  onBack,
  onNext,
}: StepMetadataProps) {
  const t = useTranslations("DistributionApp.metadataStep");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      release: {
        title: release.title,
        genre: release.genre,
        subGenre: release.subGenre,
        language: release.language,
        explicit: release.explicit,
        recordingDate: release.recordingDate,
        copyrightP: release.copyrightP,
        copyrightC: release.copyrightC,
      },
      tracks: tracks.map((track) => ({
        title: track.title,
        version: track.version,
        isrc: track.isrc,
        explicit: track.explicit,
      })),
    },
  });

  const { fields } = useFieldArray({ control: form.control, name: "tracks" });

  async function onSubmit(values: FormValues) {
    await updateReleaseMetadata(release.id, values.release);
    onReleaseChange({ ...release, ...values.release, subGenre: values.release.subGenre ?? "" });

    await Promise.all(
      tracks.map((track, index) =>
        updateTrackMetadata(release.id, track.id, values.tracks[index]!),
      ),
    );
    onTracksChange(
      tracks.map((track, index) => ({
        ...track,
        title: values.tracks[index]!.title,
        version: values.tracks[index]!.version ?? "",
        isrc: values.tracks[index]!.isrc ?? "",
        explicit: values.tracks[index]!.explicit,
      })),
    );

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="release.title"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>{t("releaseTitleLabel")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="release.genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("genreLabel")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="release.subGenre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("subGenreLabel")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="release.language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("languageLabel")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="release.recordingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("recordingDateLabel")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="release.copyrightP"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("copyrightPLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`(P) ${new Date().getFullYear()} Sterkte Records`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="release.copyrightC"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("copyrightCLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`(C) ${new Date().getFullYear()} Sterkte Records`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="release.explicit"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2.5 pt-6">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">{t("explicitLabel")}</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col gap-4">
                <p className="text-small font-medium">{t("trackTitle", { position: index + 1 })}</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`tracks.${index}.title`}
                    render={({ field: trackField }) => (
                      <FormItem>
                        <FormLabel>{t("trackTitleLabel")}</FormLabel>
                        <FormControl>
                          <Input {...trackField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`tracks.${index}.version`}
                    render={({ field: trackField }) => (
                      <FormItem>
                        <FormLabel>{t("trackVersionLabel")}</FormLabel>
                        <FormControl>
                          <Input {...trackField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`tracks.${index}.isrc`}
                    render={({ field: trackField }) => (
                      <FormItem>
                        <FormLabel>{t("trackIsrcLabel")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("trackIsrcHint")} {...trackField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`tracks.${index}.explicit`}
                    render={({ field: trackField }) => (
                      <FormItem>
                        <div className="flex items-center gap-2.5 pt-6">
                          <FormControl>
                            <Checkbox
                              checked={trackField.value}
                              onCheckedChange={(checked) => trackField.onChange(checked === true)}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{t("trackExplicitLabel")}</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                {index < fields.length - 1 ? <Separator /> : null}
              </div>
            ))}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onBack}>
                {t("back")}
              </Button>
              <Button type="submit" loading={form.formState.isSubmitting} loadingText={t("saving")}>
                {t("next")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
