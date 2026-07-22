"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronsUpDownIcon, CheckIcon, PlusIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { setActiveArtist } from "./artist-actions";
import type { Database } from "@/types/database.types";

type Artist = Database["public"]["Tables"]["artists"]["Row"];

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Sélecteur d'artiste actif (ADR 0026 — multi-artistes Label, plafond de 5).
 * Le compte peut posséder plusieurs profils artistes ; ce switcher pose le
 * cookie `active_artist_id` (voir src/lib/artists/active-artist.ts) qui
 * détermine l'artiste affiché sur le dashboard et ciblé par les Server
 * Actions du tunnel de distribution qui n'ont pas encore de `releaseId`.
 */
export function ArtistSwitcher({
  artists,
  activeArtistId,
  canAddMore,
}: {
  artists: Artist[];
  activeArtistId: string;
  canAddMore: boolean;
}) {
  const t = useTranslations("Dashboard.artistSwitcher");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSelect(artistId: string) {
    if (artistId === activeArtistId || isPending) return;
    startTransition(async () => {
      await setActiveArtist(artistId);
      router.refresh();
    });
  }

  function handleAddArtist() {
    router.push("/app/artistes/nouveau");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("switchArtist")}
            disabled={isPending}
          >
            <ChevronsUpDownIcon aria-hidden="true" />
          </Button>
        }
      />
      <DropdownMenuContent align="start">
        {artists.map((artist) => (
          <DropdownMenuItem key={artist.id} onClick={() => handleSelect(artist.id)}>
            <Avatar size="sm">
              {artist.avatar_url ? <AvatarImage src={artist.avatar_url} alt="" /> : null}
              <AvatarFallback>{initials(artist.name)}</AvatarFallback>
            </Avatar>
            <span className="truncate">{artist.name}</span>
            {artist.id === activeArtistId ? (
              <CheckIcon className="ml-auto size-4" aria-hidden="true" />
            ) : null}
          </DropdownMenuItem>
        ))}
        {canAddMore ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleAddArtist}>
              <PlusIcon aria-hidden="true" />
              {t("addArtist")}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
