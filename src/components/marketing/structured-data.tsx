/**
 * Données structurées JSON-LD (§19 du CDC — Organization + MusicGroup).
 * Rendues une fois dans la racine de layout public : elles décrivent le
 * label dans son ensemble, pas une page en particulier.
 */
export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.sterkterecords.com/#organization",
        name: "Sterkte Records",
        url: "https://www.sterkterecords.com",
        logo: "https://www.sterkterecords.com/logo.png",
        foundingDate: "2020",
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
        "@id": "https://www.sterkterecords.com/#label",
        name: "Sterkte Records",
        description:
          "Label musical indépendant et distributeur numérique basé à Lubumbashi (RDC) et Agadir (Maroc).",
        genre: ["Afrobeat", "Ndombolo", "R&B", "Gospel", "Amapiano", "Rap"],
        url: "https://www.sterkterecords.com",
      },
    ],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
