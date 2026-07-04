import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlProxy = createMiddleware(routing);

/**
 * Convention `proxy` (Next.js ≥16, renomme "middleware" — voir
 * https://nextjs.org/docs/messages/middleware-to-proxy).
 *
 * Le routing par préfixe de locale ne s'applique qu'au site public et à
 * l'authentification (`src/app/[locale]/...`). Le dashboard (`/app`) et le
 * back-office (`/admin`) vivent hors de ce segment (voir
 * docs/adr/0002-i18n-routing.md) et sont exclus du matcher ci-dessous.
 *
 * TODO(Sprint 3) : ajouter ici le rafraîchissement de session Supabase SSR
 * (createServerClient + auth.getUser()) et la garde d'authentification sur
 * /app et /admin, conformément au §17 (RLS + contrôle de rôle serveur).
 */
export default function proxy(request: Parameters<typeof intlProxy>[0]) {
  return intlProxy(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|app|admin|favicon.ico|.*\\..*).*)"],
};
