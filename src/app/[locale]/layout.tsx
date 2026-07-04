import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { fontSans, fontMono } from "@/lib/fonts";
import { PostHogProvider } from "@/lib/analytics/posthog-client-provider";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: {
      default: "Sterkte Records",
      template: "%s — Sterkte Records",
    },
    metadataBase: new URL("https://www.sterkterecords.com"),
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
    },
    other: { locale },
  };
}

/**
 * Racine de layout n°1 (site public + authentification).
 *
 * Next.js autorise plusieurs "root layouts" (chacun avec <html>/<body>) tant
 * qu'ils ne partagent pas de layout commun au-dessus : c'est le cas ici, le
 * dashboard privé a sa propre racine dans `src/app/(private)/layout.tsx`.
 * Voir docs/adr/0002-i18n-routing.md.
 */
export default async function LocaleRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Permet le rendu statique (SSG/ISR) des pages sous ce segment de locale.
  setRequestLocale(locale);

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
