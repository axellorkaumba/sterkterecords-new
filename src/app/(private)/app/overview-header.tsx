import { getTranslations } from "next-intl/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArtistSwitcher } from "./artist-switcher";
import type { Database } from "@/types/database.types";

type Artist = Database["public"]["Tables"]["artists"]["Row"];

/**
 * En-tête du dashboard (§11.3) : nom + avatar de l'artiste actif. Le
 * sélecteur (`ArtistSwitcher`) ne s'affiche que si le compte a plus d'un
 * artiste ou peut encore en ajouter (forfait Label, ADR 0026) — sinon on
 * garde l'affichage statique du MVP self-service.
 */
export async function OverviewHeader({
  artist,
  artists,
  canAddMore,
  latestPeriod,
}: {
  artist: Artist;
  /** Tous les artistes du compte — utilisé par le switcher. */
  artists: Artist[];
  canAddMore: boolean;
  /** Date du dernier reporting LabelGrid disponible (§13.1) — `null` tant qu'aucun n'existe. */
  latestPeriod: string | null;
}) {
  const t = await getTranslations("Dashboard");
  const initials = artist.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <Avatar size="lg">
        {artist.avatar_url ? <AvatarImage src={artist.avatar_url} alt="" /> : null}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div>
        <div className="flex items-center gap-1">
          <h1 className="text-h2 font-display">{artist.name}</h1>
          {artists.length > 1 || canAddMore ? (
            <ArtistSwitcher artists={artists} activeArtistId={artist.id} canAddMore={canAddMore} />
          ) : null}
        </div>
        <p className="text-small text-muted-foreground">
          {latestPeriod
            ? t("reportingNote", { date: new Date(latestPeriod).toLocaleDateString() })
            : t("noReportYet")}
        </p>
      </div>
    </div>
  );
}
