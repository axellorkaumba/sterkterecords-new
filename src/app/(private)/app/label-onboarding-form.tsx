"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createLabel } from "./label-actions";
import { createLabelSchema, type CreateLabelValues } from "./schemas";

/**
 * Première étape d'un compte Label (ADR 0029, Phase 1) : créer l'espace
 * Label avant tout artiste — `page.tsx` n'affiche ce formulaire que pour
 * `profiles.role = 'manager'` sans ligne `labels` existante. Une fois créé,
 * `page.tsx` bascule vers `OnboardingForm` (variant `"label-first"`) pour le
 * premier artiste du label.
 */
export function LabelOnboardingForm() {
  const t = useTranslations("LabelOnboarding");
  const router = useRouter();

  const form = useForm<CreateLabelValues>({
    resolver: zodResolver(createLabelSchema),
    defaultValues: { name: "", bio: "", avatarUrl: "" },
  });

  async function onSubmit(values: CreateLabelValues) {
    const result = await createLabel(values);
    if (result?.error) {
      form.setError("name", { message: t("error") });
      return;
    }
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 p-4 sm:p-8">
      <Card>
        <CardHeader>
          <p className="text-caption text-primary font-medium tracking-wide uppercase">
            {t("tag")}
          </p>
          <CardTitle className="text-h3 font-display">{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("nameLabel")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("namePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("bioLabel")}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t("bioPlaceholder")} rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("avatarUrlLabel")}</FormLabel>
                    <FormControl>
                      <Input placeholder="https://…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                loading={form.formState.isSubmitting}
                loadingText={t("submitting")}
              >
                {t("submit")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
