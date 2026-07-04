import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { createSeoMetadata } from "@/lib/seo";
import { OAuthButtons } from "../oauth-button";
import { getEnabledOAuthProviders } from "../oauth-providers";
import { LoginForm } from "./login-form";

export const generateMetadata = createSeoMetadata("Seo.login", { noindex: true });

const ERROR_KEYS = new Set(["oauth_failed", "auth_callback_failed"]);

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { next, error } = await searchParams;
  const t = await getTranslations("Auth");

  const errorMessage = error && ERROR_KEYS.has(error) ? t(`errors.${error}`) : null;

  return (
    <Card>
      <CardHeader>
        <p className="text-caption text-primary font-medium tracking-wide uppercase">
          {t("login.tag")}
        </p>
        <CardTitle className="text-h3 font-display">{t("login.title")}</CardTitle>
        <CardDescription>{t("login.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {errorMessage ? (
          <p role="alert" className="text-destructive text-small">
            {errorMessage}
          </p>
        ) : null}

        <OAuthButtons
          providers={getEnabledOAuthProviders()}
          locale={locale}
          next={next}
          labels={{ google: t("login.google"), apple: t("login.apple") }}
        />

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-caption text-muted-foreground uppercase">
            {t("login.orContinueWith")}
          </span>
          <Separator className="flex-1" />
        </div>

        <LoginForm next={next} />

        <p className="text-small text-muted-foreground text-center">
          {t("login.noAccount")}{" "}
          <Link href="/inscription" className="text-primary font-medium hover:underline">
            {t("login.signupLink")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
