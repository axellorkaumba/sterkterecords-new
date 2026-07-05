import { getTranslations } from "next-intl/server";
import { UsersIcon, DiscIcon, ClipboardCheckIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata() {
  const t = await getTranslations("Admin.overview");
  return { title: t("title") };
}

/** Vue d'ensemble du back-office (§11.10) — comptages simples, socle minimal du MVP (§3.1). */
export default async function AdminOverviewPage() {
  const t = await getTranslations("Admin.overview");
  const supabase = await createClient();

  const [
    { count: soloArtists },
    { count: labelArtists },
    { count: pendingReview },
    { count: delivering },
    { count: delivered },
  ] = await Promise.all([
    supabase.from("artists").select("id", { count: "exact", head: true }).eq("plan", "solo"),
    supabase.from("artists").select("id", { count: "exact", head: true }).eq("plan", "label"),
    supabase
      .from("releases")
      .select("id", { count: "exact", head: true })
      .eq("status", "in_review"),
    supabase
      .from("releases")
      .select("id", { count: "exact", head: true })
      .eq("status", "delivering"),
    supabase
      .from("releases")
      .select("id", { count: "exact", head: true })
      .eq("status", "delivered"),
  ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:p-8">
      <div>
        <h1 className="text-h2 font-display">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-small text-muted-foreground flex items-center gap-1.5 font-medium">
              <UsersIcon className="size-3.5" aria-hidden="true" />
              {t("artistsTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <p className="font-display text-h2 tabular-nums">
              {(soloArtists ?? 0) + (labelArtists ?? 0)}
            </p>
            <p className="text-caption text-muted-foreground">
              {t("artistsBreakdown", { solo: soloArtists ?? 0, label: labelArtists ?? 0 })}
            </p>
          </CardContent>
        </Card>

        <Card className="ring-primary ring-2">
          <CardHeader>
            <CardTitle className="text-small text-muted-foreground flex items-center gap-1.5 font-medium">
              <ClipboardCheckIcon className="size-3.5" aria-hidden="true" />
              {t("pendingReviewTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <p className="font-display text-h2 tabular-nums">{pendingReview ?? 0}</p>
            <p className="text-caption text-muted-foreground">{t("pendingReviewDescription")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-small text-muted-foreground flex items-center gap-1.5 font-medium">
              <DiscIcon className="size-3.5" aria-hidden="true" />
              {t("releasesTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <p className="font-display text-h2 tabular-nums">
              {(delivering ?? 0) + (delivered ?? 0)}
            </p>
            <p className="text-caption text-muted-foreground">
              {t("releasesBreakdown", { delivering: delivering ?? 0, delivered: delivered ?? 0 })}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
