import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { createSeoMetadata } from "@/lib/seo";
import { AuthPanel } from "../auth-panel";
import { ResetPasswordForm } from "./reset-password-form";

export const generateMetadata = createSeoMetadata("Seo.resetPassword", { noindex: true });

/**
 * Accessible uniquement via le lien de réinitialisation (§11.2) — la session
 * de récupération temporaire est créée par `/api/auth/callback?type=recovery`
 * juste avant ce rendu. Sans session active, le lien est invalide ou expiré.
 */
export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth");

  // `createClient()` lève une erreur explicite si aucun projet Supabase n'est
  // configuré (voir src/lib/supabase/server.ts) — traité ici comme "lien
  // invalide" plutôt que de faire planter la page (voir docs/adr/0007,
  // section "Contrainte d'environnement").
  const user = await createClient()
    .then((supabase) => supabase.auth.getUser())
    .then(({ data }) => data.user)
    .catch(() => null);

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <h1 className="text-h2 font-display">{t("resetPassword.invalidLinkTitle")}</h1>
        <p className="text-muted-foreground">{t("resetPassword.invalidLinkDescription")}</p>
        <Button render={<Link href="/mot-de-passe-oublie" />} nativeButton={false}>
          {t("resetPassword.requestNewLink")}
        </Button>
      </div>
    );
  }

  return (
    <AuthPanel
      tag={t("resetPassword.tag")}
      title={t("resetPassword.title")}
      subtitle={t("resetPassword.subtitle")}
    >
      <ResetPasswordForm />
    </AuthPanel>
  );
}
