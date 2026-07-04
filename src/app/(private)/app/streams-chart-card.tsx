"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { BarChart3Icon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface MonthlyStreams {
  month: string;
  streams: number;
}

const CHART_CONFIG: ChartConfig = {
  streams: { label: "Streams", color: "var(--color-primary)" },
};

export function StreamsChartCard({ data }: { data: MonthlyStreams[] }) {
  const t = useTranslations("Dashboard.chart");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={BarChart3Icon}
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        ) : (
          <ChartContainer config={CHART_CONFIG} className="h-48 w-full">
            <BarChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="streams" fill="var(--color-streams)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
