"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MailCheckIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { AuthPanel } from "../auth-panel";
import { OAuthButtons } from "../oauth-button";
import { SignupForm } from "./signup-form";
import type { AppLocale } from "@/i18n/routing";
import type { OAuthProviderId } from "../oauth-providers";

export function SignupPanel({
  locale,
  oauthProviders,
}: {
  locale: AppLocale;
  oauthProviders: OAuthProviderId[];
}) {
  const t = useTranslations("Auth");
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);

  if (confirmedEmail) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <MailCheckIcon className="text-primary size-10" aria-hidden="true" />
        <h1 className="text-h2 font-display">{t("signup.successTitle")}</h1>
        <p className="text-muted-foreground">
          {t("signup.successDescription", { email: confirmedEmail })}
        </p>
      </div>
    );
  }

  return (
    <AuthPanel tag={t("signup.tag")} title={t("signup.title")} subtitle={t("signup.subtitle")}>
      <OAuthButtons
        providers={oauthProviders}
        locale={locale}
        labels={{ google: t("signup.google"), apple: t("signup.apple") }}
      />

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
    </AuthPanel>
  );
}
