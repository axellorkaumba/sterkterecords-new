import * as Sentry from "@sentry/nextjs";

/**
 * Sentry — runtime navigateur. Convention native Next.js (>=15.3) :
 * `instrumentation-client.ts` est chargé automatiquement, plus besoin de
 * `sentry.client.config.ts` séparé.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
