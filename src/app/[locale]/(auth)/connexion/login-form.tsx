"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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
import { signIn } from "../actions";
import { signInSchema, type SignInValues } from "../schemas";

export function LoginForm({ next }: { next?: string }) {
  const t = useTranslations("Auth");
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: SignInValues) {
    setServerError(null);
    const result = await signIn(values, next);
    if (result?.error) {
      setServerError(t(`errors.${result.error}`));
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("login.emailLabel")}</FormLabel>
              <FormControl>
                <Input type="email" placeholder={t("login.emailPlaceholder")} {...field} />
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
              <div className="flex items-center justify-between">
                <FormLabel>{t("login.passwordLabel")}</FormLabel>
                <Link
                  href="/mot-de-passe-oublie"
                  className="text-small text-primary hover:underline"
                >
                  {t("login.forgotPasswordLink")}
                </Link>
              </div>
              <FormControl>
                <Input type="password" placeholder={t("login.passwordPlaceholder")} {...field} />
              </FormControl>
              <FormMessage>
                {form.formState.errors.password ? t("validation.requiredField") : undefined}
              </FormMessage>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          loading={form.formState.isSubmitting}
          loadingText={t("login.submitting")}
        >
          {t("login.submit")}
        </Button>
      </form>
    </Form>
  );
}
