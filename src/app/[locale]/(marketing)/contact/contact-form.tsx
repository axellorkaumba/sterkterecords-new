"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const SUBJECTS = ["distribution", "studio", "booking", "featuring", "consulting", "other"] as const;

export function ContactForm() {
  const t = useTranslations("ContactPage.form");
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-name">{t("name")}</Label>
          <Input id="contact-name" placeholder={t("namePlaceholder")} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-email">{t("email")}</Label>
          <Input id="contact-email" type="email" placeholder={t("emailPlaceholder")} required />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-subject">{t("subject")}</Label>
        <Select>
          <SelectTrigger id="contact-subject" className="w-full">
            <SelectValue placeholder={t("subjectPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {SUBJECTS.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {t(`subjects.${subject}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-message">{t("message")}</Label>
        <Textarea id="contact-message" placeholder={t("messagePlaceholder")} rows={5} />
      </div>
      <Button type="submit" size="lg" variant="gold" loading={submitting}>
        {t("submit")}
      </Button>
    </form>
  );
}
