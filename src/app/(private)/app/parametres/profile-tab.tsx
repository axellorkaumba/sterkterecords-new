"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProfile } from "./actions";
import { updateProfileSchema, type UpdateProfileValues } from "./schemas";
import { COUNTRY_CODES, displayLocaleFor } from "./country-currency-data";

export function ProfileTab({ fullName, country }: { fullName: string; country: string | null }) {
  const t = useTranslations("Account.profile");
  const locale = useLocale();
  const regionNames = new Intl.DisplayNames([displayLocaleFor(locale)], { type: "region" });

  const form = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { fullName, country: country ?? "" },
  });

  async function onSubmit(values: UpdateProfileValues) {
    const result = await updateProfile(values);
    if (result?.error) {
      toast.error(t("saveButton"));
      return;
    }
    toast.success(t("savedToast"));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fullNameLabel")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("countryLabel")}</FormLabel>
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("countryPlaceholder")}>
                          {(value: string) => regionNames.of(value) ?? value}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COUNTRY_CODES.map((code) => (
                        <SelectItem key={code} value={code}>
                          {regionNames.of(code) ?? code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-fit"
              loading={form.formState.isSubmitting}
              loadingText={t("saving")}
            >
              {t("saveButton")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
