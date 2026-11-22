type PersonalProject = {
  name: string;
  category: string;
  description: string;
  technologies: string[];
  repository: string;
  demo?: { label: string; href: string };
  artwork: { src: string; alt: string } | { steps: string[] };
};

export const personalProjects: PersonalProject[] = [
  {
    name: "Together",
    category: "Co-op game",
    description: "Build a tower and climb through a ruined world in a platformer made during a game jam. Play solo or share the climb with a second player.",
    technologies: ["GameMaker", "Windows", "1–2 players"],
    repository: "game_jam",
    demo: { label: "Get the Windows build", href: "https://github.com/natsouzax/game_jam/releases/latest" },
    artwork: {
      src: "/projects/together-gameplay.webp",
      alt: "Pixel-art gameplay from Together, showing platforms and blocks to climb",
    },
  },
  {
    name: "Job Hunter AI",
    category: "Job search tools",
    description: "A local workflow for finding roles, creating tailored application materials and reviewing them before deciding what to send.",
    technologies: ["Python", "LaTeX"],
    repository: "Job-Hunter-AI-Public",
    artwork: { steps: ["Find roles", "Prepare materials", "Review application"] },
  },
  {
    name: "Telegram AI Automation",
    category: "Automation",
    description: "A Telegram bot for community communication, with commands, scheduled messages and optional AI-generated educational content.",
    technologies: ["Python", "Telegram Bot API", "SQLite"],
    repository: "telegram-ai-automation-bot",
    artwork: { steps: ["Choose content", "Schedule messages", "Send to Telegram"] },
  },
  {
    name: "X AI Content Automation",
    category: "Automation",
    description: "An editorial pipeline that drafts posts, checks rules and duplicates, and can publish to X after approval.",
    technologies: ["Node.js", "X API"],
    repository: "x-ai-content-automation",
    artwork: { steps: ["Draft a post", "Check and review", "Approve publication"] },
  },
  {
    name: "Cardnest Concept Demo",
    category: "E-commerce prototype",
    description: "An independent storefront concept for trading cards, with a searchable catalogue, a cart and a WhatsApp enquiry flow.",
    technologies: ["Next.js", "React", "TypeScript"],
    repository: "cardnest-concept-demo",
    artwork: { steps: ["Browse cards", "Build a cart", "Draft an enquiry"] },
  },
  {
    name: "Pastelaria Doce Lurdes",
    category: "Order management",
    description: "A bakery ordering app where customers order and track purchases, while staff manage production and collection.",
    technologies: ["Next.js", "Supabase"],
    repository: "pastelaria_doce_lurdes_C_Shift_to_digital",
    artwork: { steps: ["Place an order", "Prepare the order", "Track collection"] },
  },
  {
    name: "The Adventures of Cleiton",
    category: "2D game",
    description: "An early academic game built with Pygame to explore gameplay logic, level progression and game states.",
    technologies: ["Python", "Pygame"],
    repository: "2D-_Python_Game",
    artwork: {
      src: "/projects/cleiton-game.webp",
      alt: "Pixel-art menu screen from The Adventures of Cleiton",
    },
  },
];
