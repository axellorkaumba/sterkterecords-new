"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteCollaborator } from "./actions";
import { inviteCollaboratorSchema, type InviteCollaboratorValues } from "./schemas";

const PERMISSIONS = ["view", "manage"] as const;

export function InviteForm({ artistId }: { artistId: string }) {
  const t = useTranslations("Collaborators");

  const form = useForm<InviteCollaboratorValues>({
    resolver: zodResolver(inviteCollaboratorSchema),
    defaultValues: { email: "", permission: "view" },
  });

  async function onSubmit(values: InviteCollaboratorValues) {
    const result = await inviteCollaborator(artistId, values);
    if (result?.error) {
      form.setError("email", {
        message: result.error === "already_accepted" ? t("errorAlreadyAccepted") : t("error"),
      });
      return;
    }
    form.reset({ email: "", permission: "view" });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:flex-row">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>{t("emailLabel")}</FormLabel>
              <FormControl>
                <Input type="email" placeholder={t("emailPlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="permission"
          render={({ field }) => (
            <FormItem className="sm:w-48">
              <FormLabel>{t("permissionLabel")}</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(value: string) => t(`permission${value === "manage" ? "Manage" : "View"}`)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {PERMISSIONS.map((permission) => (
                      <SelectItem key={permission} value={permission}>
                        {t(`permission${permission === "manage" ? "Manage" : "View"}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-end">
          <Button type="submit" loading={form.formState.isSubmitting} loadingText={t("submitting")}>
            {t("submit")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
