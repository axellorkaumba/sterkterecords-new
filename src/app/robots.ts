import type { MetadataRoute } from "next";
import { clientEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /app et /admin portent déjà `robots: noindex` (layout privé, §17),
        // mais on les exclut aussi explicitement ici pour les crawlers qui
        // ignorent la balise meta.
        disallow: ["/app", "/admin"],
      },
    ],
    sitemap: `${clientEnv.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
