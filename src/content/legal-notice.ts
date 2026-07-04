import type { LegalDocumentByLocale } from "@/content/legal-types";

/**
 * Mentions légales — dérivées des informations société déjà présentes dans
 * les CGU (Art. 1, 18) et le footer du site. Les champs entre crochets sont
 * des placeholders explicites, comme dans les CGU (§1) : à compléter par
 * Axel avant publication (numéro ICE, adresse complète, hébergeur).
 */
export const legalNotice: LegalDocumentByLocale = {
  fr: {
    sections: [
      {
        heading: "1. Éditeur du site",
        paragraphs: [
          "Le site www.sterkterecords.com est édité par STERKTE RECORDS SARL-AU, société immatriculée à Agadir, Maroc (ICE : [numéro ICE à compléter]), dont le siège social est situé [adresse siège Agadir].",
          "Sterkte Records est un label et distributeur de musique numérique indépendant, fondé en 2020 à Lubumbashi, République Démocratique du Congo.",
          "Représentant légal : Axel l'or Kaumba, Fondateur.",
        ],
      },
      {
        heading: "2. Contact",
        table: {
          headers: ["Canal", "Coordonnées"],
          rows: [
            ["Email", "contact.sterkterecords@gmail.com"],
            ["Téléphone / WhatsApp", "+243 850 510 209"],
            ["Adresse (RDC)", "Avenue Mama Yemo, Lubumbashi, République Démocratique du Congo"],
            ["Siège social (Maroc)", "STERKTE RECORDS SARL-AU — [adresse Agadir]"],
          ],
        },
      },
      {
        heading: "3. Hébergement",
        paragraphs: [
          "Le site est hébergé par [nom de l'hébergeur à compléter — Vercel Inc. au moment de la rédaction de ce document], [adresse de l'hébergeur].",
        ],
      },
      {
        heading: "4. Propriété intellectuelle",
        paragraphs: [
          "L'ensemble des contenus présents sur le site (textes, images, sons, vidéos, logos, charte graphique, code source) est la propriété exclusive de Sterkte Records ou de ses partenaires. Toute reproduction, distribution ou utilisation sans autorisation écrite est strictement interdite.",
        ],
      },
      {
        heading: "5. Documents contractuels",
        paragraphs: [
          "L'utilisation de la plateforme est encadrée par nos Conditions Générales d'Utilisation et notre Politique de confidentialité, accessibles depuis le pied de page de chaque page du site.",
        ],
      },
    ],
  },
  en: {
    sections: [
      {
        heading: "1. Site publisher",
        paragraphs: [
          "The website www.sterkterecords.com is published by STERKTE RECORDS SARL-AU, a company registered in Agadir, Morocco (ICE: [ICE number to be completed]), with its registered office at [Agadir headquarters address].",
          "Sterkte Records is an independent digital music label and distributor, founded in 2020 in Lubumbashi, Democratic Republic of Congo.",
          "Legal representative: Axel l'or Kaumba, Founder.",
        ],
      },
      {
        heading: "2. Contact",
        table: {
          headers: ["Channel", "Details"],
          rows: [
            ["Email", "contact.sterkterecords@gmail.com"],
            ["Phone / WhatsApp", "+243 850 510 209"],
            ["Address (DRC)", "Avenue Mama Yemo, Lubumbashi, Democratic Republic of Congo"],
            ["Registered office (Morocco)", "STERKTE RECORDS SARL-AU — [Agadir address]"],
          ],
        },
      },
      {
        heading: "3. Hosting",
        paragraphs: [
          "The site is hosted by [hosting provider name to be completed — Vercel Inc. at the time of writing this document], [hosting provider address].",
        ],
      },
      {
        heading: "4. Intellectual property",
        paragraphs: [
          "All content on the site (text, images, audio, video, logos, visual identity, source code) is the exclusive property of Sterkte Records or its partners. Any reproduction, distribution or use without written authorization is strictly prohibited.",
        ],
      },
      {
        heading: "5. Contractual documents",
        paragraphs: [
          "Use of the platform is governed by our Terms of Use and our Privacy Policy, accessible from the footer of every page on the site.",
        ],
      },
    ],
  },
};
