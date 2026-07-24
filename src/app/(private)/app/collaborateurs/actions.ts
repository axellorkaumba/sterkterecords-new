"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendCollaboratorInviteEmail } from "@/lib/email/send";
import { clientEnv } from "@/lib/env";
import { inviteCollaboratorSchema, type InviteCollaboratorValues } from "./schemas";

type ActionResult = { error: string | null };

/**
 * Invite un tiers sur un artiste précis (ADR 0030, Phase 2). `upsert` sur
 * `(artist_id, invited_email)` — réinviter la même adresse renvoie
 * simplement un nouvel email plutôt que d'échouer sur la contrainte unique
 * (utile pour renvoyer une invitation oubliée, ou changer `permission` avant
 * acceptation). La RLS (`artist_collaborators_insert_owner`/`_update_owner`,
 * migration 20260722130000) garantit déjà que seul le propriétaire de
 * l'artiste peut écrire ici — la vérification ci-dessous n'est là que pour
 * renvoyer une erreur lisible plutôt qu'un échec RLS silencieux.
 *
 * Corrigé en audit : l'upsert forçait toujours `status: "pending"`, y
 * compris sur une ligne déjà `"accepted"` — ré-inviter par erreur (ou pour
 * changer `permission`) coupait instantanément l'accès du collaborateur,
 * sans qu'il soit prévenu, jusqu'à ce qu'il reclique sur son (vieux) lien
 * d'acceptation. On bloque maintenant ce cas explicitement plutôt que de
 * l'écraser silencieusement.
 */
export async function inviteCollaborator(
  artistId: string,
  values: InviteCollaboratorValues,
): Promise<ActionResult> {
  const parsed = inviteCollaboratorSchema.safeParse(values);
  if (!parsed.success) return { error: "invalid" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unknown" };

  const { data: artist } = await supabase
    .from("artists")
    .select("id, name")
    .eq("id", artistId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!artist) return { error: "not_found" };

  const email = parsed.data.email.toLowerCase();

  const { data: existing } = await supabase
    .from("artist_collaborators")
    .select("status")
    .eq("artist_id", artistId)
    .eq("invited_email", email)
    .maybeSingle();
  if (existing?.status === "accepted") return { error: "already_accepted" };

  const { data: invite, error } = await supabase
    .from("artist_collaborators")
    .upsert(
      {
        artist_id: artistId,
        invited_email: email,
        permission: parsed.data.permission,
        invited_by: user.id,
        status: "pending",
      },
      { onConflict: "artist_id,invited_email" },
    )
    .select("token")
    .single();

  if (error || !invite) return { error: "unknown" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("locale, full_name")
    .eq("id", user.id)
    .single();
  const locale = (profile?.locale as "fr" | "en" | "ln" | undefined) ?? "fr";

  await sendCollaboratorInviteEmail({
    to: email,
    locale,
    artistName: artist.name,
    inviterName: profile?.full_name ?? "",
    acceptUrl: `${clientEnv.NEXT_PUBLIC_SITE_URL}/app/invitations/${invite.token}`,
  });

  revalidatePath("/app/collaborateurs");
  return { error: null };
}

/** Révoque un accès — conserve la ligne (status='revoked') pour l'historique, ne la supprime pas. */
export async function revokeCollaborator(collaboratorId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unknown" };

  const { error } = await supabase
    .from("artist_collaborators")
    .update({ status: "revoked" })
    .eq("id", collaboratorId);

  if (error) return { error: "unknown" };
  revalidatePath("/app/collaborateurs");
  return { error: null };
}

/** Accepte une invitation via son token (ADR 0030) — voir la fonction SECURITY DEFINER `accept_artist_collaborator_invite`. */
export async function acceptCollaboratorInvite(token: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthenticated" };

  const { data: artistId, error } = await supabase.rpc("accept_artist_collaborator_invite", {
    p_token: token,
  });

  if (error || !artistId) return { error: "invalid_invite" };

  revalidatePath("/app");
  return { error: null };
}
