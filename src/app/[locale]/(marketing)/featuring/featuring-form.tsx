"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function FeaturingForm() {
  const t = useTranslations("Featuring.form");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(t("submit"));
    }, 600);
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="featuring-artist">{t("artistLabel")}</Label>
        <Input id="featuring-artist" placeholder={t("artistPlaceholder")} required />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="featuring-project">{t("projectName")}</Label>
          <Input id="featuring-project" placeholder={t("projectPlaceholder")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="featuring-deadline">{t("deadline")}</Label>
          <Input id="featuring-deadline" type="date" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="featuring-link">{t("link")}</Label>
        <Input id="featuring-link" placeholder={t("linkPlaceholder")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="featuring-description">{t("description")}</Label>
        <Textarea id="featuring-description" placeholder={t("descriptionPlaceholder")} />
      </div>
      <Button type="submit" size="lg" variant="gold" loading={submitting}>
        {t("submit")}
      </Button>
    </form>
  );
}
