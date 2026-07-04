"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { MailCheckIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { requestPasswordReset } from "../actions";
import { forgotPasswordSchema, type ForgotPasswordValues } from "../schemas";
import type { AppLocale } from "@/i18n/routing";

export function ForgotPasswordForm({ locale }: { locale: AppLocale }) {
  const t = useTranslations("Auth");
  const [serverError, setServerError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "", locale },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setServerError(null);
    const result = await requestPasswordReset(values);
    if (result?.error) {
      setServerError(t(`errors.${result.error}`));
      return;
    }
    setSentTo(values.email);
  }

  if (sentTo) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <MailCheckIcon className="text-primary size-10" aria-hidden="true" />
        <CardTitle className="text-h3 font-display">{t("forgotPassword.successTitle")}</CardTitle>
        <CardDescription>
          {t("forgotPassword.successDescription", { email: sentTo })}
        </CardDescription>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {serverError ? (
          <p role="alert" className="text-destructive text-small">
            {serverError}
          </p>
        ) : null}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("forgotPassword.emailLabel")}</FormLabel>
              <FormControl>
                <Input type="email" placeholder={t("forgotPassword.emailPlaceholder")} {...field} />
              </FormControl>
              <FormMessage>
                {form.formState.errors.email ? t("validation.emailInvalid") : undefined}
              </FormMessage>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          loading={form.formState.isSubmitting}
          loadingText={t("forgotPassword.submitting")}
        >
          {t("forgotPassword.submit")}
        </Button>
      </form>
    </Form>
  );
}
