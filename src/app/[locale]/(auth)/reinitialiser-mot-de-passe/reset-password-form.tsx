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
import { updatePasswordAfterRecovery } from "../actions";
import { updatePasswordSchema, type UpdatePasswordValues } from "../schemas";

export function ResetPasswordForm() {
  const t = useTranslations("Auth");
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: UpdatePasswordValues) {
    setServerError(null);
    try {
      const result = await updatePasswordAfterRecovery(values);
      if (result?.error) {
        setServerError(t(`errors.${result.error}`));
      }
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("resetPassword.passwordLabel")}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t("resetPassword.passwordPlaceholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage>
                {form.formState.errors.password ? t("validation.passwordMin") : undefined}
              </FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("resetPassword.confirmPasswordLabel")}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t("resetPassword.confirmPasswordPlaceholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage>
                {form.formState.errors.confirmPassword
                  ? t("validation.passwordsMismatch")
                  : undefined}
              </FormMessage>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          loading={form.formState.isSubmitting}
          loadingText={t("resetPassword.submitting")}
        >
          {t("resetPassword.submit")}
        </Button>
      </form>
    </Form>
  );
}
