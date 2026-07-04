import * as Sentry from "@sentry/nextjs";

/**
 * Sentry — runtime Node.js (Server Components, Route Handlers, Server
 * Actions). Chargé par `src/instrumentation.ts` via le hook `register()`.
 * Sans `NEXT_PUBLIC_SENTRY_DSN`, le SDK reste inactif (pas d'erreur, pas
 * d'envoi) — c'est le cas par défaut tant que le projet Sentry n'existe pas.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  debug: false,
});
