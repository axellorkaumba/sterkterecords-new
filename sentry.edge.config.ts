import * as Sentry from "@sentry/nextjs";

/**
 * Sentry — runtime Edge (middleware, routes edge). Chargé par
 * `src/instrumentation.ts`. Voir sentry.server.config.ts pour le détail du
 * comportement sans DSN configuré.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  debug: false,
});
