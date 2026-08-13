import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { catalogueReleases } from "@/content/catalogue";

/**
 * Panneau visuel des pages d'authentification (§11.2) — remplace le fond uni
 * par une mosaïque des vraies pochettes du catalogue (mêmes assets que
 * `catalogue-showcase.tsx` sur l'accueil). Direction demandée par Axel,
 * référence TuneCore (photo plein cadre à droite du formulaire) — préféré
 * une vraie photo d'artiste ici : moins de travail de recadrage/droits, et
 * prouve directement "vrais artistes distribués" plutôt qu'une image
 * générique. Caché sous `lg` : jamais chargé sur mobile (poids + inutile,
 * l'écran est trop étroit pour laisser de la place au formulaire).
 */
export async function AuthVisualPanel() {
  const t = await getTranslations("Auth");
  const covers = catalogueReleases.slice(0, 12);

  return (
    <div className="relative hidden overflow-hidden lg:block">
      <div className="absolute inset-0 grid grid-cols-3">
        {covers.map((release) => (
          <div key={release.slug} className="relative">
            <Image
              src={release.coverSrc}
              alt=""
              fill
              sizes="(min-width: 1024px) 17vw, 0px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
      <div className="from-noir-950 via-noir-950/70 pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent" />
      <div className="from-cerise-900/50 pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-10">
        <p className="text-h3 font-display text-blanc max-w-sm">{t("visualPanel.title")}</p>
        <p className="text-body text-blanc/70 mt-2 max-w-sm">{t("visualPanel.subtitle")}</p>
      </div>
    </div>
  );
}
