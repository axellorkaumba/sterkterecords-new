"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  changePassword,
  enrollMfa,
  verifyMfaEnrollment,
  disableMfa,
  signOutEverywhere,
  linkOAuthIdentity,
  unlinkOAuthIdentity,
} from "./actions";
import { changePasswordSchema, type ChangePasswordValues } from "./schemas";
import type { OAuthProviderId } from "@/app/[locale]/(auth)/oauth-providers";
import type { AppLocale } from "@/i18n/routing";
import type { UserIdentity } from "@supabase/supabase-js";

function ChangePasswordForm() {
  const t = useTranslations("Account.security");
  const tAuth = useTranslations("Auth");

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ChangePasswordValues) {
    const result = await changePassword(values);
    if (result?.error) {
      toast.error(tAuth(`errors.${result.error}`));
      return;
    }
    toast.success(t("passwordChanged"));
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("newPasswordLabel")}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage>
                {form.formState.errors.password ? tAuth("validation.passwordMin") : undefined}
              </FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("confirmPasswordLabel")}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage>
                {form.formState.errors.confirmPassword
                  ? tAuth("validation.passwordsMismatch")
                  : undefined}
              </FormMessage>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-fit"
          loading={form.formState.isSubmitting}
          loadingText={t("changingPassword")}
        >
          {t("changePasswordButton")}
        </Button>
      </form>
    </Form>
  );
}

function TwoFactorSection({ initiallyEnabled }: { initiallyEnabled: boolean }) {
  const t = useTranslations("Account.security");
  const tAuth = useTranslations("Auth");
  const [enabled, setEnabled] = useState(initiallyEnabled);
  const [enrollment, setEnrollment] = useState<{
    factorId: string;
    qrCode: string;
    secret: string;
  } | null>(null);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);

  async function handleEnable() {
    setPending(true);
    const result = await enrollMfa();
    setPending(false);
    if (result.error || !result.factorId || !result.qrCode || !result.secret) {
      toast.error(tAuth(`errors.${result.error ?? "unknown"}`));
      return;
    }
    setEnrollment({ factorId: result.factorId, qrCode: result.qrCode, secret: result.secret });
  }

  async function handleVerify() {
    if (!enrollment) return;
    setPending(true);
    const result = await verifyMfaEnrollment({ factorId: enrollment.factorId, code });
    setPending(false);
    if (result?.error) {
      toast.error(tAuth(`errors.${result.error}`));
      return;
    }
    toast.success(t("enabledSuccess"));
    setEnabled(true);
    setEnrollment(null);
    setCode("");
  }

  async function handleDisable() {
    if (!enrollment && !enabled) return;
    setPending(true);
    const result = await disableMfa(enrollment?.factorId ?? "");
    setPending(false);
    if (result?.error) {
      toast.error(tAuth(`errors.${result.error}`));
      return;
    }
    toast.success(t("disabledSuccess"));
    setEnabled(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-body font-medium">{t("twoFactorTitle")}</p>
          <p className="text-small text-muted-foreground">{t("twoFactorDescription")}</p>
        </div>
        <Badge variant={enabled ? "success" : "info"}>
          {enabled ? t("twoFactorEnabledBadge") : t("twoFactorDisabledBadge")}
        </Badge>
      </div>

      {!enabled && !enrollment ? (
        <Button variant="outline" className="w-fit" loading={pending} onClick={handleEnable}>
          {t("enableButton")}
        </Button>
      ) : null}

      {enrollment ? (
        <div className="border-border flex flex-col gap-3 rounded-lg border p-4">
          <p className="text-small text-muted-foreground">{t("qrInstructions")}</p>
          {/* eslint-disable-next-line @next/next/no-img-element -- QR code en data URI, next/image inutile ici */}
          <img src={enrollment.qrCode} alt="" className="size-40 rounded-md bg-white p-2" />
          <p className="text-small font-mono">{enrollment.secret}</p>
          <div className="flex flex-col gap-1.5">
            <label className="text-small font-medium" htmlFor="mfa-code">
              {t("verificationCodeLabel")}
            </label>
            <Input
              id="mfa-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder={t("verificationCodePlaceholder")}
              maxLength={6}
              className="w-32"
            />
          </div>
          <div className="flex gap-2">
            <Button loading={pending} loadingText={t("verifying")} onClick={handleVerify}>
              {t("verifyButton")}
            </Button>
            <Button variant="ghost" onClick={() => setEnrollment(null)}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      ) : null}

      {enabled ? (
        <Button
          variant="destructive"
          className="w-fit"
          loading={pending}
          loadingText={t("disabling")}
          onClick={handleDisable}
        >
          {t("disableButton")}
        </Button>
      ) : null}
    </div>
  );
}

