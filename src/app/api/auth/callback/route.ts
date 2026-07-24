import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { fetchUserRole, homeForRole } from "@/lib/supabase/profile";
import { isSafeRedirectPath } from "@/lib/supabase/safe-redirect";

/**
 * Point d'échange PKCE unique pour TOUS les flux Supabase Auth qui renvoient
 * l'utilisateur vers le site (§11.2) : connexion Google, confirmation
 * d'inscription, réinitialisation de mot de passe. Volontairement sous
 * `/api/auth/...` : ce préfixe est déjà exclu du matcher next-intl
 * (`src/proxy.ts`), donc ni le routing par préfixe de langue ni la garde
 * d'authentification ne s'y appliquent.
 *
 * `type`/`locale`/`next` ne sont PAS des paramètres renvoyés par Supabase —
 * ce sont les nôtres, embarqués explicitement dans les URLs `redirectTo`/
 * `emailRedirectTo` passées à `signInWithOAuth`/`signUp`/
 * `resetPasswordForEmail` (voir src/app/[locale]/(auth)/actions.ts).
 * Supabase se contente d'ajouter `?code=...` à l'URL fournie sans la modifier
 * autrement, donc ces paramètres nous reviennent intacts.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = searchParams.get("next");
  const localeParam = searchParams.get("locale");
  const locale: AppLocale = (routing.locales as readonly string[]).includes(localeParam ?? "")
    ? (localeParam as AppLocale)
    : routing.defaultLocale;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (type === "recovery") {
        const resetPath = getPathname({ href: "/reinitialiser-mot-de-passe", locale });
        return NextResponse.redirect(`${origin}${resetPath}`);
      }
      if (isSafeRedirectPath(next)) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      // Connexion Google ou confirmation d'inscription réussie : direction le
      // tableau de bord adapté au rôle — corrigé en audit, ce chemin
      // renvoyait tout le monde vers /app, y compris le personnel interne
      // (super_admin, support...), qui devait ensuite naviguer manuellement
      // vers /admin. `signIn` (Server Action email/mot de passe) fait déjà
      // ce calcul ; ce endpoint ne l'avait jamais repris pour Google/l'email
      // de confirmation.
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const role = user ? await fetchUserRole(supabase, user.id) : null;
      return NextResponse.redirect(`${origin}${homeForRole(role)}`);
    }
  }

  const loginPath = getPathname({ href: "/connexion", locale });
  const url = new URL(`${origin}${loginPath}`);
  url.searchParams.set("error", "auth_callback_failed");
  return NextResponse.redirect(url);
}
