/**
 * Every word the edition renders, in the three languages the entrance offers.
 *
 * The older `portfolioContent` in src/data/portfolio.ts still serves the
 * legacy components and carries only Portuguese and English, so the edition
 * keeps its own copy here rather than half-translating through it.
 */
export type EditionLocale = "en" | "pt" | "fr";

export const LOCALES: { id: EditionLocale; label: string; note: string }[] = [
  { id: "en", label: "English", note: "EN" },
  { id: "pt", label: "Português", note: "PT" },
  { id: "fr", label: "Français", note: "FR" },
];

type Gloss = { word: string; gloss?: string; note?: string };

type Copy = {
  gate: {
    heading: string;
    language: string;
    enter: string;
    note: string;
    skip: string;
  };
  nav: { work: string; projects: string; about: string; contact: string; home: string };
  opening: { caption: string; role: string; place: string; selected: string; portrait: string };
  work: {
    title: string; titleEm: string; intro: string;
    lexuriKind: string; lexuriText: string; lexuriVisit: string;
    fluxoKind: string; fluxoText: string; github: string;
    more: string;
    clientTitle: string; clientTitleEm: string; visit: string;
    clients: { name: string; category: string; description: string }[];
  };
  about: { title: string; titleEm: string; lead: string; body: string; cta: string };
  closing: { status: string; title: string; titleEm: string; email: string; back: string };
  lexuri: { badge: string; meta: string; hint: string; play: string; pause: string; line: Gloss[] };
  fluxo: {
    month: string; all: string;
    categories: { food: string; home: string; travel: string; other: string };
    entries: { rent: string; metro: string; invoice: string; power: string };
  };
  archive: { slug: string; name: string; tech: string; description: string; links: { label: string; href: string }[] }[];
};

const ADECEM = "https://www.adecem.org/";
const C360 = "https://consumidor360.com.br/";
const LS_STORE = "https://ls-store.vercel.app/";
const TOTAL = "https://totalsuplements.com/";
const GITHUB = "https://github.com/natsouzax";

