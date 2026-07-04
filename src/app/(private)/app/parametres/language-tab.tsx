"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateLocaleAndCurrency } from "./actions";
import { updateLocaleCurrencySchema, type UpdateLocaleCurrencyValues } from "./schemas";
import { routing, type AppLocale } from "@/i18n/routing";
import { CURRENCY_CODES, displayLocaleFor } from "./country-currency-data";

const LOCALE_LABELS: Record<AppLocale, string> = {
  fr: "Français",
  en: "English",
  ln: "Lingala",
};

export function LanguageTab({ locale, currency }: { locale: AppLocale; currency: string }) {
  const t = useTranslations("Account.language");
  const currentLocale = useLocale();
  const currencyNames = new Intl.DisplayNames([displayLocaleFor(currentLocale)], {
    type: "currency",
  });

  const form = useForm<UpdateLocaleCurrencyValues>({
    resolver: zodResolver(updateLocaleCurrencySchema),
    defaultValues: { locale, currency },
  });

  async function onSubmit(values: UpdateLocaleCurrencyValues) {
    const result = await updateLocaleAndCurrency(values);
    if (result?.error) {
      toast.error(t("saveButton"));
      return;
    }
    toast.success(t("savedToast"));
    window.location.reload();
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
              name="locale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("localeLabel")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue>{(value: AppLocale) => LOCALE_LABELS[value]}</SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {routing.locales.map((code) => (
                        <SelectItem key={code} value={code}>
                          {LOCALE_LABELS[code]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("currencyLabel")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {(value: string) => `${currencyNames.of(value) ?? value} (${value})`}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CURRENCY_CODES.map((code) => (
                        <SelectItem key={code} value={code}>
                          {currencyNames.of(code) ?? code} ({code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
