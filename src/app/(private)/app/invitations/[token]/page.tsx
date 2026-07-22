import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AcceptInviteButton } from "./accept-invite-button";

export async function generateMetadata() {
  const t = await getTranslations("Collaborators.accept");
  return { title: t("title", { artist: "" }) };
}

/**
 * Acceptation d'une invitation collaborateur (ADR 0030, Phase 2). Le
 * `token` fait office de capacité porteuse (bearer) — quiconque le connaît
 * l'a reçu par email, donc la lecture ci-dessous passe par le client
 * `service_role` plutôt que la session de l'utilisateur : avant
 * acceptation, `artist_collaborators.user_id` est encore `null`, donc la
 * RLS normale (`owns_artist` ou `user_id = auth.uid()`) ne laisserait
 * personne lire cette ligne pour afficher le nom de l'artiste avant de
 * cliquer "Accepter". L'acceptation elle-même reste dans la session
 * utilisateur (`acceptCollaboratorInvite`, RPC SECURITY DEFINER scopée par
 * token — voir la migration 20260722130000).
 */
export default async function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: invite } = await admin
    .from("artist_collaborators")
    .select("status, permission, artists(name)")
    .eq("token", token)
    .maybeSingle();

  const t = await getTranslations("Collaborators.accept");

  if (!invite || invite.status !== "pending") {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-6 p-4 sm:p-8">
        <Card>
          <CardHeader>
            <CardTitle>{t("invalidTitle")}</CardTitle>
            <CardDescription>{t("invalidDescription")}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 p-4 sm:p-8">
      <Card>
        <CardHeader>
          <CardTitle>{t("title", { artist: invite.artists?.name ?? "" })}</CardTitle>
          <CardDescription>
            {t(invite.permission === "manage" ? "descriptionManage" : "descriptionView")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AcceptInviteButton token={token} />
        </CardContent>
      </Card>
    </div>
  );
}
