"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { revokeCollaborator } from "./actions";

export function RevokeButton({ collaboratorId }: { collaboratorId: string }) {
  const t = useTranslations("Collaborators");
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await revokeCollaborator(collaboratorId);
    });
  }

  return (
    <Button variant="ghost" size="sm" loading={isPending} onClick={handleClick}>
      {t("revoke")}
    </Button>
  );
}
