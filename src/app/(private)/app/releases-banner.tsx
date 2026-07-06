import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { DiscIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getPublicUrl } from "@/lib/storage/r2";
import type { Database } from "@/types/database.types";

type ReleaseRow = Pick<
  Database["public"]["Tables"]["releases"]["Row"],
  "id" | "title" | "artwork_url" | "status"
>;

/**
 * Bandeau motivant en tête du dashboard (§ plan de refonte : "sensation
 * d'activité réelle"). Affiche les vraies pochettes des sorties déjà
 * livrées aux plateformes (`getPublicUrl`, réservé aux artworks publics —
 * jamais une pochette encore en brouillon, qui n'est pas accessible sur le
 * bucket public). Volontairement distinct de `src/content/catalogue.ts`
 * (vitrine marketing statique) : ceci lit les vraies sorties Supabase de
 * l'artiste connecté.
 */
export async function ReleasesBanner({ releases }: { releases: ReleaseRow[] }) {
  const t = await getTranslations("Dashboard.releasesBanner");

  const published = releases.filter(
    (r) => r.artwork_url && (r.status === "delivering" || r.status === "delivered"),
  );

  if (published.length === 0) {
    return (
      <EmptyState
        icon={DiscIcon}
        title={t("emptyTitle")}
        description={t("emptyDescription")}
        action={
          <Button size="sm" render={<Link href="/app/distribution/nouvelle">{t("cta")}</Link>} />
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-caption text-muted-foreground font-medium tracking-wide uppercase">
        {t("title")}
      </p>
      <div className="flex [scrollbar-width:none] gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        {published.map((release) => (
          <Link
            key={release.id}
            href={`/app/distribution/${release.id}`}
            className="group w-20 shrink-0"
          >
            <div className="shadow-card group-hover:shadow-elevated relative aspect-square overflow-hidden rounded-lg transition-shadow">
              <Image
                src={getPublicUrl(release.artwork_url!)}
                alt={release.title}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <p className="text-caption text-muted-foreground mt-1 truncate">{release.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
