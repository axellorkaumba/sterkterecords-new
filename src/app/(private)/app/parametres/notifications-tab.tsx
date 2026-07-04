"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateNotifications } from "./actions";

export function NotificationsTab({
  notifyEmail,
  notifyWhatsapp,
}: {
  notifyEmail: boolean;
  notifyWhatsapp: boolean;
}) {
  const t = useTranslations("Account.notifications");
  const [email, setEmail] = useState(notifyEmail);
  const [whatsapp, setWhatsapp] = useState(notifyWhatsapp);
  const [pending, setPending] = useState(false);

  async function handleSave() {
    setPending(true);
    const result = await updateNotifications({ notifyEmail: email, notifyWhatsapp: whatsapp });
    setPending(false);
    if (result?.error) {
      toast.error(t("saveButton"));
      return;
    }
    toast.success(t("savedToast"));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-body font-medium">{t("emailLabel")}</p>
            <p className="text-small text-muted-foreground">{t("emailDescription")}</p>
          </div>
          <Switch checked={email} onCheckedChange={setEmail} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-body font-medium">{t("whatsappLabel")}</p>
            <p className="text-small text-muted-foreground">{t("whatsappDescription")}</p>
          </div>
          <Switch checked={whatsapp} onCheckedChange={setWhatsapp} disabled />
        </div>

        <Button className="w-fit" loading={pending} loadingText={t("saving")} onClick={handleSave}>
          {t("saveButton")}
        </Button>
      </CardContent>
    </Card>
  );
}
