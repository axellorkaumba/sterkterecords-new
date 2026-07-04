import { getTranslations } from "next-intl/server";
import { MusicIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listArtistReleases } from "./actions";

export async function generateMetadata() {
  const t = await getTranslations("DistributionApp.list");
  return { title: t("title") };
}

const STATUS_BADGE_VARIANT = {
  draft: "outline",
  in_review: "warning",
  delivering: "info",
  delivered: "success",
  error: "destructive",
  takedown_requested: "warning",
  removed: "outline",
} as const;

/** Liste des sorties de l'artiste (§8 du CDC). */
export default async function DistributionListPage() {
  const t = await getTranslations("DistributionApp.list");
  const tStatus = await getTranslations("DistributionApp.statusLabels");
  const releases = await listArtistReleases();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-h2 font-display">{t("title")}</h1>
        <Button render={<Link href="/app/distribution/nouvelle" />} nativeButton={false}>
          {t("newRelease")}
        </Button>
      </div>

      {releases.length === 0 ? (
        <EmptyState
          icon={MusicIcon}
          title={t("empty.title")}
          description={t("empty.description")}
          action={
            <Button render={<Link href="/app/distribution/nouvelle" />} nativeButton={false}>
              {t("newRelease")}
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.title")}</TableHead>
              <TableHead>{t("columns.type")}</TableHead>
              <TableHead>{t("columns.status")}</TableHead>
              <TableHead>{t("columns.date")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {releases.map((release) => (
              <TableRow key={release.id}>
                <TableCell>{release.title || "—"}</TableCell>
                <TableCell className="capitalize">{release.type}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE_VARIANT[release.status]}>
                    {tStatus(release.status)}
                  </Badge>
                </TableCell>
                <TableCell>{release.release_date ?? "—"}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href={`/app/distribution/${release.id}`} />}
                    nativeButton={false}
                  >
                    {release.status === "draft" ? t("resumeDraft") : t("view")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
