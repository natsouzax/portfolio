import type { Locale } from "@/i18n/LanguageProvider";

export type LinkItem = {
  label: string;
  href: string;
  kind: "live" | "source" | "social" | "contact";
};

export type PortfolioCase = {
  slug:
    | "fluxo"
    | "ls-store"
    | "legal-ecosystem"
    | "total-suplements"
    | "x-content-bot";
  kind: "project" | "service" | "internship";
  name: string;
  eyebrow: string;
  description: string;
  detailLabel: string;
  contribution: string;
  technologies: readonly string[];
  links: readonly LinkItem[];
};

export type Capability = {
  number: string;
  title: string;
  description: string;
  technologies: readonly string[];
};

export type NavigationItem = {
  href: string;
  label: string;
  chapter: string;
};

type PortfolioContent = {
  role: string;
  capabilities: readonly Capability[];
  portfolioProjects: readonly PortfolioCase[];
  deliveredWork: readonly PortfolioCase[];
  navigation: readonly NavigationItem[];
};

export const profile = {
  fullName: "Natan de Souza Oliveira",
  displayName: "Natan Oliveira",
  role: "Desenvolvedor full stack orientado a produto",
  professionalEmail: "oliveira.natan.dev@gmail.com",
  phoneDisplay: "+55 32 99807-6972",
  whatsappUrl: "https://wa.me/5532998076972",
  githubUrl: "https://github.com/natsouzax",
  linkedinUrl:
    "https://www.linkedin.com/in/natan-de-souza-oliveira-it/",
} as const;

