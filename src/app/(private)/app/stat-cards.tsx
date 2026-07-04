import { getTranslations } from "next-intl/server";
import { TrendingUpIcon, TrendingDownIcon, WalletIcon, DiscIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StreamsCardProps {
  currentStreams: number | null;
  previousStreams: number | null;
}

export async function StreamsCard({ currentStreams, previousStreams }: StreamsCardProps) {
  const t = await getTranslations("Dashboard.streams");

  if (currentStreams === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-small text-muted-foreground font-medium">
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-small text-muted-foreground">{t("emptyDescription")}</p>
        </CardContent>
      </Card>
    );
  }

  const variation =
    previousStreams && previousStreams > 0
      ? Math.round(((currentStreams - previousStreams) / previousStreams) * 100)
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-small text-muted-foreground font-medium">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <p className="font-display text-h2 tabular-nums">{currentStreams.toLocaleString()}</p>
        <div className="flex items-center gap-2">
          <p className="text-caption text-muted-foreground">{t("period")}</p>
          {variation !== null ? (
            <span
              className={cn(
                "text-caption flex items-center gap-0.5 font-medium",
                variation >= 0 ? "text-success" : "text-destructive",
              )}
            >
              {variation >= 0 ? (
                <TrendingUpIcon className="size-3" aria-hidden="true" />
              ) : (
                <TrendingDownIcon className="size-3" aria-hidden="true" />
              )}
              {variation >= 0 ? "+" : ""}
              {variation}%
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

interface RevenueCardProps {
  balanceAvailable: number;
  balancePending: number;
  currency: string;
  hasAnyRevenue: boolean;
}

export async function RevenueCard({
  balanceAvailable,
  balancePending,
  currency,
  hasAnyRevenue,
}: RevenueCardProps) {
  const t = await getTranslations("Dashboard.revenue");
  const formatter = new Intl.NumberFormat(undefined, { style: "currency", currency });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-small text-muted-foreground flex items-center gap-1.5 font-medium">
          <WalletIcon className="size-3.5" aria-hidden="true" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {hasAnyRevenue ? (
          <>
            <p className="font-display text-h2 tabular-nums">
              {formatter.format(balanceAvailable)}
            </p>
            <p className="text-caption text-muted-foreground">
              {t("availableLabel")} · {t("pendingLabel")} {formatter.format(balancePending)}
            </p>
          </>
        ) : (
          <p className="text-small text-muted-foreground">{t("emptyDescription")}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface ReleasesCardProps {
  delivered: number;
  inProgress: number;
  drafts: number;
}

export async function ReleasesCard({ delivered, inProgress, drafts }: ReleasesCardProps) {
  const t = await getTranslations("Dashboard.releases");
  const total = delivered + inProgress + drafts;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-small text-muted-foreground flex items-center gap-1.5 font-medium">
          <DiscIcon className="size-3.5" aria-hidden="true" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-small text-muted-foreground">{t("emptyDescription")}</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            <p className="font-display text-h2 tabular-nums">{total}</p>
            <p className="text-caption text-muted-foreground">
              {delivered} {t("delivered")} · {inProgress} {t("inProgress")} · {drafts} {t("drafts")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
