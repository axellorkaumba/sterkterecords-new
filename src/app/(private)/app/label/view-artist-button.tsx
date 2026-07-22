"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { setActiveArtist } from "../artist-actions";

/** Bascule l'artiste actif (ADR 0027) puis va sur le dashboard par-artiste. */
export function ViewArtistButton({ artistId }: { artistId: string }) {
  const t = useTranslations("Dashboard.labelView");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await setActiveArtist(artistId);
      router.push("/app");
    });
  }

  return (
    <Button variant="ghost" size="sm" loading={isPending} onClick={handleClick}>
      {t("viewArtist")}
    </Button>
  );
}
