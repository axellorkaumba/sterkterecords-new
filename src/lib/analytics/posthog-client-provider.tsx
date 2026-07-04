"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PostHogJsProvider } from "posthog-js/react";
import { clientEnv } from "@/lib/env";

/**
 * PostHog — analytics produit (§6.1, §25). Respecte la vie privée : capture
 * désactivée si `NEXT_PUBLIC_POSTHOG_KEY` n'est pas défini (pas de compte
 * créé pour l'instant), donc aucun risque d'envoyer des données vers un
 * projet qui n'existe pas.
 *
 * `capture_pageview: false` : Next.js App Router change de route sans
 * rechargement complet, la capture de pageview sera branchée explicitement
 * (via un hook sur les changements de route) quand le suivi produit sera
 * conçu, plutôt que de compter des pageviews approximatifs dès maintenant.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!clientEnv.NEXT_PUBLIC_POSTHOG_KEY || posthog.__loaded) return;

    posthog.init(clientEnv.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: clientEnv.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: false,
      person_profiles: "identified_only",
    });
  }, []);

  return <PostHogJsProvider client={posthog}>{children}</PostHogJsProvider>;
}
