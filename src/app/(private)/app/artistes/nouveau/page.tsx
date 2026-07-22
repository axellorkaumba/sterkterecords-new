import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { listOwnedArtists } from "@/lib/artists/active-artist";
import { getArtistLimit } from "@/lib/artists/limit";
import { OnboardingForm } from "../../onboarding-form";

export async function generateMetadata() {
  const t = await getTranslations("Onboarding");
  return { title: t("addTitle") };
}

/**
 * Ajout d'un artiste supplémentaire sous un compte déjà onboardé (ADR 0026 —
 * multi-artistes Label, plafond de 5). `page.tsx` (dashboard) ne montre
 * `OnboardingForm` que quand le compte n'a encore aucun artiste — cette
 * route est le seul point d'entrée pour créer le 2e-5e (atteint via
 * `ArtistSwitcher`). Le plafond réel est déjà imposé côté serveur par
 * `createArtistProfile` ; la redirection ici évite juste d'afficher un
 * formulaire pour rien à qui naviguerait directement sur l'URL au plafond.
 */
export default async function AddArtistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [artists, limit] = await Promise.all([
    listOwnedArtists(supabase, user.id),
    getArtistLimit(supabase, user.id),
  ]);
  if (artists.length === 0 || artists.length >= limit) {
    redirect("/app");
  }

  return <OnboardingForm variant="add" />;
}
