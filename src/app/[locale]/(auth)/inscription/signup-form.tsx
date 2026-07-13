"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { unstable_rethrow } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { signUp } from "../actions";
import { signUpSchema, type SignUpFormValues } from "../schemas";
import type { AppLocale } from "@/i18n/routing";

export function SignupForm({
  locale,
  onSuccess,
}: {
  locale: AppLocale;
  onSuccess: (email: string) => void;
}) {
  const t = useTranslations("Auth");
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", password: "", locale, acceptTerms: false },
  });

  async function onSubmit(values: SignUpFormValues) {
    setServerError(null);
    try {
      const result = await signUp(values);
      if (result?.error) {
        setServerError(t(`errors.${result.error}`));
        return;
      }
      onSuccess(values.email);
    } catch (err) {
      unstable_rethrow(err);
      setServerError(t("errors.unknown"));
    }
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
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("signup.fullNameLabel")}</FormLabel>
              <FormControl>
                <Input placeholder={t("signup.fullNamePlaceholder")} {...field} />
              </FormControl>
              <FormMessage>
                {form.formState.errors.fullName ? t("validation.fullNameMin") : undefined}
              </FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("signup.emailLabel")}</FormLabel>
              <FormControl>
                <Input type="email" placeholder={t("signup.emailPlaceholder")} {...field} />
              </FormControl>
              <FormMessage>
                {form.formState.errors.email ? t("validation.emailInvalid") : undefined}
              </FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("signup.passwordLabel")}</FormLabel>
              <FormControl>
                <Input type="password" placeholder={t("signup.passwordPlaceholder")} {...field} />
              </FormControl>
              <FormMessage>
                {form.formState.errors.password
                  ? t("validation.passwordMin")
                  : t("signup.passwordHint")}
              </FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-2.5">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    className="mt-0.5"
                  />
                </FormControl>
                <FormLabel className="text-small text-muted-foreground font-normal">
                  {t.rich("signup.termsLabel", {
                    cgu: (chunks) => (
                      <Link
                        href="/legal/cgu"
                        target="_blank"
                        className="text-primary hover:underline"
                      >
                        {chunks}
                      </Link>
                    ),
                    privacy: (chunks) => (
                      <Link
                        href="/legal/confidentialite"
                        target="_blank"
                        className="text-primary hover:underline"
                      >
                        {chunks}
                      </Link>
                    ),
                  })}
                </FormLabel>
              </div>
              <FormMessage>
                {form.formState.errors.acceptTerms ? t("validation.termsRequired") : undefined}
              </FormMessage>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          loading={form.formState.isSubmitting}
          loadingText={t("signup.submitting")}
        >
          {t("signup.submit")}
        </Button>
      </form>
    </Form>
  );
}
