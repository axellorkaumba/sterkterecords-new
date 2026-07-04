import "server-only";

import { PostHog } from "posthog-node";
import { clientEnv, serverEnv } from "@/lib/env";

/**
 * Client PostHog serveur — pour les événements émis hors navigateur (Server
 * Actions, webhooks PSP/LabelGrid). `flushAt: 1` + `flushInterval: 0` :
 * adapté au runtime serverless de Vercel qui ne garde pas le process en vie
 * entre deux requêtes.
 */
let serverClient: PostHog | null = null;

export function getPostHogServerClient(): PostHog | null {
  const apiKey = serverEnv.POSTHOG_API_KEY ?? clientEnv.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) return null;

  if (!serverClient) {
    serverClient = new PostHog(apiKey, {
      host: clientEnv.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return serverClient;
}
