import { getTranslations } from "next-intl/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Database } from "@/types/database.types";

type Artist = Database["public"]["Tables"]["artists"]["Row"];

/**
 * En-tête du dashboard (§11.3) : nom artiste + avatar. Le sélecteur
 * d'artistes (managers, forfait Label) arrivera avec les comptes équipe
 * multi-artistes (§7.2, V1) — un seul artiste par compte au MVP self-service.
 */
export async function OverviewHeader({
  artist,
  latestPeriod,
}: {
  artist: Artist;
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
        <h1 className="text-h2 font-display">{artist.name}</h1>
        <p className="text-small text-muted-foreground">
          {latestPeriod
            ? t("reportingNote", { date: new Date(latestPeriod).toLocaleDateString() })
            : t("noReportYet")}
        </p>
      </div>
    </div>
  );
}
