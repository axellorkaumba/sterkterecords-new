import { setRequestLocale } from "next-intl/server";
import { createSeoMetadata } from "@/lib/seo";
import { SignupPanel } from "./signup-panel";
import type { AppLocale } from "@/i18n/routing";

export const generateMetadata = createSeoMetadata("Seo.signup", { noindex: true });

export default async function SignupPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SignupPanel locale={locale as AppLocale} />;
}
