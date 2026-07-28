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
  technologies: string[];
  links: LinkItem[];
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

export const capabilities = [
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
] as const;

export const portfolioProjects: PortfolioCase[] = [
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
    contribution: "Discovery, direção de produto, narrativa visual e protótipo interativo",
    technologies: ["Product Discovery", "UX/UI", "Next.js"],
    links: [
      {
        label: "Abrir proposta",
        href: "https://ls-store.vercel.app/",
        kind: "live",
      },
    ],
  },
];

export const deliveredWork: PortfolioCase[] = [
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
];

export const navigation = [
  { href: "#sobre", label: "Método", chapter: "02" },
  { href: "#lexuri", label: "Lexuri", chapter: "03" },
  { href: "#projetos", label: "Trabalhos", chapter: "04" },
  { href: "#contato", label: "Contato", chapter: "05" },
] as const;
