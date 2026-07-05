import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing, LOCALE_COOKIE_NAME, type AppLocale } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { updateSupabaseSession } from "@/lib/supabase/middleware";
import { fetchUserRole, homeForRole, STAFF_ROLES } from "@/lib/supabase/profile";
import { hasActiveEntitlement } from "@/lib/subscriptions/gate";

const intlProxy = createMiddleware(routing);

/**
 * Chemins exacts des pages connexion/inscription, toutes locales confondues
 * (`localePrefix: "as-needed"` — le français, locale par défaut, n'a pas de
 * préfixe). Un utilisateur déjà connecté qui visite l'une de ces pages est
 * redirigé vers son espace (§10.1). Recopié en dur plutôt que dérivé de
 * `routing.pathnames` : ne couvre que 6 chemins fixes, et se lit d'un coup
 * d'œil (voir aussi src/i18n/routing.ts pour la même logique de mapping).
 */
const AUTH_ONLY_PATHS = [
  "/connexion",
  "/en/login",
  "/ln/connexion",
  "/inscription",
  "/en/signup",
  "/ln/inscription",
];

/**
 * Chemins de `/app` exemptés du paywall (§10.1) : l'utilisateur doit pouvoir
 * y accéder même sans abonnement actif pour en souscrire un ou gérer un
 * abonnement existant/expiré.
 */
const PAYWALL_EXEMPT_APP_PATHS = ["/app/abonnement", "/app/parametres"];

function copyCookies(from: NextResponse, to: NextResponse) {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie);
  }
  return to;
}

function resolveLocaleFromRequest(request: NextRequest): AppLocale {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  return (routing.locales as readonly string[]).includes(cookieLocale ?? "")
    ? (cookieLocale as AppLocale)
    : routing.defaultLocale;
}

/**
 * Convention `proxy` (Next.js ≥16, ex-"middleware"). Deux responsabilités
 * distinctes selon la zone visitée :
 *
 * - `/app`, `/admin` (privé, pas de préfixe de langue, voir ADR 0002) :
 *   garde d'authentification — non connecté → `/connexion?next=...` ;
 *   connecté mais rôle non-staff sur `/admin` → `/app` (§7.1, §17). Sur
 *   `/app` (hors `/app/abonnement`, `/app/parametres`), un artiste sans
 *   abonnement actif ni forfait Label est redirigé vers `/app/abonnement`
 *   (§10.1, §5 — paiement avant accès) ; le staff interne passe toujours.
 * - Tout le reste (site public + auth, préfixé par locale) : routing
 *   next-intl inchangé, plus redirection des utilisateurs déjà connectés
 *   qui visitent /connexion ou /inscription vers leur espace.
 *
 * Le rafraîchissement de session Supabase (`updateSupabaseSession`) tourne
 * dans tous les cas : c'est le seul endroit qui peut réécrire le cookie de
 * session avant qu'il n'atteigne les Server Components.
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPrivateArea = pathname.startsWith("/app") || pathname.startsWith("/admin");

  const { supabaseResponse, user, supabase } = await updateSupabaseSession(request);

  if (isPrivateArea) {
    if (!user || !supabase) {
      const locale = resolveLocaleFromRequest(request);
      const loginPath = getPathname({ href: "/connexion", locale });
      const url = new URL(loginPath, request.url);
      url.searchParams.set("next", pathname);
      return copyCookies(supabaseResponse, NextResponse.redirect(url));
    }

    if (pathname.startsWith("/admin")) {
      const role = await fetchUserRole(supabase, user.id);
      if (!role || !STAFF_ROLES.includes(role)) {
        return copyCookies(supabaseResponse, NextResponse.redirect(new URL("/app", request.url)));
      }
    }

    if (
      pathname.startsWith("/app") &&
      !PAYWALL_EXEMPT_APP_PATHS.some((exempt) => pathname.startsWith(exempt))
    ) {
      const role = await fetchUserRole(supabase, user.id);
      const isStaff = !!role && STAFF_ROLES.includes(role);
      if (!isStaff && !(await hasActiveEntitlement(supabase, user.id))) {
        return copyCookies(
          supabaseResponse,
          NextResponse.redirect(new URL("/app/abonnement", request.url)),
        );
      }
    }

    return supabaseResponse;
  }

  const intlResponse = intlProxy(request);
  copyCookies(supabaseResponse, intlResponse);

  const isNormalResponse = intlResponse.status < 300;
  if (user && supabase && isNormalResponse && AUTH_ONLY_PATHS.includes(pathname)) {
    const role = await fetchUserRole(supabase, user.id);
    return copyCookies(
      intlResponse,
      NextResponse.redirect(new URL(homeForRole(role), request.url)),
    );
  }

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|favicon.ico|.*\\..*).*)"],
};
