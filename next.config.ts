import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // Cloudflare R2 sert les pochettes (§9 config `next/image`, §18 Perf).
    // Domaine réel à ajouter une fois le bucket R2 provisionné (Sprint 1/2).
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      // Les uploads audio passent par des URLs présignées R2, pas par les
      // Server Actions (§11.4) — cette limite protège les vraies Server
      // Actions (paiements, formulaires) d'un abus de payload.
      bodySizeLimit: "2mb",
    },
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Tant que SENTRY_ORG/SENTRY_PROJECT/SENTRY_AUTH_TOKEN ne sont pas définis
  // (pas encore de projet Sentry créé), le plugin d'upload des sourcemaps se
  // désactive silencieusement au lieu de faire échouer le build.
  silent: true,
  disableLogger: true,
  widenClientFileUpload: true,
  automaticVercelMonitors: false,
});
