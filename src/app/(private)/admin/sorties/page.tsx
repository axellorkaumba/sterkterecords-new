import { getTranslations } from "next-intl/server";
import { ClipboardCheckIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listReleasesForReview } from "../actions";
import { ReleaseRow } from "./release-row";

export async function generateMetadata() {
  const t = await getTranslations("Admin.releases");
  return { title: t("title") };
}

/** File de validation qualité (§11.10 "approuver / renvoyer avec motif") — sorties soumises en attente de décision staff. */
export default async function AdminReleasesReviewPage() {
  const t = await getTranslations("Admin.releases");
  const releases = await listReleasesForReview();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:p-8">
      <div>
        <h1 className="text-h2 font-display">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {releases.length === 0 ? (
        <EmptyState
          icon={ClipboardCheckIcon}
          title={t("empty.title")}
          description={t("empty.description")}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.title")}</TableHead>
              <TableHead>{t("columns.artist")}</TableHead>
              <TableHead>{t("columns.type")}</TableHead>
              <TableHead>{t("columns.submittedAt")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {releases.map((release) => (
              <ReleaseRow key={release.id} release={release} />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
