import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AppLocale } from "@/i18n/routing";
import { getEnabledOAuthProviders } from "@/app/[locale]/(auth)/oauth-providers";
import { ProfileTab } from "./profile-tab";
import { SecurityTab } from "./security-tab";
import { LanguageTab } from "./language-tab";
import { NotificationsTab } from "./notifications-tab";
import { SubscriptionTab } from "./subscription-tab";
import { DangerTab } from "./danger-tab";

export async function generateMetadata() {
  const t = await getTranslations("Account");
  return { title: t("title") };
}

/**
 * Paramètres du compte (§11.2 du CDC) : profil, sécurité (mot de passe,
 * 2FA, comptes liés), langue & devise, notifications, abonnement,
 * suppression RGPD. Protégée par `src/proxy.ts` (garde d'authentification
 * sur `/app`) — un utilisateur non connecté n'atteint jamais ce composant.
 */
export default async function SettingsPage() {
  const t = await getTranslations("Account");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Garanti non-null par le proxy (garde d'authentification sur /app), mais
  // TypeScript ne le sait pas — évite un `!` non justifié en cas de course
  // improbable entre le rafraîchissement de session et ce rendu.
  if (!user) {
    return null;
  }

  const [
    { data: profile },
    { data: mfaFactors },
    { data: identitiesData },
    { data: countries },
    { data: currencies },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, country, locale, currency, notify_email, notify_whatsapp")
      .eq("id", user.id)
      .single(),
    supabase.auth.mfa.listFactors(),
    supabase.auth.getUserIdentities(),
    supabase.from("countries").select("code").eq("active", true).order("sort_order"),
    supabase.from("currencies").select("code").eq("active", true).order("sort_order"),
  ]);

  const mfaEnabled = (mfaFactors?.totp.length ?? 0) > 0;
  const locale = (profile?.locale as AppLocale | undefined) ?? "fr";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-8">
      <div>
        <h1 className="text-h2 font-display">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile">{t("tabs.profile")}</TabsTrigger>
          <TabsTrigger value="security">{t("tabs.security")}</TabsTrigger>
          <TabsTrigger value="language">{t("tabs.language")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("tabs.notifications")}</TabsTrigger>
          <TabsTrigger value="subscription">{t("tabs.subscription")}</TabsTrigger>
          <TabsTrigger value="danger">{t("tabs.danger")}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab
            fullName={profile?.full_name ?? ""}
            country={profile?.country ?? null}
            countryCodes={(countries ?? []).map((c) => c.code)}
          />
        </TabsContent>
        <TabsContent value="security">
          <SecurityTab
            mfaEnabled={mfaEnabled}
            identities={identitiesData?.identities ?? []}
            enabledOAuthProviders={getEnabledOAuthProviders()}
            locale={locale}
          />
        </TabsContent>
        <TabsContent value="language">
          <LanguageTab
            locale={locale}
            currency={profile?.currency ?? "USD"}
            currencyCodes={(currencies ?? []).map((c) => c.code)}
          />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab
            notifyEmail={profile?.notify_email ?? true}
            notifyWhatsapp={profile?.notify_whatsapp ?? false}
          />
        </TabsContent>
        <TabsContent value="subscription">
          <SubscriptionTab />
        </TabsContent>
        <TabsContent value="danger">
          <DangerTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
