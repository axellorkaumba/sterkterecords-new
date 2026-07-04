import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";

const SITE_URL = "https://www.sterkterecords.com";

/**
 * Chemins internes déclarés dans `routing.pathnames` (src/i18n/routing.ts).
 * Ne couvre que le site public + auth : `/app` et `/admin` ne sont jamais
 * indexés (§17, robots noindex sur le layout privé).
 */
const PUBLIC_PATHNAMES = [
  "/",
  "/a-propos",
  "/distribution",
  "/tarifs",
  "/studio",
  "/booking",
  "/featuring",
  "/consulting",
  "/contact",
  "/aide",
  "/legal/cgu",
  "/legal/confidentialite",
  "/legal/mentions",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHNAMES.map((pathname) => ({
    url: `${SITE_URL}${getPathname({ locale: routing.defaultLocale, href: pathname })}`,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [
          locale,
          `${SITE_URL}${getPathname({ locale, href: pathname })}`,
        ]),
      ),
    },
  }));
}
