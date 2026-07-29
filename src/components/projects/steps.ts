import type { Locale } from "@/i18n/LanguageProvider";

export type LexuriStepId = "immerse" | "understand" | "retain" | "continue";

export type LexuriStep = {
  id: LexuriStepId;
  number: string;
  eyebrow: string;
  title: string;
  description: string;
};

export const lexuriStepsByLocale = {
  pt: [
    {
      id: "immerse",
      number: "01",
      eyebrow: "imersão",
      title: "Entre pelo conteúdo real",
      description:
        "A experiência começa pelo que a pessoa escolheu assistir ou ouvir, preservando motivação e contexto desde o primeiro contato.",
    },
    {
      id: "understand",
      number: "02",
      eyebrow: "significado",
      title: "Entenda sem quebrar o ritmo",
      description:
        "Chunks, tradução contextual e pronúncia aparecem sob demanda — somente quando a dúvida surge.",
    },
    {
      id: "retain",
      number: "03",
      eyebrow: "retenção",
      title: "Leve a descoberta para a memória",
      description:
        "Flashcards preservam a frase de origem e retornam em sessões curtas, guiadas por repetição espaçada e feedback simples.",
    },
    {
      id: "continue",
      number: "04",
      eyebrow: "continuidade",
      title: "Continue em qualquer tela",
      description:
        "A mesma arquitetura de experiência mantém contexto, progresso e revisão coerentes no Hub web, Android e Windows.",
    },
  ],
  en: [
    {
      id: "immerse",
      number: "01",
      eyebrow: "immersion",
      title: "Start with real content",
      description:
        "The experience starts with what each person chose to watch or listen to, preserving motivation and context from the very first interaction.",
    },
    {
      id: "understand",
      number: "02",
      eyebrow: "meaning",
      title: "Understand without breaking the flow",
      description:
        "Chunks, contextual translations, and pronunciation appear on demand — only when a question arises.",
    },
    {
      id: "retain",
      number: "03",
      eyebrow: "retention",
      title: "Move discoveries into memory",
      description:
        "Flashcards preserve the original sentence and return in short sessions guided by spaced repetition and simple feedback.",
    },
    {
      id: "continue",
      number: "04",
      eyebrow: "continuity",
      title: "Continue on any screen",
      description:
        "The same experience architecture keeps context, progress, and review consistent across the web hub, Android, and Windows.",
    },
  ],
} as const satisfies Record<Locale, readonly LexuriStep[]>;
