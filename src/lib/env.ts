import { z } from "zod";

/**
 * Validation typée des variables d'environnement (Zod).
 *
 * Principe : les variables du socle (URL du site, Supabase) sont
 * obligatoires — l'appli ne démarre pas sans elles. Les variables des
 * services externes non encore provisionnés (Stripe, Flutterwave,
 * LabelGrid, etc.) sont optionnelles ICI : chaque adaptateur (`src/lib/*`)
 * vérifie lui-même sa propre config au moment de l'utiliser et lève une
 * erreur explicite si elle manque. Ça permet de faire tourner `pnpm dev`
 * dès le Sprint 0 sans avoir créé tous les comptes tiers, tout en gardant
 * des erreurs claires (jamais un `undefined` qui explose plus loin sans
 * contexte) une fois qu'on branche chaque service.
 *
 * Ne JAMAIS importer ce module depuis un Client Component : `serverEnv`
 * contient des secrets. Les Client Components utilisent `clientEnv`.
 */

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // --- Supabase (Postgres + Auth + RLS + Realtime) ---
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // --- OAuth Apple (§11.2, [V1] — différé : compte Apple Developer payant
  // requis, voir docs/adr/0007-auth-architecture.md). Présence de ces deux
  // variables = bouton "Continuer avec Apple" affiché, même mécanique que
  // le mock LabelGrid (ADR 0003).
  SUPABASE_AUTH_EXTERNAL_APPLE_CLIENT_ID: z.string().min(1).optional(),
  SUPABASE_AUTH_EXTERNAL_APPLE_SECRET: z.string().min(1).optional(),

  // --- Cloudflare R2 (stockage audio/artwork, S3-compatible) ---
  R2_ACCOUNT_ID: z.string().min(1).optional(),
  R2_ACCESS_KEY_ID: z.string().min(1).optional(),
  R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  R2_BUCKET_NAME: z.string().min(1).optional(),
  R2_PUBLIC_URL: z.string().url().optional(),

  // --- Stripe (paiements internationaux) ---
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),

  // --- Flutterwave (cartes + Mobile Money Afrique) ---
  FLUTTERWAVE_SECRET_KEY: z.string().min(1).optional(),
  FLUTTERWAVE_WEBHOOK_SECRET_HASH: z.string().min(1).optional(),

  // --- Paystack (cartes + Mobile Money Afrique, secondaire) ---
  PAYSTACK_SECRET_KEY: z.string().min(1).optional(),

  // --- PayPal (paiement secondaire, [V1]) ---
  PAYPAL_CLIENT_SECRET: z.string().min(1).optional(),

  // --- Resend (emails transactionnels) ---
  RESEND_API_KEY: z.string().min(1).optional(),

  // --- LabelGrid (rail de distribution DSP — doc API en attente, §13.1) ---
  LABELGRID_API_BASE_URL: z.string().url().optional(),
  LABELGRID_API_KEY: z.string().min(1).optional(),
  LABELGRID_WEBHOOK_SECRET: z.string().min(1).optional(),

  // --- WhatsApp Business Cloud API (Meta) ---
  WHATSAPP_CLOUD_API_TOKEN: z.string().min(1).optional(),
  WHATSAPP_CLOUD_PHONE_NUMBER_ID: z.string().min(1).optional(),
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: z.string().min(1).optional(),

  // --- Documenso (e-signature, [V1]) ---
  DOCUMENSO_API_KEY: z.string().min(1).optional(),
  DOCUMENSO_BASE_URL: z.string().url().optional(),

  // --- Sentry (erreurs) ---
  SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
  SENTRY_ORG: z.string().min(1).optional(),
  SENTRY_PROJECT: z.string().min(1).optional(),

  // --- PostHog (produit/analytics) ---
  POSTHOG_API_KEY: z.string().min(1).optional(),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),

  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),

  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),

  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().default("https://eu.i.posthog.com"),
});

/**
 * `.env.local` renseigne souvent des clés vides (`STRIPE_SECRET_KEY=`) pour
 * documenter ce qui existe sans encore avoir la valeur. `process.env` lit
 * alors une chaîne vide, pas `undefined`, ce qui casserait un
 * `z.string().min(1).optional()`. On normalise "" en `undefined` avant
 * validation pour que "non renseigné" se comporte pareil dans les deux cas.
 */
function emptyStringsToUndefined(data: Record<string, string | undefined>) {
  const sanitized: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(data)) {
    sanitized[key] = value === "" ? undefined : value;
  }
  return sanitized;
}

function parseOrThrow<T extends z.ZodTypeAny>(schema: T, data: unknown, label: string): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `[env] Variables d'environnement invalides (${label}) :\n${issues}\n` +
        `Vérifie ton fichier .env.local par rapport à .env.example.`,
    );
  }
  return result.data;
}

export const serverEnv = parseOrThrow(
  serverEnvSchema,
  emptyStringsToUndefined(process.env),
  "serveur",
);

export const clientEnv = parseOrThrow(
  clientEnvSchema,
  emptyStringsToUndefined({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  }),
  "client",
);

/** Lève une erreur explicite si une variable requise par un adaptateur précis manque. */
export function requireEnv<K extends keyof typeof serverEnv>(
  key: K,
  context: string,
): NonNullable<(typeof serverEnv)[K]> {
  const value = serverEnv[key];
  if (value === undefined || value === null || value === "") {
    throw new Error(
      `[env] "${key}" est requis pour ${context} mais n'est pas défini. ` +
        `Ajoute-le dans .env.local (voir .env.example).`,
    );
  }
  return value as NonNullable<(typeof serverEnv)[K]>;
}