function SessionsSection() {
  const t = useTranslations("Account.security");
  const [pending, setPending] = useState(false);

  async function handleSignOutEverywhere() {
    setPending(true);
    await signOutEverywhere();
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-body font-medium">{t("sessionsTitle")}</p>
      <p className="text-small text-muted-foreground">{t("sessionsDescription")}</p>
      <Button
        variant="outline"
        className="w-fit"
        loading={pending}
        loadingText={t("signingOutEverywhere")}
        onClick={handleSignOutEverywhere}
      >
        {t("signOutEverywhereButton")}
      </Button>
    </div>
  );
}

/**
 * Comptes liés (§11.2) — Google est le seul provider actif aujourd'hui ;
 * Apple apparaît automatiquement dans `enabledProviders` dès que ses
 * identifiants sont configurés (voir docs/adr/0007-auth-architecture.md),
 * sans changement dans ce composant.
 */
function LinkedAccountsSection({
  identities,
  enabledProviders,
  locale,
}: {
  identities: UserIdentity[];
  enabledProviders: OAuthProviderId[];
  locale: AppLocale;
}) {
  const t = useTranslations("Account.security");
  const tAuth = useTranslations("Auth");
  const [pendingProvider, setPendingProvider] = useState<OAuthProviderId | null>(null);
  const [linkedIdentities, setLinkedIdentities] = useState(identities);

  async function handleLink(provider: OAuthProviderId) {
    setPendingProvider(provider);
    await linkOAuthIdentity(provider, locale);
    setPendingProvider(null);
  }

  async function handleUnlink(identity: UserIdentity) {
    setPendingProvider(identity.provider as OAuthProviderId);
    const result = await unlinkOAuthIdentity(identity);
    setPendingProvider(null);
    if (result?.error) {
      toast.error(tAuth(`errors.${result.error}`));
      return;
    }
    toast.success(t("unlinkedSuccess"));
    setLinkedIdentities((current) => current.filter((entry) => entry.id !== identity.id));
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-body font-medium">{t("linkedAccountsTitle")}</p>
      <p className="text-small text-muted-foreground">{t("linkedAccountsDescription")}</p>

      {enabledProviders.map((provider) => {
        const identity = linkedIdentities.find((entry) => entry.provider === provider);
        const isPending = pendingProvider === provider;

        return (
          <div key={provider} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-small font-medium">{t(`providers.${provider}`)}</span>
              <Badge variant={identity ? "success" : "outline"}>
                {identity ? t("linkedBadge") : t("notLinkedBadge")}
              </Badge>
            </div>
            {identity ? (
              <Button
                variant="outline"
                size="sm"
                loading={isPending}
                loadingText={t("unlinking")}
                onClick={() => handleUnlink(identity)}
              >
                {t("unlinkButton")}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                loading={isPending}
                loadingText={t("linking")}
                onClick={() => handleLink(provider)}
              >
                {t("linkButton")}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SecurityTab({
  mfaEnabled,
  identities,
  enabledOAuthProviders,
  locale,
}: {
  mfaEnabled: boolean;
  identities: UserIdentity[];
  enabledOAuthProviders: OAuthProviderId[];
  locale: AppLocale;
}) {
  const t = useTranslations("Account.security");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("changePasswordTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <ChangePasswordForm />
        <Separator />
        <TwoFactorSection initiallyEnabled={mfaEnabled} />
        <Separator />
        <LinkedAccountsSection
          identities={identities}
          enabledProviders={enabledOAuthProviders}
          locale={locale}
        />
        <Separator />
        <SessionsSection />
      </CardContent>
    </Card>
  );
}
