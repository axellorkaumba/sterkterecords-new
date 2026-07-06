import { getTranslations } from "next-intl/server";
import { UsersIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAllArtists } from "../actions";
import { ArtistRow } from "./artist-row";

export async function generateMetadata() {
  const t = await getTranslations("Admin.artists");
  return { title: t("title") };
}

/** Liste des artistes (§11.10 "gérer les artistes label") — Solo (self-service) et Label (géré en interne). */
export default async function AdminArtistsPage() {
  const t = await getTranslations("Admin.artists");
  const artists = await listAllArtists();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:p-8">
      <div>
        <h1 className="text-h2 font-display">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {artists.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title={t("empty.title")}
          description={t("empty.description")}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.name")}</TableHead>
              <TableHead>{t("columns.plan")}</TableHead>
              <TableHead>{t("columns.releases")}</TableHead>
              <TableHead>{t("columns.createdAt")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {artists.map((artist) => (
              <ArtistRow key={artist.id} artist={artist} />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
