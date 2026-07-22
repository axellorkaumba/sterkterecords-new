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
import { createArtistProfile } from "./actions";
import { createArtistSchema, type CreateArtistValues } from "./schemas";

export function OnboardingForm() {
  const t = useTranslations("Onboarding");
  const router = useRouter();

  const form = useForm<CreateArtistValues>({
    resolver: zodResolver(createArtistSchema),
    defaultValues: {
      name: "",
      bio: "",
      avatarUrl: "",
      website: "",
      instagram: "",
      spotify: "",
    },
  });

  async function onSubmit(values: CreateArtistValues) {
    const result = await createArtistProfile(values);
    if (result?.error) {
      form.setError("name", {
        message: result.error === "artist_limit_reached" ? t("errorLimitReached") : t("error"),
      });
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("websiteLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder="https://…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("instagramLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder="@monartiste" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="spotify"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("spotifyLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder="https://…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
