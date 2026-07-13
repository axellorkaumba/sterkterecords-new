import { clientEnv } from "@/lib/env";

/**
 * Données structurées JSON-LD (§19 du CDC — Organization + MusicGroup).
 * Rendues une fois dans la racine de layout public : elles décrivent le
 * label dans son ensemble, pas une page en particulier.
 */
export function StructuredData() {
  const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Sterkte Records",
        url: siteUrl,
        logo: `${siteUrl}/brand/icon-mark-light.png`,
        foundingDate: "2021",
        founder: {
          "@type": "Person",
          name: "Axel l'or Kaumba",
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: "Avenue Mama Yemo",
          addressLocality: "Lubumbashi",
          addressCountry: "CD",
        },
        email: "contact.sterkterecords@gmail.com",
        telephone: "+243850510209",
        sameAs: ["https://linktr.ee/sterkterecords"],
      },
      {
        "@type": "MusicGroup",
        "@id": `${siteUrl}/#label`,
        name: "Sterkte Records",
        description:
          "Label musical indépendant et distributeur numérique basé à Lubumbashi (RDC) et Agadir (Maroc).",
        genre: ["Afrobeat", "Ndombolo", "R&B", "Gospel", "Amapiano", "Rap"],
        url: siteUrl,
      },
    ],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
