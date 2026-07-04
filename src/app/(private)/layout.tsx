import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { fontSans, fontMono } from "@/lib/fonts";
import { PostHogProvider } from "@/lib/analytics/posthog-client-provider";
import "../globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PrivateArea");
  return {
    title: {
      default: t("defaultTitle"),
      template: "%s — Sterkte Records",
    },
    robots: { index: false, follow: false },
  };
}

/**
 * Racine de layout n°2 (dashboard artiste `/app` + back-office `/admin`).
 *
 * Pas de préfixe de locale dans l'URL ici : aucun enjeu SEO pour des pages
 * privées authentifiées. La langue est résolue par `src/i18n/request.ts`
 * (cookie `sterkte_locale` en attendant l'auth, puis `profiles.locale` une
 * fois connecté — Sprint 3, modifiable à tout moment dans les paramètres).
 * Voir docs/adr/0002-i18n-routing.md.
 *
 * TODO(Sprint 3) : brancher le rafraîchissement de session Supabase et la
 * protection des routes ici (garde d'authentification + rôles, §7 du CDC).
 */
export default async function PrivateRootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${fontSans.variable} ${fontMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <PostHogProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
