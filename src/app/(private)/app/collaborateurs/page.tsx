import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveArtist } from "@/lib/artists/active-artist";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { UsersIcon } from "lucide-react";
import { InviteForm } from "./invite-form";
import { RevokeButton } from "./revoke-button";

export async function generateMetadata() {
  const t = await getTranslations("Collaborators");
  return { title: t("title") };
}

const STATUS_BADGE_VARIANT = {
  pending: "warning",
  accepted: "success",
  revoked: "outline",
} as const;

/**
 * Gestion des collaborateurs de l'artiste actif (ADR 0030, Phase 2). Scopée
 * sur `getActiveArtist` comme le reste du dashboard (ADR 0027) — inviter
 * quelqu'un se fait artiste par artiste, pas au niveau du compte entier.
 * Accès lecture seule pour l'invité quel que soit `permission` (voir le
 * commentaire en tête de la migration 20260722130000) : le sélecteur
 * "Peut gérer" pose la donnée pour une phase future, sans effet aujourd'hui
 * au-delà de l'affichage.
 */
export default async function CollaboratorsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { activeArtist: artist } = await getActiveArtist(supabase, user.id);
  const t = await getTranslations("Collaborators");

  if (!artist) return null;

  const isOwner = artist.owner_id === user.id;

  if (!isOwner) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-8">
        <div>
          <h1 className="text-h2 font-display">{t("title")}</h1>
          <p className="text-muted-foreground">{t("notOwner", { artist: artist.name })}</p>
        </div>
      </div>
    );
  }

  const { data: collaborators } = await supabase
    .from("artist_collaborators")
    .select("id, invited_email, permission, status, invited_at")
    .eq("artist_id", artist.id)
    .order("invited_at", { ascending: false });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-8">
      <div>
        <h1 className="text-h2 font-display">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle", { artist: artist.name })}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("inviteTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <InviteForm artistId={artist.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("listTitle")}</CardTitle>
          <CardDescription>{t("listSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {!collaborators || collaborators.length === 0 ? (
            <EmptyState icon={UsersIcon} title={t("empty")} />
          ) : (
            <ul className="flex flex-col gap-1">
              {collaborators.map((collaborator) => (
                <li
                  key={collaborator.id}
                  className="border-border flex items-center gap-3 border-b py-2 last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="text-small font-medium">{collaborator.invited_email}</p>
                    <p className="text-caption text-muted-foreground">
                      {t(
                        collaborator.permission === "manage"
                          ? "permissionManage"
                          : "permissionView",
                      )}
                    </p>
                  </div>
                  <Badge variant={STATUS_BADGE_VARIANT[collaborator.status]}>
                    {t(`status.${collaborator.status}`)}
                  </Badge>
                  {collaborator.status !== "revoked" ? (
                    <RevokeButton collaboratorId={collaborator.id} />
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
