"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { unstable_rethrow } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { resendVerificationEmail } from "../actions";
import { resendSchema, type ResendValues } from "../schemas";
import type { AppLocale } from "@/i18n/routing";

export function ResendForm({ locale }: { locale: AppLocale }) {
  const t = useTranslations("Auth");
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<ResendValues>({
    resolver: zodResolver(resendSchema),
    defaultValues: { email: "", locale },
  });

  async function onSubmit(values: ResendValues) {
    setServerError(null);
    setSuccess(false);
    try {
      const result = await resendVerificationEmail(values);
      if (result?.error) {
        setServerError(t(`errors.${result.error}`));
        return;
      }
      setSuccess(true);
    } catch (err) {
      unstable_rethrow(err);
      setServerError(t("errors.unknown"));
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <p className="text-small text-muted-foreground">{t("verifyEmail.resendLabel")}</p>

        {serverError ? (
          <p role="alert" className="text-destructive text-small">
            {serverError}
          </p>
        ) : null}
        {success ? (
          <p className="text-small text-primary">{t("verifyEmail.resendSuccess")}</p>
        ) : null}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">{t("forgotPassword.emailLabel")}</FormLabel>
              <FormControl>
                <Input type="email" placeholder={t("forgotPassword.emailPlaceholder")} {...field} />
              </FormControl>
              <FormMessage>
                {form.formState.errors.email ? t("validation.emailInvalid") : undefined}
              </FormMessage>
            </FormItem>
          )}
        />

        <Button type="submit" variant="outline" loading={form.formState.isSubmitting}>
          {t("verifyEmail.resendButton")}
        </Button>
      </form>
    </Form>
  );
}
