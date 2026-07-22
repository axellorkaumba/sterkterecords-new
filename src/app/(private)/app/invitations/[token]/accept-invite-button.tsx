"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { acceptCollaboratorInvite } from "../../collaborateurs/actions";

export function AcceptInviteButton({ token }: { token: string }) {
  const t = useTranslations("Collaborators.accept");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await acceptCollaboratorInvite(token);
      if (result?.error) {
        setError(t("error"));
        return;
      }
      router.push("/app");
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {error ? <p className="text-destructive text-small">{error}</p> : null}
      <Button loading={isPending} onClick={handleClick}>
        {t("acceptCta")}
      </Button>
    </div>
  );
}
