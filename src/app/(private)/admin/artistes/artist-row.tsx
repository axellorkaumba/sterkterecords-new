"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlanToggleButton } from "./plan-toggle-button";
import type { listAllArtists } from "../actions";

type ArtistRow = Awaited<ReturnType<typeof listAllArtists>>[number];

/**
 * Ligne de la liste des artistes — même micro-animation de changement de
 * statut que la file de validation (`release-row.tsx`) : un bref flash
 * doré confirme la bascule de forfait avant que la révalidation serveur
 * (`revalidatePath`, déjà appelée par `toggleArtistPlan`) ne mette à jour
 * le badge affiché.
 */
export function ArtistRow({ artist }: { artist: ArtistRow }) {
  const t = useTranslations("Admin.artists");
  const [flash, setFlash] = useState(false);

  return (
    <TableRow
      className={
        flash ? "bg-gold/10 transition-colors duration-500" : "transition-colors duration-500"
      }
    >
      <TableCell>{artist.name}</TableCell>
      <TableCell>
        <Badge variant={artist.plan === "label" ? "gold" : "outline"}>
          {t(`plans.${artist.plan}`)}
        </Badge>
      </TableCell>
      <TableCell>{artist.releases?.[0]?.count ?? 0}</TableCell>
      <TableCell>{new Date(artist.created_at).toLocaleDateString()}</TableCell>
      <TableCell>
        <PlanToggleButton
          artistId={artist.id}
          currentPlan={artist.plan}
          onToggled={() => {
            setFlash(true);
            setTimeout(() => setFlash(false), 900);
          }}
        />
      </TableCell>
    </TableRow>
  );
}