export const editionCopy: Record<EditionLocale, Copy> = {
  en: {
    gate: {
      heading: "Choose how you want to read this",
      language: "Language",
      enter: "Enter",
      note: "You can change the language later from the header.",
      skip: "Skip intro",
    },
    nav: { work: "Work", projects: "Projects", about: "About", contact: "Contact ↗", home: "odevntzn home" },
    opening: { caption: "Biometric portrait", role: "Full stack developer", place: "based in Portugal.", selected: "Selected work", portrait: "Holographic portrait of Natan. Drag or use the arrow keys to turn." },
    work: {
      title: "Selected", titleEm: "work.",
      intro: "Two products I designed and built, one for learning languages and one for managing money.",
      lexuriKind: "Language learning",
      lexuriText: "Pause on a phrase, hear how it sounds, then come back to it. I designed and built a way to study English through the videos you already watch.",
      lexuriVisit: "Visit Lexuri",
      fluxoKind: "Mobile product",
      fluxoText: "A personal finance app that brings accounts, goals and notes together. I shaped the product and built its mobile experience in React Native.",
      github: "My GitHub profile",
      more: "More projects",
      clientTitle: "Client", clientTitleEm: "work.", visit: "Visit",
      clients: [
        { name: "Consumidor 360", category: "Legal guidance", description: "A platform that helps consumers in Brazil describe a problem and get initial guidance on their rights. It is part of the legal ecosystem I built with ADECEM." },
        { name: "Wouky", category: "Subscription landing page", description: "A landing page and waitlist for a Portuguese dog subscription box with toys, treats and chews." },
      ],
    },
    about: {
      title: "About", titleEm: "me.",
      lead: "I’m Natan Oliveira. I design and build digital products in Portugal while studying Computer Engineering.",
      body: "On Lexuri, that means asking what happens when a learner pauses a video for one unfamiliar expression. The answer shapes the interface, the data I save and what comes back in their next review.",
      cta: "Get in touch",
    },
    closing: { status: "Open for collaborations", title: "Waiting", titleEm: "for you.", email: "Send me an email", back: "Back to top" },
    lexuri: {
      badge: "Demo track", meta: "English in context",
      hint: "Tap any highlighted word to keep it.", play: "Play", pause: "Pause",
      line: [
        { word: "Every" },
        { word: "word", gloss: "word", note: "noun · a single unit of language" },
        { word: "you" },
        { word: "said", gloss: "said", note: "past of “say”" },
        { word: "is" },
        { word: "still", gloss: "still", note: "adverb · continuing up to now" },
        { word: "playing", gloss: "playing", note: "from “play” · sounding, repeating" },
        { word: "in" },
        { word: "my" },
        { word: "head", gloss: "head", note: "idiom · “in my head” = in my mind" },
      ],
    },
    fluxo: {
      month: "November", all: "All",
      categories: { food: "Food", home: "Home", travel: "Travel", other: "Other" },
      entries: { rent: "Rent · Nov", metro: "Metro pass", invoice: "Lexuri invoice", power: "Electricity" },
    },
    archive: [
      { slug: "ls-store", name: "LS Store", tech: "Product Discovery", description: "Before implementation I immersed myself in the client's context and turned my understanding of the business into a navigable proposal, so they could see the vision and discuss priorities instead of receiving a technical quote.", links: [{ label: "Open proposal", href: LS_STORE }] },
      { slug: "legal-ecosystem", name: "ADECEM + Consumidor 360", tech: "Next.js", description: "ADECEM and Consumidor 360 are part of the same legal ecosystem delivered to a client. Development is ongoing, with expansion planned in partnership with me.", links: [{ label: "Visit ADECEM", href: ADECEM }, { label: "Visit Consumidor 360", href: C360 }] },
      { slug: "total-suplements", name: "Total Suplements", tech: "WordPress", description: "An e-commerce MVP created so a client could validate the idea before increasing the investment. The operation remains in validation, with further development planned.", links: [{ label: "Visit e-commerce", href: TOTAL }] },
      { slug: "x-content-bot", name: "X Content Automation Bot", tech: "Node.js", description: "An internship project automating content publication, built to run unattended and to be handed over to a team that did not write it.", links: [{ label: "View on GitHub", href: GITHUB }] },
    ],
  },

  pt: {
    gate: {
      heading: "Escolha como quer ler isto",
      language: "Idioma",
      enter: "Entrar",
      note: "Pode mudar o idioma depois, no cabeçalho.",
      skip: "Saltar introdução",
    },
    nav: { work: "Projetos", projects: "Produtos", about: "Sobre", contact: "Contacto ↗", home: "início odevntzn" },
    opening: { caption: "Retrato biométrico", role: "Desenvolvedor full stack", place: "baseado em Portugal.", selected: "Ver projetos", portrait: "Retrato holográfico do Natan. Arraste ou use as setas para girar." },
    work: {
      title: "Projetos", titleEm: "escolhidos.",
      intro: "Dois produtos que desenhei e construí: um para aprender línguas, outro para gerir dinheiro.",
      lexuriKind: "Aprender línguas",
      lexuriText: "Pare numa frase, ouça como soa e volte a ela depois. Desenhei e construí uma forma de estudar inglês através dos vídeos que já vê.",
      lexuriVisit: "Visitar o Lexuri",
      fluxoKind: "Produto mobile",
      fluxoText: "Uma app de finanças pessoais que junta contas, objetivos e notas. Defini o produto e construí a experiência mobile em React Native.",
      github: "O meu perfil no GitHub",
      more: "Mais projetos",
      clientTitle: "Trabalho", clientTitleEm: "para clientes.", visit: "Visitar",
      clients: [
        { name: "Consumidor 360", category: "Orientação jurídica", description: "Uma plataforma que ajuda consumidores no Brasil a descrever um problema e receber orientação inicial sobre os seus direitos. Faz parte do ecossistema jurídico que construí com a ADECEM." },
        { name: "Wouky", category: "Página de subscrição", description: "Uma landing page e lista de espera para uma caixa de subscrição portuguesa para cães, com brinquedos, snacks e mastigáveis." },
      ],
    },
    about: {
      title: "Sobre", titleEm: "mim.",
      lead: "Sou o Natan Oliveira. Desenho e construo produtos digitais em Portugal enquanto estudo Engenharia Informática.",
      body: "No Lexuri, isso significa perguntar o que acontece quando alguém pausa um vídeo por causa de uma expressão que não conhece. A resposta molda a interface, os dados que guardo e o que volta na revisão seguinte.",
      cta: "Falar comigo",
    },
    closing: { status: "Disponível para colaborações", title: "À espera", titleEm: "de si.", email: "Enviar-me um email", back: "Voltar ao topo" },
    lexuri: {
      badge: "Faixa de demonstração", meta: "Inglês em contexto",
      hint: "Toque numa palavra destacada para a guardar.", play: "Tocar", pause: "Pausa",
      line: [
        { word: "Every" },
        { word: "word", gloss: "palavra", note: "substantivo · uma unidade da língua" },
        { word: "you" },
        { word: "said", gloss: "disse", note: "passado de “say”" },
        { word: "is" },
        { word: "still", gloss: "ainda", note: "advérbio · que continua até agora" },
        { word: "playing", gloss: "a tocar", note: "de “play” · soar, repetir-se" },
        { word: "in" },
        { word: "my" },
        { word: "head", gloss: "cabeça", note: "expressão · “in my head” = na minha cabeça" },
      ],
    },
    fluxo: {
      month: "Novembro", all: "Tudo",
      categories: { food: "Alimentação", home: "Casa", travel: "Transportes", other: "Outros" },
      entries: { rent: "Renda · Nov", metro: "Passe de metro", invoice: "Fatura Lexuri", power: "Eletricidade" },
    },
    archive: [
      { slug: "ls-store", name: "LS Store", tech: "Product Discovery", description: "Antes de implementar, mergulhei no contexto do cliente e transformei o que percebi do negócio numa proposta navegável, para ele ver a visão e discutir prioridades em vez de receber um orçamento técnico.", links: [{ label: "Abrir proposta", href: LS_STORE }] },
      { slug: "legal-ecosystem", name: "ADECEM + Consumidor 360", tech: "Next.js", description: "O ADECEM e o Consumidor 360 fazem parte do mesmo ecossistema jurídico entregue a um cliente. O desenvolvimento continua, com expansão planeada em parceria comigo.", links: [{ label: "Visitar o ADECEM", href: ADECEM }, { label: "Visitar o Consumidor 360", href: C360 }] },
      { slug: "total-suplements", name: "Total Suplements", tech: "WordPress", description: "Um MVP de e-commerce criado para o cliente validar a ideia antes de aumentar o investimento. A operação continua em validação, com mais desenvolvimento previsto.", links: [{ label: "Visitar a loja", href: TOTAL }] },
      { slug: "x-content-bot", name: "X Content Automation Bot", tech: "Node.js", description: "Um projeto de estágio que automatiza a publicação de conteúdo, feito para correr sozinho e para ser entregue a uma equipa que não o escreveu.", links: [{ label: "Ver no GitHub", href: GITHUB }] },
    ],
  },

  fr: {
    gate: {
      heading: "Choisissez comment lire ce site",
      language: "Langue",
      enter: "Entrer",
      note: "Vous pourrez changer la langue depuis l’en-tête.",
      skip: "Passer l’intro",
    },
    nav: { work: "Projets", projects: "Produits", about: "À propos", contact: "Contact ↗", home: "accueil odevntzn" },
    opening: { caption: "Portrait biométrique", role: "Développeur full stack", place: "établi au Portugal.", selected: "Voir les projets", portrait: "Portrait holographique de Natan. Faites glisser ou utilisez les flèches pour le tourner." },
    work: {
      title: "Projets", titleEm: "choisis.",
      intro: "Deux produits que j’ai conçus et développés : un pour apprendre les langues, l’autre pour gérer son argent.",
      lexuriKind: "Apprentissage des langues",
      lexuriText: "Arrêtez-vous sur une phrase, écoutez comment elle sonne, puis revenez-y. J’ai conçu et développé une façon d’étudier l’anglais à travers les vidéos que vous regardez déjà.",
      lexuriVisit: "Voir Lexuri",
      fluxoKind: "Produit mobile",
      fluxoText: "Une application de finances personnelles qui réunit comptes, objectifs et notes. J’ai défini le produit et construit son expérience mobile en React Native.",
      github: "Mon profil GitHub",
      more: "Autres projets",
      clientTitle: "Travaux", clientTitleEm: "clients.", visit: "Voir",
      clients: [
        { name: "Consumidor 360", category: "Orientation juridique", description: "Une plateforme qui aide les consommateurs au Brésil à décrire un problème et à obtenir une première orientation sur leurs droits. Elle fait partie de l’écosystème juridique que j’ai construit avec ADECEM." },
        { name: "Wouky", category: "Page d’abonnement", description: "Une landing page et une liste d’attente pour une box d’abonnement portugaise pour chiens, avec jouets, friandises et à-mâcher." },
      ],
    },
    about: {
      title: "À propos", titleEm: "de moi.",
      lead: "Je suis Natan Oliveira. Je conçois et développe des produits numériques au Portugal, tout en étudiant le génie informatique.",
      body: "Sur Lexuri, cela revient à se demander ce qui se passe quand quelqu’un met une vidéo en pause pour une seule expression inconnue. La réponse façonne l’interface, les données que j’enregistre et ce qui revient à la révision suivante.",
      cta: "Me contacter",
    },
    closing: { status: "Ouvert aux collaborations", title: "En vous", titleEm: "attendant.", email: "M’envoyer un email", back: "Haut de page" },
    lexuri: {
      badge: "Piste de démo", meta: "L’anglais en contexte",
      hint: "Touchez un mot souligné pour le garder.", play: "Lecture", pause: "Pause",
      line: [
        { word: "Every" },
        { word: "word", gloss: "mot", note: "nom · une unité de la langue" },
        { word: "you" },
        { word: "said", gloss: "as dit", note: "passé de “say”" },
        { word: "is" },
        { word: "still", gloss: "encore", note: "adverbe · qui dure jusqu’à maintenant" },
        { word: "playing", gloss: "qui joue", note: "de “play” · résonner, se répéter" },
        { word: "in" },
        { word: "my" },
        { word: "head", gloss: "tête", note: "expression · “in my head” = dans ma tête" },
      ],
    },
    fluxo: {
      month: "Novembre", all: "Tout",
      categories: { food: "Courses", home: "Logement", travel: "Transports", other: "Autres" },
      entries: { rent: "Loyer · nov.", metro: "Pass métro", invoice: "Facture Lexuri", power: "Électricité" },
    },
    archive: [
      { slug: "ls-store", name: "LS Store", tech: "Product Discovery", description: "Avant de développer, je me suis plongé dans le contexte du client et j’ai transformé ma compréhension de son activité en une proposition navigable, pour qu’il voie la vision et discute des priorités au lieu de recevoir un devis technique.", links: [{ label: "Ouvrir la proposition", href: LS_STORE }] },
      { slug: "legal-ecosystem", name: "ADECEM + Consumidor 360", tech: "Next.js", description: "ADECEM et Consumidor 360 font partie du même écosystème juridique livré à un client. Le développement se poursuit, avec une extension prévue en partenariat avec moi.", links: [{ label: "Voir ADECEM", href: ADECEM }, { label: "Voir Consumidor 360", href: C360 }] },
      { slug: "total-suplements", name: "Total Suplements", tech: "WordPress", description: "Un MVP e-commerce créé pour qu’un client valide l’idée avant d’augmenter l’investissement. L’activité est encore en validation, d’autres développements sont prévus.", links: [{ label: "Voir la boutique", href: TOTAL }] },
      { slug: "x-content-bot", name: "X Content Automation Bot", tech: "Node.js", description: "Un projet de stage qui automatise la publication de contenu, conçu pour tourner sans surveillance et être repris par une équipe qui ne l’a pas écrit.", links: [{ label: "Voir sur GitHub", href: GITHUB }] },
    ],
  },
};
