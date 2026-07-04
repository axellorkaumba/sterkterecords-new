"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MailCheckIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { GoogleSignInButton } from "../google-button";
import { SignupForm } from "./signup-form";
import type { AppLocale } from "@/i18n/routing";

export function SignupPanel({ locale }: { locale: AppLocale }) {
  const t = useTranslations("Auth");
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);

  if (confirmedEmail) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <MailCheckIcon className="text-primary size-10" aria-hidden="true" />
          <CardTitle className="text-h3 font-display">{t("signup.successTitle")}</CardTitle>
          <CardDescription>
            {t("signup.successDescription", { email: confirmedEmail })}
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <p className="text-caption text-primary font-medium tracking-wide uppercase">
          {t("signup.tag")}
        </p>
        <CardTitle className="text-h3 font-display">{t("signup.title")}</CardTitle>
        <CardDescription>{t("signup.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <GoogleSignInButton locale={locale} label={t("signup.google")} />

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-caption text-muted-foreground uppercase">
            {t("signup.orContinueWith")}
          </span>
          <Separator className="flex-1" />
        </div>

        <SignupForm locale={locale} onSuccess={setConfirmedEmail} />

        <p className="text-small text-muted-foreground text-center">
          {t("signup.hasAccount")}{" "}
          <Link href="/connexion" className="text-primary font-medium hover:underline">
            {t("signup.loginLink")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