export const portfolioContent = {
  pt: {
    role: "Desenvolvedor full stack orientado a produto",
    capabilities: [
      {
        number: "01",
        title: "Produto e arquitetura",
        description:
          "Transformo uma ideia em decisões claras de escopo, fluxo, dados e evolução técnica.",
        technologies: ["Discovery", "Arquitetura", "UX", "Entrega"],
      },
      {
        number: "02",
        title: "Experiências web",
        description:
          "Construo interfaces responsivas com hierarquia, acessibilidade e performance desde a base.",
        technologies: ["TypeScript", "React", "Next.js", "Acessibilidade"],
      },
      {
        number: "03",
        title: "Sistemas e integrações",
        description:
          "Conecto produto, banco de dados, pagamentos e APIs em fluxos confiáveis de ponta a ponta.",
        technologies: ["Node.js", "Supabase", "Stripe", "APIs"],
      },
      {
        number: "04",
        title: "IA e automação",
        description:
          "Uso modelos de linguagem e automações quando eles resolvem uma tarefa real — não como enfeite.",
        technologies: ["LLMs", "Automação", "Integrações", "Prototipação"],
      },
    ],
    portfolioProjects: [
      {
        slug: "fluxo",
        kind: "project",
        name: "Fluxo",
        eyebrow: "Finanças com contexto",
        description:
          "Um produto mobile que cruza contas, orçamento, metas e notas com uma IA que entende o contexto financeiro do usuário.",
        detailLabel: "contribuição",
        contribution: "Conceito, experiência e desenvolvimento mobile",
        technologies: ["React Native", "Expo", "IA contextual"],
        links: [
          {
            label: "Ver no GitHub",
            href: profile.githubUrl,
            kind: "source",
          },
        ],
      },
      {
        slug: "ls-store",
        kind: "project",
        name: "LS Store",
        eyebrow: "Discovery antes do código",
        description:
          "Antes de implementar, mergulhei no contexto do cliente e transformei o entendimento do negócio em uma proposta navegável. Assim, ele pôde enxergar a visão, discutir prioridades e entender com clareza o que eu estava disposto a construir — não apenas receber um orçamento técnico.",
        detailLabel: "contribuição",
        contribution:
          "Discovery, direção de produto, narrativa visual e protótipo interativo",
        technologies: ["Product Discovery", "UX/UI", "Next.js"],
        links: [
          {
            label: "Abrir proposta",
            href: "https://ls-store.vercel.app/",
            kind: "live",
          },
        ],
      },
    ],
    deliveredWork: [
      {
        slug: "legal-ecosystem",
        kind: "service",
        name: "ADECEM + Consumidor 360",
        eyebrow: "Ecossistema jurídico · cliente",
        description:
          "ADECEM e Consumidor 360 fazem parte do mesmo ecossistema jurídico entregue a um cliente. O trabalho segue em desenvolvimento, com planos de expansão em parceria comigo.",
        detailLabel: "trabalho",
        contribution: "Arquitetura, desenvolvimento e evolução contínua",
        technologies: ["Next.js", "Jornadas jurídicas", "Evolução contínua"],
        links: [
          {
            label: "Visitar ADECEM",
            href: "https://www.adecem.org/",
            kind: "live",
          },
          {
            label: "Visitar Consumidor 360",
            href: "https://consumidor360.com.br/",
            kind: "live",
          },
        ],
      },
      {
        slug: "total-suplements",
        kind: "service",
        name: "Total Suplements",
        eyebrow: "Primeiro freelance · MVP",
        description:
          "E-commerce MVP criado para um cliente validar a ideia antes de ampliar o investimento. A operação segue em fase de validação, com evolução planejada.",
        detailLabel: "entrega",
        contribution: "Implementação, WooCommerce e publicação do MVP",
        technologies: ["WordPress", "WooCommerce", "Validação de MVP"],
        links: [
          {
            label: "Visitar e-commerce",
            href: "https://totalsuplements.com/",
            kind: "live",
          },
        ],
      },
      {
        slug: "x-content-bot",
        kind: "internship",
        name: "X Content Automation Bot",
        eyebrow: "Estágio · Bitjuris",
        description:
          "Minha primeira automação, desenvolvida durante o estágio na Bitjuris para gerar, revisar e agendar conteúdo institucional da empresa no X.",
        detailLabel: "trabalho realizado",
        contribution: "Pipeline editorial automatizado com publicação segura",
        technologies: ["Node.js", "X API v2", "Automação editorial"],
        links: [
          {
            label: "Ver automação",
            href: "https://github.com/natsouzax/x-content-automation-bot",
            kind: "source",
          },
        ],
      },
    ],
    navigation: [
      { href: "#sobre", label: "Método", chapter: "02" },
      { href: "#lexuri", label: "Lexuri", chapter: "03" },
      { href: "#projetos", label: "Trabalhos", chapter: "04" },
      { href: "#contato", label: "Contato", chapter: "05" },
    ],
  },
  en: {
    role: "Product-minded full stack developer",
    capabilities: [
      {
        number: "01",
        title: "Product and architecture",
        description:
          "I turn an idea into clear decisions about scope, flows, data, and technical evolution.",
        technologies: ["Discovery", "Architecture", "UX", "Delivery"],
      },
      {
        number: "02",
        title: "Web experiences",
        description:
          "I build responsive interfaces with strong hierarchy, accessibility, and performance from the ground up.",
        technologies: ["TypeScript", "React", "Next.js", "Accessibility"],
      },
      {
        number: "03",
        title: "Systems and integrations",
        description:
          "I connect products, databases, payments, and APIs into reliable end-to-end flows.",
        technologies: ["Node.js", "Supabase", "Stripe", "APIs"],
      },
      {
        number: "04",
        title: "AI and automation",
        description:
          "I use language models and automation when they solve a real task — never just as decoration.",
        technologies: ["LLMs", "Automation", "Integrations", "Prototyping"],
      },
    ],
    portfolioProjects: [
      {
        slug: "fluxo",
        kind: "project",
        name: "Fluxo",
        eyebrow: "Finance with context",
        description:
          "A mobile product that connects accounts, budgets, goals, and notes with AI that understands the user's financial context.",
        detailLabel: "contribution",
        contribution: "Concept, experience design, and mobile development",
        technologies: ["React Native", "Expo", "Contextual AI"],
        links: [
          {
            label: "View on GitHub",
            href: profile.githubUrl,
            kind: "source",
          },
        ],
      },
      {
        slug: "ls-store",
        kind: "project",
        name: "LS Store",
        eyebrow: "Discovery before code",
        description:
          "Before implementation, I immersed myself in the client's context and turned my understanding of the business into a navigable proposal. This allowed the client to see the vision, discuss priorities, and clearly understand what I intended to build — instead of simply receiving a technical quote.",
        detailLabel: "contribution",
        contribution:
          "Discovery, product direction, visual narrative, and interactive prototype",
        technologies: ["Product Discovery", "UX/UI", "Next.js"],
        links: [
          {
            label: "Open proposal",
            href: "https://ls-store.vercel.app/",
            kind: "live",
          },
        ],
      },
    ],
    deliveredWork: [
      {
        slug: "legal-ecosystem",
        kind: "service",
        name: "ADECEM + Consumidor 360",
        eyebrow: "Legal ecosystem · client",
        description:
          "ADECEM and Consumidor 360 are part of the same legal ecosystem delivered to a client. Development is ongoing, with expansion plans being built in partnership with me.",
        detailLabel: "work",
        contribution: "Architecture, development, and continuous evolution",
        technologies: ["Next.js", "Legal journeys", "Continuous evolution"],
        links: [
          {
            label: "Visit ADECEM",
            href: "https://www.adecem.org/",
            kind: "live",
          },
          {
            label: "Visit Consumidor 360",
            href: "https://consumidor360.com.br/",
            kind: "live",
          },
        ],
      },
      {
        slug: "total-suplements",
        kind: "service",
        name: "Total Suplements",
        eyebrow: "First freelance project · MVP",
        description:
          "An e-commerce MVP created so a client could validate the idea before increasing the investment. The operation remains in validation, with further development planned.",
        detailLabel: "delivery",
        contribution: "Implementation, WooCommerce, and MVP launch",
        technologies: ["WordPress", "WooCommerce", "MVP validation"],
        links: [
          {
            label: "Visit e-commerce",
            href: "https://totalsuplements.com/",
            kind: "live",
          },
        ],
      },
      {
        slug: "x-content-bot",
        kind: "internship",
        name: "X Content Automation Bot",
        eyebrow: "Internship · Bitjuris",
        description:
          "My first automation project, developed during my internship at Bitjuris to generate, review, and schedule the company's institutional content on X.",
        detailLabel: "work completed",
        contribution: "Automated editorial pipeline with safe publishing",
        technologies: ["Node.js", "X API v2", "Editorial automation"],
        links: [
          {
            label: "View automation",
            href: "https://github.com/natsouzax/x-content-automation-bot",
            kind: "source",
          },
        ],
      },
    ],
    navigation: [
      { href: "#sobre", label: "Method", chapter: "02" },
      { href: "#lexuri", label: "Lexuri", chapter: "03" },
      { href: "#projetos", label: "Work", chapter: "04" },
      { href: "#contato", label: "Contact", chapter: "05" },
    ],
  },
} as const satisfies Record<Locale, PortfolioContent>;
