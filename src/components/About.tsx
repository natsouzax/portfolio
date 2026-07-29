"use client";

import { Icon } from "@/components/ui/Icon";
import CapabilityOrbit from "@/components/about/CapabilityOrbit";
import TiltScene from "@/components/motion/TiltScene";
import WorkspaceGuide from "@/components/workspace/WorkspaceGuide";
import { useLanguage } from "@/i18n/LanguageProvider";

import styles from "./About.module.css";

const aboutCopy = {
  pt: {
    kicker: "método e mentalidade",
    title: "Antes do código, eu procuro o produto.",
    lede:
      "Gosto de levar ideias do zero até algo real no ar. Meu trabalho acontece no encontro entre engenharia, experiência e visão de negócio — porque um produto forte precisa das três.",
    station: "observatório / 02",
    quote:
      "“Não quero apenas fazer a interface funcionar. Quero que cada decisão ajude o produto a fazer sentido.”",
    nextChapter: "próximo capítulo",
    nextChapterTitle: "a ideia ganha forma",
    principles: [
      {
        title: "Começar pelo porquê",
        description:
          "Antes de escolher tecnologia, procuro entender a pessoa, a fricção e o resultado esperado.",
      },
      {
        title: "Projetar o sistema inteiro",
        description:
          "Interface, dados, integrações e operação fazem parte da mesma experiência — por isso penso neles juntos.",
      },
      {
        title: "Colocar no mundo",
        description:
          "Uma ideia só vira produto quando funciona fora do protótipo: publicada, observável e pronta para evoluir.",
      },
    ],
    capabilities: "o que consigo mover",
    capabilitiesLede:
      "As quatro capacidades partem do mesmo centro: elas se sustentam entre si, e é por isso que penso nelas juntas.",
    educationLabel: "formação em andamento · Portugal",
    education: "Engenharia Informática",
    educationLede:
      "O curso aprofunda minha base em software e sistemas enquanto eu continuo criando, publicando e evoluindo produtos reais.",
  },
  en: {
    kicker: "method and mindset",
    title: "Before the code, I look for the product.",
    lede:
      "I enjoy taking ideas from zero to something real and live. My work sits at the intersection of engineering, experience, and business vision — because a strong product needs all three.",
    station: "observatory / 02",
    quote:
      "“I don't just want to make the interface work. I want every decision to help the product make sense.”",
    nextChapter: "next chapter",
    nextChapterTitle: "the idea takes shape",
    principles: [
      {
        title: "Start with why",
        description:
          "Before choosing technology, I seek to understand the person, the friction, and the expected outcome.",
      },
      {
        title: "Design the whole system",
        description:
          "Interface, data, integrations, and operations are part of the same experience — so I think about them together.",
      },
      {
        title: "Put it into the world",
        description:
          "An idea only becomes a product when it works beyond the prototype: launched, observable, and ready to evolve.",
      },
    ],
    capabilities: "what I can move forward",
    capabilitiesLede:
      "These four capabilities share the same centre: they support one another, which is why I approach them together.",
    educationLabel: "degree in progress · Portugal",
    education: "Computer Engineering",
    educationLede:
      "The degree deepens my foundation in software and systems while I continue creating, launching, and evolving real products.",
  },
} as const;

export default function About() {
  const { locale } = useLanguage();
  const copy = aboutCopy[locale];

  return (
    <section id="sobre" className={styles.about} aria-labelledby="about-title">
      <div className="scene-shell">
        <header className={styles.header} data-reveal>
          <div>
            <p className="chapter-kicker">
              <span className="chapter-number">02</span>
              {copy.kicker}
            </p>
            <h2 id="about-title" className="section-title">
              {copy.title}
            </h2>
          </div>
          <p className="section-lede">{copy.lede}</p>
        </header>

        <div className={styles.methodGrid}>
          <TiltScene className={styles.guideStation} intensity={4.5} lift={7}>
            <span className={styles.stationLabel}>{copy.station}</span>
            <WorkspaceGuide mode="observing" variant="compact" />
            <blockquote>{copy.quote}</blockquote>
            <div className={styles.nextChapter}>
              <span>{copy.nextChapter}</span>
              <strong>{copy.nextChapterTitle}</strong>
              <Icon name="arrowDown" />
            </div>
          </TiltScene>

          <ol className={styles.principles}>
            {copy.principles.map((principle, index) => (
              <li key={principle.title} data-reveal="right">
                <span className={styles.principleNumber}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{principle.title}</h3>
                  <p>{principle.description}</p>
                </div>
                <Icon name="check" />
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.capabilityHeader} data-reveal>
          <p className="chapter-kicker">{copy.capabilities}</p>
          <p>{copy.capabilitiesLede}</p>
        </div>

        <CapabilityOrbit />

        <aside className={styles.learningNote} data-reveal>
          <span className={styles.learningIcon} aria-hidden="true">
            <Icon name="spark" />
          </span>
          <div>
            <span className={styles.learningLabel}>{copy.educationLabel}</span>
            <strong>{copy.education}</strong>
          </div>
          <p>{copy.educationLede}</p>
        </aside>
      </div>
    </section>
  );
}
