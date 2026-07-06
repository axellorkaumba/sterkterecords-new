"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import { ReviewActions } from "./review-actions";
import type { listReleasesForReview } from "../actions";

type ReleaseForReview = Awaited<ReturnType<typeof listReleasesForReview>>[number];

/**
 * Ligne de la file de validation qualité — micro-animation de changement
 * de statut (§ plan de refonte, Dashboard Label/Admin) : un bref flash de
 * couleur (succès = vert, rejet = ambre) confirme visuellement l'action
 * avant que `router.refresh()` ne retire la ligne de la liste (elle a
 * changé de statut, elle ne fait plus partie de la file `in_review`).
 * Couleur uniquement (`background-color`), transition CSS courte — pas de
 * dépendance à Framer Motion pour un élément `<tr>` (mise en page table,
 * peu adapté aux animations de transform).
 */
export function ReleaseRow({ release }: { release: ReleaseForReview }) {
  const router = useRouter();
  const [flash, setFlash] = useState<"approved" | "rejected" | null>(null);

  function handleSettled(kind: "approved" | "rejected") {
    setFlash(kind);
    setTimeout(() => router.refresh(), 450);
  }

  return (
    <TableRow
      className={
        flash === "approved"
          ? "bg-success/15 transition-colors duration-500"
          : flash === "rejected"
            ? "bg-warning/15 transition-colors duration-500"
            : "transition-colors duration-500"
      }
    >
      <TableCell>{release.title || "—"}</TableCell>
      <TableCell>{release.artists?.name ?? "—"}</TableCell>
      <TableCell className="capitalize">{release.type}</TableCell>
      <TableCell>
        {release.submitted_at ? new Date(release.submitted_at).toLocaleDateString() : "—"}
      </TableCell>
      <TableCell>
        <ReviewActions
          releaseId={release.id}
          onApproved={() => handleSettled("approved")}
          onRejected={() => handleSettled("rejected")}
        />
      </TableCell>
    </TableRow>
  );
}
