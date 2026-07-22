import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing, LOCALE_COOKIE_NAME, type AppLocale } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { updateSupabaseSession } from "@/lib/supabase/middleware";
import { fetchUserRole, homeForRole, STAFF_ROLES } from "@/lib/supabase/profile";
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminToken } from "@/lib/admin-auth/token";

const intlProxy = createMiddleware(routing);

/** Connexion du dashboard de validation — seule page de `/validations` accessible sans session admin. */
const VALIDATIONS_LOGIN_PATH = "/validations/connexion";

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
 * Convention `proxy` (Next.js ≥16, ex-"middleware"). Trois responsabilités
 * distinctes selon la zone visitée :
 *
 * - `/app`, `/admin` (privé, pas de préfixe de langue, voir ADR 0002) :
 *   garde d'authentification Supabase — non connecté → `/connexion?next=...` ;
 *   connecté mais rôle non-staff sur `/admin` → `/app` (§7.1, §17). Accès à
 *   `/app` (dont `/app/distribution`) accordé dès l'inscription, sans
 *   condition de paiement (ADR 0026 — renverse le paywall d'entrée du §10.1
 *   initial) : la validation du compte (paiement confirmé) n'est vérifiée
 *   qu'au moment de soumettre une sortie (`submitRelease`), pas à l'entrée.
 * - `/validations` (dashboard de validation des paiements, ADR 0026) : garde
 *   d'authentification SÉPARÉE — comptes `admin_users`, jamais Supabase Auth.
 *   Session vérifiée via le JWT signé (`sr_admin_session`, `jose`, edge-safe).
 * - Tout le reste (site public + auth, préfixé par locale) : routing
 *   next-intl inchangé, plus redirection des utilisateurs déjà connectés
 *   qui visitent /connexion ou /inscription vers leur espace.
 *
 * Le rafraîchissement de session Supabase (`updateSupabaseSession`) tourne
 * pour `/app`/`/admin` et le site public : c'est le seul endroit qui peut
 * réécrire le cookie de session avant qu'il n'atteigne les Server Components.
 * `/validations` s'en dispense (auth non-Supabase, pas de session à rafraîchir).
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/validations")) {
    if (pathname === VALIDATIONS_LOGIN_PATH) {
      return NextResponse.next();
    }
    const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
    const session = await verifyAdminToken(token);
    if (!session) {
      return NextResponse.redirect(new URL(VALIDATIONS_LOGIN_PATH, request.url));
    }
    return NextResponse.next();
  }

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
