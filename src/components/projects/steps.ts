export type LexuriStepId = "immerse" | "understand" | "retain" | "continue";

export type LexuriStep = {
  id: LexuriStepId;
  number: string;
  eyebrow: string;
  title: string;
  description: string;
};

export const lexuriSteps: LexuriStep[] = [
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
];
