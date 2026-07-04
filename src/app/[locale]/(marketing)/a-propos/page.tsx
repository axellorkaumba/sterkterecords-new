import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/marketing/page-hero";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createSeoMetadata } from "@/lib/seo";

export const generateMetadata = createSeoMetadata("Seo.about");

const TEAM_KEYS = ["axel", "abigail", "diademe"] as const;

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");

  return (
    <>
      <PageHero
        tag={t("tag")}
        description={t("intro")}
        renderTitle={(tags) => t.rich("title", tags)}
      />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-caption text-or-400 font-medium tracking-wide uppercase">
          {t("visionLabel")}
        </h2>
        <p className="text-body text-muted-foreground mt-3">{t("visionText")}</p>

        <h2 className="text-caption text-or-400 mt-10 font-medium tracking-wide uppercase">
          {t("missionLabel")}
        </h2>
        <p className="text-body text-muted-foreground mt-3">{t("missionText")}</p>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <h2 className="text-caption text-or-400 mb-8 font-medium tracking-wide uppercase">
          {t("teamLabel")}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {TEAM_KEYS.map((key) => {
            const name = t(`team.${key}.name`);
            return (
              <div
                key={key}
                className="border-border flex flex-col items-center gap-3 rounded-lg border p-6 text-center"
              >
                <Avatar className="size-14">
                  <AvatarFallback>{initialsOf(name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-foreground font-medium">{name}</p>
                  <p className="text-small text-primary">{t(`team.${key}.role`)}</p>
                </div>
                <p className="text-small text-muted-foreground">{t(`team.${key}.description`)}</p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
