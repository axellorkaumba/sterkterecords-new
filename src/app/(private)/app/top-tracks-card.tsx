import { getTranslations } from "next-intl/server";
import { MusicIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";

export interface TopTrack {
  id: string;
  title: string;
  streams: number;
}

export async function TopTracksCard({ tracks }: { tracks: TopTrack[] }) {
  const t = await getTranslations("Dashboard.topTracks");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {tracks.length === 0 ? (
          <EmptyState
            icon={MusicIcon}
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("title")}</TableHead>
                <TableHead className="text-right">{t("streamsColumn")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tracks.map((track) => (
                <TableRow key={track.id}>
                  <TableCell>{track.title}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {track.streams.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
