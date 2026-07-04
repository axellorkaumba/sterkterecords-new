import type { LegalDocumentByLocale } from "@/content/legal-types";

/**
 * CGU — texte canonique fourni par Axel l'or Kaumba (v1.0, juillet 2026),
 * reproduit intégralement. Ne pas raccourcir un article sans validation
 * explicite : ce texte engage juridiquement Sterkte Records.
 */
export const legalCgu: LegalDocumentByLocale = {
  fr: {
    paragraphs: [
      "STERKTE RECORDS s'engage à des conditions générales claires, honnêtes et entièrement en faveur de l'artiste. Ce document est rédigé en français simple — pas en jargon juridique opaque.",
      "• Tu gardes 100% de tes droits sur tes masters et tes compositions",
      "• Tu sais exactement combien tu vas toucher et quand",
      "• Tu peux partir à tout moment avec ton catalogue et ton historique de streams",
      "• Aucune clause cachée, aucun frais surprise, aucune condition unilatérale",
    ],
    sections: [
      {
        heading: "1. Qui sommes-nous ?",
        paragraphs: [
          "STERKTE RECORDS est un label et distributeur de musique numérique indépendant fondé en 2021 à Lubumbashi, République Démocratique du Congo. Sterkte Records est exploité par la société STERKTE RECORDS SARL-AU, immatriculée à Agadir, Maroc (ICE : [numéro ICE SARL-AU à compléter]).",
          "Nous distribuons la musique d'artistes indépendants et de labels sur plus de 50 plateformes de streaming et de téléchargement dans le monde entier, dont Spotify, Apple Music, Deezer, Boomplay, YouTube Music, Audiomack, TikTok, et Amazon Music.",
          "Notre mission : permettre à chaque artiste d'Afrique francophone et du monde entier d'accéder à une distribution numérique professionnelle, transparente, et humaine — sans barrière technique, linguistique ou financière.",
          "Contact : STERKTE RECORDS SARL-AU — Adresse : [adresse siège Agadir] — Email : [email contact] — WhatsApp : [numéro WhatsApp] — Site web : sterkterecords.com",
        ],
      },
      {
        heading: "2. Définitions",
        table: {
          headers: ["Terme", "Signification"],
          rows: [
            [
              "Sterkte Records / Nous",
              "La société STERKTE RECORDS SARL-AU, opérant la plateforme de distribution musicale.",
            ],
            [
              "Artiste / Vous",
              "Toute personne physique ou morale titulaire d'un compte sur la plateforme Sterkte Records.",
            ],
            [
              "Plateforme",
              "Le site web et/ou l'application Sterkte Records depuis lesquels vous accédez à nos services.",
            ],
            [
              "DSP",
              "Digital Service Provider : toute plateforme de streaming ou de téléchargement (Spotify, Apple Music, Boomplay, etc.)",
            ],
            [
              "Enregistrement / Master",
              "Le fichier audio d'un titre musical tel que fourni par l'Artiste pour distribution.",
            ],
            [
              "Release / Sortie",
              "Un single, un EP ou un album constitué d'un ou plusieurs Enregistrements.",
            ],
            [
              "ISRC",
              "International Standard Recording Code : code unique identifiant chaque Enregistrement.",
            ],
            ["UPC", "Universal Product Code : code unique identifiant chaque Release."],
            [
              "Royalties",
              "Les sommes dues à l'Artiste au titre des exploitations de ses Enregistrements sur les DSP.",
            ],
            [
              "Revenus Bruts",
              "L'ensemble des sommes effectivement perçues par Sterkte Records des DSP au titre des Enregistrements de l'Artiste.",
            ],
            [
              "Revenus Nets",
              "Les Revenus Bruts après déduction des Frais Techniques (commissions DSP et agrégateur technique).",
            ],
            [
              "Frais Techniques",
              "Les commissions prélevées par notre agrégateur technique (LabelGrid) et/ou les DSP sur les flux de revenus.",
            ],
            [
              "Mandat de distribution",
              "L'autorisation que vous nous confiez de distribuer vos Enregistrements pour votre compte.",
            ],
            ["Plan", "Le niveau d'abonnement souscrit par l'Artiste (Free, Artist, Pro ou Label)."],
          ],
        },
      },
      {
        heading: "3. Objet des présentes CGU",
        paragraphs: [
          "Les présentes Conditions Générales d'Utilisation (« CGU ») définissent les modalités d'accès et d'utilisation de la plateforme Sterkte Records, ainsi que les droits et obligations respectifs de Sterkte Records et de l'Artiste dans le cadre de la distribution numérique de ses Enregistrements.",
          "En créant un compte sur la plateforme ou en utilisant nos services, vous acceptez sans réserve les présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser la plateforme.",
          "Les présentes CGU s'appliquent conjointement au contrat de distribution signé entre vous et Sterkte Records. En cas de contradiction entre les deux documents, le contrat de distribution individuel prévaut.",
        ],
      },
      {
        heading: "4. Inscription et compte artiste",
        paragraphs: [
          "4.1 Conditions d'inscription",
          "• Vous devez être âgé(e) d'au moins 18 ans ou disposer de l'autorisation de votre représentant légal.",
          "• Vous devez fournir des informations exactes, complètes et à jour lors de la création de votre compte.",
          "• Un compte ne peut représenter qu'une seule entité (artiste ou label). Tout compte créé pour contourner une suspension ou une résiliation est interdit.",
          "4.2 Sécurité du compte",
          "Vous êtes seul(e) responsable de la confidentialité de vos identifiants de connexion et de toutes les actions effectuées depuis votre compte. En cas d'accès non autorisé, vous devez nous en informer immédiatement à l'adresse [email contact].",
          "4.3 Vérification d'identité (KYC)",
          "Pour activer la distribution et recevoir vos royalties, nous sommes tenus de vérifier votre identité. Vous devrez fournir une copie de votre pièce d'identité nationale ou de votre passeport. Ces informations sont traitées conformément à notre politique de protection des données (Article 19).",
        ],
      },
      {
        heading: "5. Nos services de distribution",
        paragraphs: [
          "5.1 Ce que nous faisons pour vous",
          "• Livraison de vos Enregistrements sur les DSP sélectionnés dans votre compte.",
          "• Attribution ou gestion des codes ISRC (par titre) et UPC (par Release) selon votre plan.",
          "• Vérification des métadonnées avant chaque livraison.",
          "• Collecte des Revenus Bruts auprès des DSP pour votre compte.",
          "• Production de relevés de royalties trimestriels détaillés.",
          "• Reversement de votre part de royalties selon les modalités de l'Article 9.",
          "• Accès à un tableau de bord analytics pour suivre vos streams et vos revenus en temps réel.",
          "5.2 Nos plans tarifaires",
        ],
        table: {
          headers: ["Plan", "Prix", "Split artiste", "Inclus", "Sorties"],
          rows: [
            [
              "Sterkte Free",
              "0 €",
              "70 % des revenus nets",
              "Distribution sur 5 DSP majeurs",
              "1 single/an",
            ],
            [
              "Sterkte Artist",
              "15 €/an",
              "75 % des revenus nets",
              "50+ DSP dont Boomplay · Analytics",
              "Illimitées",
            ],
            [
              "Sterkte Pro",
              "35 €/an",
              "80 % des revenus nets",
              "Tout Artist + Pitching + Content ID",
              "Illimitées",
            ],
            [
              "Sterkte Label",
              "99 €/an",
              "85 % des revenus nets",
              "Tout Pro + Multi-artistes (5) + Support prioritaire",
              "Illimitées",
            ],
          ],
        },
      },
      {
        heading: "6. Ce que tu gardes — tes droits",
        paragraphs: [
          "POINT FONDAMENTAL — À lire absolument :",
          "• Tu es et tu restes le seul propriétaire de tes masters (enregistrements sonores).",
          "• Tu es et tu restes le seul propriétaire de tes droits d'auteur (compositions, paroles).",
          "• Sterkte Records ne te demande PAS de céder tes droits. Jamais.",
          "• Nous agissons uniquement comme mandataire — nous distribuons en ton nom, pour ton compte.",
          "• Si tu quittes Sterkte Records, tu repars avec 100% de tes droits et ton catalogue.",
          "• Tes codes ISRC restent attachés à tes titres même si tu changes de distributeur.",
          "Contrairement à certains contrats de l'industrie musicale, Sterkte Records ne demande aucune cession de droits, aucun co-publishing, et aucun partage de droits d'auteur. Le contrat de distribution est un mandat de service — rien de plus.",
        ],
      },
      {
        heading: "7. Ce que tu nous confies — le mandat de distribution",
        paragraphs: [
          "En nous confiant tes Enregistrements, tu nous accordes les droits suivants, strictement limités à l'exécution de nos services de distribution :",
          "• Le droit de reproduire, d'encoder et de convertir tes Enregistrements dans les formats techniques requis par chaque DSP.",
          "• Le droit de livrer tes Enregistrements et leurs métadonnées aux DSP sélectionnés.",
          "• Le droit de collecter les Revenus Bruts générés par l'exploitation de tes Enregistrements sur ces DSP, pour le compte de votre compte.",
          "• Le droit de communiquer ton nom d'artiste et tes informations de profil aux DSP dans le cadre de la livraison.",
          "Ce mandat est :",
          "• Non exclusif (sauf stipulation contraire dans ton contrat individuel) — tu peux distribuer tes Enregistrements via d'autres distributeurs simultanément.",
          "• Limité dans le temps — il prend fin à la résiliation du contrat de distribution (Article 15).",
          "• Révocable — tu peux le révoquer à tout moment en respectant le préavis contractuel.",
        ],
      },
      {
        heading: "8. Répartition des revenus et royalties",
        paragraphs: ["8.1 Calcul des revenus"],
        table: {
          headers: ["Étape de calcul", "Montant (exemple)"],
          rows: [
            ["Revenus Bruts perçus des DSP", "100,00 €"],
            ["− Frais Techniques (agrégateur / DSP — environ 5%)", "− 5,00 €"],
            ["= Revenus Nets", "95,00 €"],
            ["Part artiste — Plan Artist (75% des Revenus Nets)", "71,25 €"],
            ["Part Sterkte Records (25% des Revenus Nets)", "23,75 €"],
          ],
        },
      },
      {
        heading: "8.2 Revenus UGC / Content ID",
        paragraphs: [
          "Les revenus issus de la monétisation UGC (YouTube Content ID, TikTok, Instagram/Meta) sont soumis à des frais spécifiques prélevés par les plateformes (généralement 20%). Après déduction de ces frais, le solde net est réparti selon la même clé de partage que les revenus DSP standard.",
        ],
      },
      {
        heading: "8.3 Transparence totale",
        paragraphs: [
          "Chaque relevé trimestriel que nous te transmettons inclut, pour chaque plateforme et chaque titre :",
          "• Le nombre de streams ou téléchargements",
          "• Les Revenus Bruts perçus",
          "• Le détail des Frais Techniques déduits",
          "• Les Revenus Nets",
          "• Ta part (selon ton plan)",
          "• Le montant effectivement versé ou en attente",
        ],
      },
      {
        heading: "9. Facturation et paiement",
        paragraphs: [
          "9.1 Abonnements (plans payants)",
          "• Les plans Artist, Pro et Label sont facturés annuellement, d'avance, en euros.",
          "• Le paiement est effectué par carte bancaire, Mobile Money (Airtel Money, Wave) ou virement selon les options disponibles dans ton pays.",
          "• Aucun remboursement n'est accordé pour une période entamée, sauf en cas de faute exclusive de Sterkte Records.",
          "9.2 Reversement des royalties",
          "• Les royalties sont reversées trimestriellement, dans les 30 jours suivant la clôture de chaque trimestre.",
          "• Un seuil minimum de versement de 25 USD (ou équivalent en MAD ou CDF) s'applique. En deçà de ce seuil, le solde est reporté sur la période suivante.",
          "• Les frais de transfert éventuels sont communiqués à l'avance et déduits du montant reversé.",
          "9.3 Délai de contestation",
          "Tu disposes de 30 jours calendaires à compter de la réception de ton relevé trimestriel pour contester les chiffres par email. Passé ce délai, le relevé est réputé accepté.",
        ],
      },
      {
        heading: "10. Délais de livraison et de mise en ligne",
        paragraphs: [
          "Sterkte Records s'engage à soumettre tes Enregistrements aux DSP dans un délai de 5 à 7 jours ouvrés à compter de la validation complète de ta Release (fichiers audio conformes + métadonnées complètes + contrat signé).",
          "Délais de mise en ligne par plateforme (indicatifs) :",
          "• Spotify : 3 à 7 jours ouvrés",
          "• Apple Music : 3 à 7 jours ouvrés",
          "• Deezer : 3 à 7 jours ouvrés",
          "• Boomplay : 5 à 10 jours ouvrés",
          "• YouTube Music / Content ID : 5 à 14 jours ouvrés",
          "• TikTok / Instagram : 5 à 14 jours ouvrés",
          "Ces délais dépendent des processus de validation propres à chaque DSP et peuvent varier. Nous recommandons de soumettre tes Releases au moins 3 semaines avant la date de sortie souhaitée.",
          "Sterkte Records ne peut être tenu responsable des retards imputables aux DSP eux-mêmes, notamment en cas de rejet de métadonnées, de queue de livraison ou de mise à jour des politiques de contenu des plateformes.",
        ],
      },
      {
        heading: "11. Tes obligations en tant qu'artiste",
        paragraphs: [
          "11.1 Droits sur les Enregistrements",
          "En soumettant un Enregistrement à Sterkte Records, tu déclares et garantis que :",
          "• Tu es le propriétaire ou le titulaire des droits sur l'Enregistrement et sur les compositions musicales qu'il contient.",
          "• Tu disposes de toutes les autorisations nécessaires pour les samples, featurings, reprises (covers), interpolations ou tout autre élément d'un tiers.",
          "• La distribution de cet Enregistrement ne porte atteinte à aucun droit de tiers (droits d'auteur, droits voisins, droits à l'image, etc.).",
          "11.2 Qualité des fichiers et métadonnées",
          "• Fournis des masters audio en WAV ou FLAC (16 bits / 44,1 kHz minimum). Les fichiers MP3 ne sont pas acceptés comme masters.",
          "• Fournis une pochette en format carré (JPEG ou PNG, 3000 × 3000 px minimum). Aucune URL, logo de réseau social, ou mention « Nouveau » sur l'image.",
          "• Renseigne des métadonnées exactes : orthographe du nom d'artiste, titres, crédits (auteur, compositeur, producteur), langue, genre.",
          "• Utilise le même nom d'artiste que sur tes profils DSP existants — un nom différent crée un profil artiste dupliqué.",
          "11.3 Streaming artificiel",
          "Tu t'engages formellement à ne jamais recourir à des techniques de streaming artificiel (bots, achats de streams, playlists d'incentive, services de type « pay-per-stream »). Toute violation de cette obligation entraîne la résiliation immédiate du contrat et le gel des royalties en attente, sans préjudice de nos droits à dommages et intérêts.",
        ],
      },
      {
        heading: "12. Ce que nous ne distribuons pas",
        paragraphs: [
          "Sterkte Records se réserve le droit de refuser ou retirer tout Enregistrement qui :",
          "• Contient des éléments violant les droits d'auteur ou les droits voisins de tiers (samples non autorisés, reprises sans licence, etc.)",
          "• Contient des contenus illégaux, haineux, discriminatoires, diffamatoires, ou à caractère pornographique explicite",
          "• Est une reprise (cover) sans justification de licence mécanique",
          "• Constitue du karaoké, un sosie sonore (soundalike), ou une version instrumentale d'un titre commercial sans autorisation",
          "• Est déclaré comme appartenant au domaine public sans preuves suffisantes",
          "• Contient des éléments d'impersonation (usurpation d'identité d'un autre artiste ou d'une marque)",
          "• Fait l'objet d'une réclamation de droits active non résolue sur une autre plateforme",
          "En cas de refus, nous t'en informons par email dans les 48 heures ouvrées suivant la soumission, avec une explication claire des raisons du refus.",
        ],
      },
      {
        heading: "13. Contenu généré par intelligence artificielle (IA)",
        paragraphs: [
          "Sterkte Records prend très au sérieux la question du contenu généré par IA, conformément aux exigences des DSP qui évoluent rapidement en 2026.",
        ],
        table: {
          headers: ["Catégorie", "Accepté ?", "Conditions"],
          rows: [
            ["Aucune IA (humain 100%)", "Oui", "Déclaration standard"],
            [
              "Assisté par IA (production, mastering, mix)",
              "Oui",
              "Déclaration obligatoire + tu dois détenir les droits commerciaux sur l'output IA",
            ],
            [
              "Voix clonée ou synthétisée par IA",
              "Limité",
              "Autorisé uniquement avec consentement écrit de la personne dont la voix est utilisée",
            ],
            [
              "Génération IA complète (audio + paroles générés par IA sans intervention humaine créative)",
              "Non",
              "Non accepté actuellement — incompatible avec les politiques DSP actuelles",
            ],
          ],
        },
      },
      {
        heading: "13. Contenu IA — déclaration",
        paragraphs: [
          "Pour chaque Enregistrement soumis, tu dois déclarer la catégorie applicable. Une fausse déclaration engage ta seule responsabilité. Sterkte Records transmet ces informations aux DSP conformément à leurs exigences.",
        ],
      },
      {
        heading: "14. Retrait de ta musique",
        paragraphs: [
          "14.1 Retrait à ta demande",
          "Tu peux demander le retrait de tout ou partie de tes Enregistrements des DSP à tout moment, depuis ton espace compte ou par email. Le retrait effectif intervient dans un délai de 7 à 30 jours ouvrés selon les DSP concernés.",
          "14.2 Ce qui se passe après le retrait",
          "• Les royalties générées jusqu'à la date effective de retrait te sont versées dans le prochain relevé trimestriel.",
          "• Tes codes ISRC restent attachés à tes titres — tu n'as pas besoin de les réattribuer si tu changes de distributeur.",
          "• Sterkte Records ne conserve aucune copie de tes masters après la fin du contrat.",
          "14.3 Retrait initié par Sterkte Records",
          "Sterkte Records peut être contraint de retirer un Enregistrement des DSP en cas de réclamation légitime de droits, de rejet par un DSP, ou de violation avérée des présentes CGU. Tu en seras notifié(e) immédiatement et tu disposeras d'un délai de 30 jours pour régulariser la situation.",
        ],
      },
      {
        heading: "15. Résiliation du contrat",
        paragraphs: [
          "15.1 Par toi",
          "Tu peux résilier ton contrat de distribution à tout moment en nous notifiant par email, avec un préavis de 60 jours. Passé ce délai, nous procédons au retrait de tes Enregistrements et à la clôture de ton compte.",
          "15.2 Par Sterkte Records",
          "Sterkte Records peut résilier le contrat en cas de manquement grave non réparé dans les 30 jours suivant une mise en demeure écrite, notamment en cas de streaming artificiel, de fausse déclaration de droits, ou de non-paiement de l'abonnement.",
          "15.3 Effets de la résiliation",
          "• La résiliation ne porte pas sur les royalties acquises — tu continues à percevoir tes revenus pour les streams enregistrés jusqu'à la date de retrait effectif.",
          "• Tes droits sur tes Enregistrements ne sont pas affectés par la résiliation.",
          "• Tu peux te réinscrire à tout moment, sauf en cas de résiliation pour motif grave.",
        ],
      },
      {
        heading: "16. Ce qui se passe si tu ne paies plus (plan payant)",
        paragraphs: [
          "Différence fondamentale avec DistroKid : chez DistroKid, si tu arrêtes de payer, ta musique est retirée de toutes les plateformes. Chez Sterkte Records, ce n'est pas aussi simple que ça.",
          "• Si ton abonnement expire, ton compte bascule automatiquement sur le plan Free.",
          "• Sur le plan Free, tu conserves jusqu'à 1 single actif — les autres sorties passent en statut « suspendu ».",
          "• Les sorties « suspendues » ne sont PAS retirées immédiatement des DSP.",
          "• Tu disposes de 90 jours pour renouveler ou transférer tes Enregistrements avant tout retrait.",
          "• Tes royalties continuent de s'accumuler pendant cette période et te sont versées normalement.",
          "Au-delà de 90 jours sans renouvellement ni action de ta part, les sorties « suspendues » peuvent être retirées des DSP.",
          "Cette politique est délibérément plus protectrice que celle de nos concurrents. Nous ne voulons pas que la musique que tu as construite pendant des années disparaisse du jour au lendemain parce que tu as oublié de renouveler un abonnement.",
        ],
      },
      {
        heading: "17. Responsabilités et limites",
        paragraphs: [
          "17.1 Nos engagements",
          "• Sterkte Records s'engage à mettre en œuvre tous les moyens raisonnables pour livrer tes Enregistrements dans les délais indiqués et collecter tes royalties.",
          "• Nous nous engageons à te communiquer des relevés exacts et vérifiables dans les délais prévus.",
          "17.2 Nos limites",
          "Sterkte Records ne peut être tenu responsable :",
          "• Des décisions unilatérales des DSP (retrait de playlists, modification d'algorithmes, changement de politique de rémunération).",
          "• Des interruptions ou retards de service imputables aux DSP ou à notre agrégateur technique.",
          "• Des pertes de revenus résultant d'une suspension imposée par un DSP suite à une violation des droits de tiers liée à tes Enregistrements.",
          "17.3 Garantie artiste",
          "Tu garantis Sterkte Records contre toute réclamation, poursuite ou dommage découlant de la violation de tes déclarations et garanties (notamment sur les droits et l'authenticité des Enregistrements soumis). Tu es seul(e) responsable des conséquences d'une fausse déclaration.",
        ],
      },
      {
        heading: "18. Propriété intellectuelle — notre plateforme",
        paragraphs: [
          "La plateforme Sterkte Records (site web, application, charte graphique, logo, code source) est la propriété exclusive de STERKTE RECORDS SARL-AU et est protégée par les lois marocaines et internationales sur la propriété intellectuelle.",
          "Tu n'acquiers aucun droit de propriété sur la plateforme. L'accès qui t'est accordé est personnel, non exclusif et non transférable.",
        ],
      },
      {
        heading: "19. Données personnelles et vie privée",
        paragraphs: [
          "Sterkte Records collecte et traite tes données personnelles dans le strict respect du Règlement Général sur la Protection des Données (RGPD) et de la loi marocaine 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel.",
          "19.1 Données collectées",
          "• Données d'identité : nom, prénom, nom d'artiste, pièce d'identité (pour KYC).",
          "• Données de contact : email, numéro de téléphone/WhatsApp.",
          "• Données financières : coordonnées bancaires ou Mobile Money pour les reversements.",
          "• Données d'utilisation : statistiques de streams, comportement sur la plateforme.",
          "19.2 Utilisation des données",
          "• Exécution du contrat de distribution et versement de tes royalties.",
          "• Vérification d'identité (KYC) conformément aux obligations légales.",
          "• Communication sur l'état de tes distributions et relevés.",
          "• Amélioration de nos services.",
          "19.3 Tes droits",
          "Tu disposes d'un droit d'accès, de rectification, d'effacement, de portabilité et d'opposition sur tes données personnelles. Pour exercer ces droits, contacte-nous à [email DPO/contact].",
          "Sterkte Records ne vend jamais tes données personnelles à des tiers. Sterkte Records n'affiche pas de publicités sur sa plateforme. Tes données de streaming ne sont jamais transmises à des tiers à des fins commerciales.",
        ],
      },
      {
        heading: "20. Modification des présentes CGU",
        paragraphs: [
          "Sterkte Records se réserve le droit de modifier les présentes CGU à tout moment. En cas de modification substantielle, nous t'en informons par email au moins 30 jours avant l'entrée en vigueur des nouvelles conditions.",
          "Différence avec DistroKid et TuneCore : DistroKid et TuneCore peuvent modifier leurs CGU « à tout moment, sans préavis ». Chez Sterkte Records, toute modification substantielle est notifiée 30 jours à l'avance. Tu as le droit de refuser les nouvelles conditions et de résilier sans pénalité pendant cette période.",
          "Si tu continues à utiliser la plateforme après l'entrée en vigueur des nouvelles CGU, tu es réputé(e) les avoir acceptées. Si tu les refuses, tu peux résilier ton contrat sans pénalité dans le délai de 30 jours.",
        ],
      },
      {
        heading: "21. Droit applicable et litiges",
        paragraphs: [
          "Les présentes CGU sont régies par le droit marocain. En cas de litige, les Parties s'efforceront en premier lieu de trouver une solution amiable dans un délai de 30 jours.",
          "À défaut d'accord amiable, le différend sera soumis aux tribunaux compétents d'Agadir (Maroc), sauf disposition légale contraire applicable dans le pays de l'Artiste.",
          "Note pour les artistes résidant dans l'Union Européenne : vous pouvez également recourir à la plateforme européenne de règlement en ligne des litiges accessible à l'adresse ec.europa.eu/consumers/odr.",
        ],
      },
      {
        heading: "22. Contact",
        paragraphs: [
          "Pour toute question relative aux présentes CGU, à ta distribution, à tes royalties ou à tes données personnelles :",
        ],
        table: {
          headers: ["Canal", "Coordonnées"],
          rows: [
            ["Email général", "contact.sterkterecords@gmail.com"],
            ["WhatsApp support", "+243 850 510 209"],
            ["Adresse postale", "STERKTE RECORDS SARL-AU — [adresse Agadir]"],
            ["Site web", "sterkterecords.com"],
          ],
        },
      },
    ],
  },
  en: {
    paragraphs: [
      "STERKTE RECORDS commits to clear, honest terms that fully favor the artist. This document is written in plain language — not opaque legal jargon.",
      "• You keep 100% of the rights to your masters and compositions",
      "• You know exactly how much you'll earn and when",
      "• You can leave at any time with your catalog and streaming history",
      "• No hidden clauses, no surprise fees, no one-sided terms",
    ],
    sections: [
      {
        heading: "1. Who we are",
        paragraphs: [
          "STERKTE RECORDS is an independent digital music label and distributor founded in 2021 in Lubumbashi, Democratic Republic of Congo. Sterkte Records is operated by STERKTE RECORDS SARL-AU, registered in Agadir, Morocco (ICE: [SARL-AU ICE number to be completed]).",
          "We distribute music from independent artists and labels to more than 50 streaming and download platforms worldwide, including Spotify, Apple Music, Deezer, Boomplay, YouTube Music, Audiomack, TikTok, and Amazon Music.",
          "Our mission: give every artist from Francophone Africa and around the world access to professional, transparent, human digital distribution — with no technical, language, or financial barrier.",
          "Contact: STERKTE RECORDS SARL-AU — Address: [Agadir headquarters address] — Email: [contact email] — WhatsApp: [WhatsApp number] — Website: sterkterecords.com",
        ],
      },
      {
        heading: "2. Definitions",
        table: {
          headers: ["Term", "Meaning"],
          rows: [
            [
              "Sterkte Records / We",
              "STERKTE RECORDS SARL-AU, operator of the music distribution platform.",
            ],
            [
              "Artist / You",
              "Any individual or legal entity holding an account on the Sterkte Records platform.",
            ],
            [
              "Platform",
              "The Sterkte Records website and/or application through which you access our services.",
            ],
            [
              "DSP",
              "Digital Service Provider: any streaming or download platform (Spotify, Apple Music, Boomplay, etc.)",
            ],
            [
              "Recording / Master",
              "The audio file of a music track as provided by the Artist for distribution.",
            ],
            ["Release", "A single, EP, or album made up of one or more Recordings."],
            [
              "ISRC",
              "International Standard Recording Code: a unique code identifying each Recording.",
            ],
            ["UPC", "Universal Product Code: a unique code identifying each Release."],
            [
              "Royalties",
              "Amounts owed to the Artist for the exploitation of their Recordings on DSPs.",
            ],
            [
              "Gross Revenue",
              "All amounts actually received by Sterkte Records from DSPs for the Artist's Recordings.",
            ],
            [
              "Net Revenue",
              "Gross Revenue after deduction of Technical Fees (DSP and technical aggregator commissions).",
            ],
            [
              "Technical Fees",
              "Commissions charged by our technical aggregator (LabelGrid) and/or DSPs on revenue flows.",
            ],
            [
              "Distribution mandate",
              "The authorization you give us to distribute your Recordings on your behalf.",
            ],
            ["Plan", "The subscription tier chosen by the Artist (Free, Artist, Pro, or Label)."],
          ],
        },
      },
      {
        heading: "3. Purpose of these Terms",
        paragraphs: [
          'These Terms of Use ("Terms") set out the conditions of access to and use of the Sterkte Records platform, along with the respective rights and obligations of Sterkte Records and the Artist regarding the digital distribution of their Recordings.',
          "By creating an account on the platform or using our services, you accept these Terms without reservation. If you do not accept these Terms, you must not use the platform.",
          "These Terms apply together with the distribution agreement signed between you and Sterkte Records. In case of contradiction between the two documents, the individual distribution agreement prevails.",
        ],
      },
      {
        heading: "4. Registration and artist account",
        paragraphs: [
          "4.1 Registration requirements",
          "• You must be at least 18 years old or have the authorization of your legal guardian.",
          "• You must provide accurate, complete and up-to-date information when creating your account.",
          "• An account may only represent a single entity (artist or label). Creating an account to bypass a suspension or termination is prohibited.",
          "4.2 Account security",
          "You are solely responsible for the confidentiality of your login credentials and for all actions taken from your account. If you suspect unauthorized access, notify us immediately at [contact email].",
          "4.3 Identity verification (KYC)",
          "To activate distribution and receive your royalties, we are required to verify your identity. You will need to provide a copy of your national ID or passport. This information is processed in accordance with our data protection policy (Article 19).",
        ],
      },
      {
        heading: "5. Our distribution services",
        paragraphs: [
          "5.1 What we do for you",
          "• Delivery of your Recordings to the DSPs selected in your account.",
          "• Assignment or management of ISRC (per track) and UPC (per Release) codes according to your plan.",
          "• Metadata verification before each delivery.",
          "• Collection of Gross Revenue from DSPs on your behalf.",
          "• Production of detailed quarterly royalty statements.",
          "• Payout of your share of royalties under the terms of Article 9.",
          "• Access to an analytics dashboard to track your streams and revenue in real time.",
          "5.2 Our pricing plans",
        ],
        table: {
          headers: ["Plan", "Price", "Artist split", "Included", "Releases"],
          rows: [
            [
              "Sterkte Free",
              "€0",
              "70% of net revenue",
              "Distribution to 5 major DSPs",
              "1 single/year",
            ],
            [
              "Sterkte Artist",
              "€15/year",
              "75% of net revenue",
              "50+ DSPs incl. Boomplay · Analytics",
              "Unlimited",
            ],
            [
              "Sterkte Pro",
              "€35/year",
              "80% of net revenue",
              "Everything in Artist + Pitching + Content ID",
              "Unlimited",
            ],
            [
              "Sterkte Label",
              "€99/year",
              "85% of net revenue",
              "Everything in Pro + Multi-artist (5) + Priority support",
              "Unlimited",
            ],
          ],
        },
      },
      {
        heading: "6. What you keep — your rights",
        paragraphs: [
          "Key point — please read carefully:",
          "• You are and remain the sole owner of your masters (sound recordings).",
          "• You are and remain the sole owner of your copyrights (compositions, lyrics).",
          "• Sterkte Records does NOT ask you to assign your rights. Ever.",
          "• We act solely as an agent — we distribute on your behalf and in your name.",
          "• If you leave Sterkte Records, you leave with 100% of your rights and your catalog.",
          "• Your ISRC codes stay attached to your tracks even if you switch distributors.",
          "Unlike some music industry contracts, Sterkte Records never asks for a rights assignment, co-publishing, or any share of copyright. The distribution agreement is a service mandate — nothing more.",
        ],
      },
      {
        heading: "7. What you entrust to us — the distribution mandate",
        paragraphs: [
          "By entrusting us with your Recordings, you grant us the following rights, strictly limited to performing our distribution services:",
          "• The right to reproduce, encode and convert your Recordings into the technical formats required by each DSP.",
          "• The right to deliver your Recordings and their metadata to the selected DSPs.",
          "• The right to collect the Gross Revenue generated by the exploitation of your Recordings on those DSPs, on behalf of your account.",
          "• The right to share your artist name and profile information with DSPs as part of delivery.",
          "This mandate is:",
          "• Non-exclusive (unless otherwise stated in your individual agreement) — you may distribute your Recordings through other distributors at the same time.",
          "• Time-limited — it ends upon termination of the distribution agreement (Article 15).",
          "• Revocable — you may revoke it at any time subject to the contractual notice period.",
        ],
      },
      {
        heading: "8. Revenue and royalty distribution",
        paragraphs: ["8.1 Revenue calculation"],
        table: {
          headers: ["Calculation step", "Amount (example)"],
          rows: [
            ["Gross Revenue received from DSPs", "€100.00"],
            ["− Technical Fees (aggregator / DSP — approx. 5%)", "− €5.00"],
            ["= Net Revenue", "€95.00"],
            ["Artist share — Artist Plan (75% of Net Revenue)", "€71.25"],
            ["Sterkte Records share (25% of Net Revenue)", "€23.75"],
          ],
        },
      },
      {
        heading: "8.2 UGC / Content ID revenue",
        paragraphs: [
          "Revenue from UGC monetization (YouTube Content ID, TikTok, Instagram/Meta) is subject to specific fees charged by those platforms (generally 20%). After deducting these fees, the net balance is split using the same revenue share as standard DSP revenue.",
        ],
      },
      {
        heading: "8.3 Full transparency",
        paragraphs: [
          "Every quarterly statement we send you includes, for each platform and each track:",
          "• Number of streams or downloads",
          "• Gross Revenue received",
          "• Breakdown of Technical Fees deducted",
          "• Net Revenue",
          "• Your share (based on your plan)",
          "• The amount actually paid out or pending",
        ],
      },
      {
        heading: "9. Billing and payment",
        paragraphs: [
          "9.1 Subscriptions (paid plans)",
          "• Artist, Pro and Label plans are billed annually, in advance, in euros.",
          "• Payment is made by credit card, Mobile Money (Airtel Money, Wave) or bank transfer, depending on the options available in your country.",
          "• No refund is granted for a period already started, except in case of fault exclusively attributable to Sterkte Records.",
          "9.2 Royalty payout",
          "• Royalties are paid out quarterly, within 30 days following the end of each quarter.",
          "• A minimum payout threshold of $25 (or equivalent in MAD or CDF) applies. Below this threshold, the balance is carried over to the next period.",
          "• Any transfer fees are disclosed in advance and deducted from the amount paid out.",
          "9.3 Dispute period",
          "You have 30 calendar days from receipt of your quarterly statement to dispute the figures by email. After this period, the statement is deemed accepted.",
        ],
      },
      {
        heading: "10. Delivery and release delays",
        paragraphs: [
          "Sterkte Records commits to submitting your Recordings to DSPs within 5 to 7 business days from full validation of your Release (compliant audio files + complete metadata + signed agreement).",
          "Indicative release delays by platform:",
          "• Spotify: 3 to 7 business days",
          "• Apple Music: 3 to 7 business days",
          "• Deezer: 3 to 7 business days",
          "• Boomplay: 5 to 10 business days",
          "• YouTube Music / Content ID: 5 to 14 business days",
          "• TikTok / Instagram: 5 to 14 business days",
          "These delays depend on each DSP's own validation process and may vary. We recommend submitting your Releases at least 3 weeks before your desired release date.",
          "Sterkte Records cannot be held responsible for delays attributable to the DSPs themselves, including metadata rejection, delivery queues, or platform content policy updates.",
        ],
      },
      {
        heading: "11. Your obligations as an artist",
        paragraphs: [
          "11.1 Rights in the Recordings",
          "By submitting a Recording to Sterkte Records, you represent and warrant that:",
          "• You are the owner or rights holder of the Recording and of the musical compositions it contains.",
          "• You hold all necessary authorizations for any samples, features, covers, interpolations or other third-party elements.",
          "• Distribution of this Recording does not infringe any third-party rights (copyright, neighboring rights, image rights, etc.).",
          "11.2 File and metadata quality",
          "• Provide audio masters in WAV or FLAC (16-bit / 44.1 kHz minimum). MP3 files are not accepted as masters.",
          '• Provide square artwork (JPEG or PNG, minimum 3000 × 3000 px). No URLs, social media logos, or "New" labels on the image.',
          "• Provide accurate metadata: artist name spelling, titles, credits (writer, composer, producer), language, genre.",
          "• Use the same artist name as on your existing DSP profiles — a different name creates a duplicate artist profile.",
          "11.3 Artificial streaming",
          'You formally commit to never using artificial streaming techniques (bots, purchased streams, incentivized playlists, "pay-per-stream" services). Any breach of this obligation results in immediate termination of the agreement and freezing of pending royalties, without prejudice to our right to seek damages.',
        ],
      },
      {
        heading: "12. What we do not distribute",
        paragraphs: [
          "Sterkte Records reserves the right to refuse or take down any Recording that:",
          "• Contains elements that infringe the copyright or neighboring rights of third parties (unauthorized samples, unlicensed covers, etc.)",
          "• Contains illegal, hateful, discriminatory, defamatory, or explicit pornographic content",
          "• Is a cover without proof of mechanical license",
          "• Constitutes karaoke, a soundalike, or an instrumental version of a commercial track without authorization",
          "• Is claimed to be in the public domain without sufficient evidence",
          "• Contains impersonation of another artist or brand",
          "• Is subject to an active, unresolved rights claim on another platform",
          "If refused, we will notify you by email within 48 business hours of submission, with a clear explanation of the reasons.",
        ],
      },
      {
        heading: "13. AI-generated content",
        paragraphs: [
          "Sterkte Records takes AI-generated content very seriously, in line with DSP requirements that are evolving rapidly in 2026.",
        ],
        table: {
          headers: ["Category", "Accepted?", "Conditions"],
          rows: [
            ["No AI (100% human)", "Yes", "Standard declaration"],
            [
              "AI-assisted (production, mastering, mixing)",
              "Yes",
              "Mandatory declaration + you must hold commercial rights to the AI output",
            ],
            [
              "AI-cloned or synthesized voice",
              "Limited",
              "Only permitted with written consent from the person whose voice is used",
            ],
            [
              "Fully AI-generated (audio + lyrics generated by AI with no human creative input)",
              "No",
              "Not currently accepted — incompatible with current DSP policies",
            ],
          ],
        },
      },
      {
        heading: "13. AI content — declaration",
        paragraphs: [
          "For each Recording submitted, you must declare the applicable category. A false declaration is your sole responsibility. Sterkte Records passes this information on to DSPs as required.",
        ],
      },
      {
        heading: "14. Taking down your music",
        paragraphs: [
          "14.1 Takedown at your request",
          "You may request the takedown of all or part of your Recordings from DSPs at any time, from your account area or by email. The takedown is completed within 7 to 30 business days depending on the DSPs involved.",
          "14.2 What happens after takedown",
          "• Royalties generated up to the effective takedown date are paid out in your next quarterly statement.",
          "• Your ISRC codes remain attached to your tracks — you do not need to reassign them if you switch distributors.",
          "• Sterkte Records retains no copy of your masters after the agreement ends.",
          "14.3 Takedown initiated by Sterkte Records",
          "Sterkte Records may be required to take down a Recording from DSPs in the event of a legitimate rights claim, a DSP rejection, or a proven breach of these Terms. You will be notified immediately and given 30 days to resolve the situation.",
        ],
      },
      {
        heading: "15. Termination of the agreement",
        paragraphs: [
          "15.1 By you",
          "You may terminate your distribution agreement at any time by notifying us by email, with 60 days' notice. After this period, we will take down your Recordings and close your account.",
          "15.2 By Sterkte Records",
          "Sterkte Records may terminate the agreement in the event of a serious breach not remedied within 30 days of a written notice, including artificial streaming, false declaration of rights, or non-payment of the subscription.",
          "15.3 Effects of termination",
          "• Termination does not affect royalties already earned — you continue to receive revenue for streams recorded up to the effective takedown date.",
          "• Your rights in your Recordings are not affected by termination.",
          "• You may re-register at any time, except in the case of termination for serious cause.",
        ],
      },
      {
        heading: "16. What happens if you stop paying (paid plan)",
        paragraphs: [
          "A key difference from DistroKid: at DistroKid, if you stop paying, your music is taken down from all platforms. At Sterkte Records, it's not that simple.",
          "• If your subscription expires, your account automatically switches to the Free plan.",
          '• On the Free plan, you keep up to 1 active single — other releases move to "suspended" status.',
          '• "Suspended" releases are NOT immediately taken down from DSPs.',
          "• You have 90 days to renew or transfer your Recordings before any takedown occurs.",
          "• Your royalties continue to accrue during this period and are paid out normally.",
          'After 90 days without renewal or action on your part, "suspended" releases may be taken down from DSPs.',
          "This policy is deliberately more protective than our competitors'. We don't want the music you've built over years to disappear overnight because you forgot to renew a subscription.",
        ],
      },
      {
        heading: "17. Liability and limitations",
        paragraphs: [
          "17.1 Our commitments",
          "• Sterkte Records commits to using all reasonable means to deliver your Recordings within the stated timeframes and collect your royalties.",
          "• We commit to providing you with accurate, verifiable statements within the agreed timeframes.",
          "17.2 Our limitations",
          "Sterkte Records cannot be held liable for:",
          "• Unilateral DSP decisions (playlist removal, algorithm changes, changes to compensation policy).",
          "• Service interruptions or delays attributable to DSPs or our technical aggregator.",
          "• Revenue losses resulting from a suspension imposed by a DSP following a third-party rights infringement related to your Recordings.",
          "17.3 Artist warranty",
          "You indemnify Sterkte Records against any claim, action or damage arising from a breach of your representations and warranties (in particular regarding the rights and authenticity of submitted Recordings). You are solely responsible for the consequences of a false declaration.",
        ],
      },
      {
        heading: "18. Intellectual property — our platform",
        paragraphs: [
          "The Sterkte Records platform (website, application, visual identity, logo, source code) is the exclusive property of STERKTE RECORDS SARL-AU and is protected under Moroccan and international intellectual property law.",
          "You acquire no ownership rights in the platform. The access granted to you is personal, non-exclusive, and non-transferable.",
        ],
      },
      {
        heading: "19. Personal data and privacy",
        paragraphs: [
          "Sterkte Records collects and processes your personal data in strict compliance with the General Data Protection Regulation (GDPR) and Moroccan law 09-08 on the protection of individuals with regard to the processing of personal data.",
          "19.1 Data collected",
          "• Identity data: first and last name, artist name, ID document (for KYC).",
          "• Contact data: email, phone/WhatsApp number.",
          "• Financial data: bank or Mobile Money details for payouts.",
          "• Usage data: streaming statistics, platform behavior.",
          "19.2 Use of data",
          "• Performance of the distribution agreement and payment of your royalties.",
          "• Identity verification (KYC) as required by law.",
          "• Communication about the status of your distributions and statements.",
          "• Improving our services.",
          "19.3 Your rights",
          "You have the right to access, rectify, erase, port, and object to the processing of your personal data. To exercise these rights, contact us at [DPO/contact email].",
          "Sterkte Records never sells your personal data to third parties. Sterkte Records does not display ads on its platform. Your streaming data is never shared with third parties for commercial purposes.",
        ],
      },
      {
        heading: "20. Changes to these Terms",
        paragraphs: [
          "Sterkte Records reserves the right to modify these Terms at any time. In the event of a material change, we will notify you by email at least 30 days before the new terms take effect.",
          'A difference from DistroKid and TuneCore: DistroKid and TuneCore may change their terms "at any time, without notice." At Sterkte Records, any material change is notified 30 days in advance. You have the right to refuse the new terms and terminate without penalty during this period.',
          "If you continue to use the platform after the new Terms take effect, you are deemed to have accepted them. If you refuse them, you may terminate your agreement without penalty within the 30-day period.",
        ],
      },
      {
        heading: "21. Governing law and disputes",
        paragraphs: [
          "These Terms are governed by Moroccan law. In the event of a dispute, the Parties will first seek an amicable solution within 30 days.",
          "Failing an amicable agreement, the dispute will be submitted to the competent courts of Agadir (Morocco), unless otherwise required by mandatory law applicable in the Artist's country.",
          "Note for artists residing in the European Union: you may also use the European online dispute resolution platform at ec.europa.eu/consumers/odr.",
        ],
      },
      {
        heading: "22. Contact",
        paragraphs: [
          "For any question regarding these Terms, your distribution, your royalties, or your personal data:",
        ],
        table: {
          headers: ["Channel", "Details"],
          rows: [
            ["General email", "contact.sterkterecords@gmail.com"],
            ["WhatsApp support", "+243 850 510 209"],
            ["Postal address", "STERKTE RECORDS SARL-AU — [Agadir address]"],
            ["Website", "sterkterecords.com"],
          ],
        },
      },
    ],
  },
};
