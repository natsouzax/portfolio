"use client";

import { Icon } from "@/components/ui/Icon";
import TiltScene from "@/components/motion/TiltScene";
import WorkspaceGuide from "@/components/workspace/WorkspaceGuide";
import { profile } from "@/data/portfolio";
import { useLanguage } from "@/i18n/LanguageProvider";

import styles from "./Hero.module.css";

const heroCopy = {
  pt: {
    kicker: "entrando no workspace",
    intro: "Olá, eu sou",
    title: ["Produtos digitais,", "pensados por inteiro."],
    lede:
      "Desenvolvedor full stack orientado a produto. Do primeiro diagrama ao deploy, conecto arquitetura, interface e integrações para transformar ideias em experiências reais.",
    explore: "Explorar o workspace",
    lexuri: "Conhecer o Lexuri",
    professionalLinks: "Links profissionais",
    findMe: "encontre-me em",
    running: "em execução",
    sequence: [
      { label: "entender", detail: "problema e contexto", status: "done" },
      { label: "desenhar", detail: "fluxo e arquitetura", status: "done" },
      { label: "construir", detail: "produto completo", status: "active" },
      { label: "evoluir", detail: "medir e refinar", status: "queued" },
    ],
    principle: "produto antes da tecnologia",
    guide: "este personagem é o meu guia — ele vai acompanhar a jornada",
    scroll: "continue para entrar",
  },
  en: {
    kicker: "entering the workspace",
    intro: "Hello, I'm",
    title: ["Digital products,", "thought through end to end."],
    lede:
      "Product-minded full stack developer. From the first diagram to deployment, I connect architecture, interfaces, and integrations to turn ideas into real experiences.",
    explore: "Explore the workspace",
    lexuri: "Discover Lexuri",
    professionalLinks: "Professional links",
    findMe: "find me on",
    running: "running",
    sequence: [
      { label: "understand", detail: "problem and context", status: "done" },
      { label: "design", detail: "flow and architecture", status: "done" },
      { label: "build", detail: "complete product", status: "active" },
      { label: "evolve", detail: "measure and refine", status: "queued" },
    ],
    principle: "product before technology",
    guide: "this character is my guide — he'll be with us throughout the journey",
    scroll: "keep scrolling to enter",
  },
} as const;

export default function Hero() {
  const { locale } = useLanguage();
  const copy = heroCopy[locale];

  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <div className={`scene-shell ${styles.inner}`}>
        <div className={styles.copy}>
          <p className="chapter-kicker">
            <span className="chapter-number">01</span>
            {copy.kicker}
          </p>
          <p className={styles.intro}>
            <span>{copy.intro}</span>
            <strong>{profile.fullName}</strong>
          </p>
          <h1 id="hero-title" className="display-title">
            {copy.title[0]}
            <span>{copy.title[1]}</span>
          </h1>
          <p className={styles.lede}>{copy.lede}</p>

          <div className={styles.actions}>
            <a className={styles.primaryAction} href="#sobre" data-sound="whoosh">
              {copy.explore}
              <Icon name="arrowDown" />
            </a>
            <a className={styles.secondaryAction} href="#lexuri" data-sound="futuristic">
              {copy.lexuri}
              <Icon name="arrowUpRight" />
            </a>
          </div>

          <div className={styles.proof} aria-label={copy.professionalLinks}>
            <span className={styles.proofLabel}>{copy.findMe}</span>
            <a href={profile.githubUrl} target="_blank" rel="noreferrer" data-sound="whoosh">
              <Icon name="github" />
              GitHub
            </a>
            <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" data-sound="whoosh">
              <Icon name="linkedin" />
              LinkedIn
            </a>
          </div>
        </div>

        <TiltScene className={styles.stage} intensity={5} lift={10}>
          <div className={styles.console}>
            <div className={styles.consoleBar}>
              <span className={styles.consoleTitle}>product.build</span>
              <span className={styles.consoleStatus}>{copy.running}</span>
            </div>
            <ol className={styles.sequence}>
              {copy.sequence.map((step, index) => (
                <li key={step.label} data-status={step.status}>
                  <span className={styles.stepIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <strong>{step.label}</strong>
                    <small>{step.detail}</small>
                  </span>
                  <span className={styles.stepSignal} aria-hidden="true" />
                </li>
              ))}
            </ol>
            <div className={styles.consoleFooter}>
              <span>{copy.principle}</span>
              <Icon name="code" />
            </div>
          </div>

          <div className={styles.guideWrap}>
            <div className={styles.guideNote}>
              <Icon name="spark" />
              <span>{copy.guide}</span>
            </div>
            <WorkspaceGuide mode="arriving" variant="hero" priority />
          </div>

          <span className={styles.coordinateOne}>x 24.08 / y 07.11</span>
          <span className={styles.coordinateTwo}>workspace.online</span>
        </TiltScene>
      </div>

      <div className={styles.scrollCue} aria-hidden="true">
        <span>{copy.scroll}</span>
        <span className={styles.scrollLine} />
      </div>
    </section>
  );
}
