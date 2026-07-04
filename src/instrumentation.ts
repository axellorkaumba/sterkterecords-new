import * as Sentry from "@sentry/nextjs";

/**
 * Hook d'instrumentation Next.js — charge la config Sentry adaptée au
 * runtime (Node ou Edge) au démarrage du serveur.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
