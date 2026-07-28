import { Icon } from "@/components/ui/Icon";
import TiltScene from "@/components/motion/TiltScene";
import WorkspaceGuide from "@/components/workspace/WorkspaceGuide";
import { profile } from "@/data/portfolio";

import styles from "./Hero.module.css";

const buildSequence = [
  { label: "entender", detail: "problema e contexto", status: "done" },
  { label: "desenhar", detail: "fluxo e arquitetura", status: "done" },
  { label: "construir", detail: "produto completo", status: "active" },
  { label: "evoluir", detail: "medir e refinar", status: "queued" },
] as const;

export default function Hero() {
  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <div className={`scene-shell ${styles.inner}`}>
        <div className={styles.copy}>
          <p className="chapter-kicker">
            <span className="chapter-number">01</span>
            entrando no workspace
          </p>
          <p className={styles.intro}>Olá, eu sou {profile.displayName}.</p>
          <h1 id="hero-title" className="display-title">
            Produtos digitais,
            <span>pensados por inteiro.</span>
          </h1>
          <p className={styles.lede}>
            Desenvolvedor full stack orientado a produto. Do primeiro diagrama
            ao deploy, conecto arquitetura, interface e integrações para
            transformar ideias em experiências reais.
          </p>

          <div className={styles.actions}>
            <a className={styles.primaryAction} href="#sobre">
              Explorar o workspace
              <Icon name="arrowDown" />
            </a>
            <a className={styles.secondaryAction} href="#lexuri">
              Conhecer o Lexuri
              <Icon name="arrowUpRight" />
            </a>
          </div>

          <div className={styles.proof} aria-label="Links profissionais">
            <span className={styles.proofLabel}>encontre-me em</span>
            <a href={profile.githubUrl} target="_blank" rel="noreferrer">
              <Icon name="github" />
              GitHub
            </a>
            <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">
              <Icon name="linkedin" />
              LinkedIn
            </a>
          </div>
        </div>

        <TiltScene className={styles.stage} intensity={5} lift={10}>
          <div className={styles.console}>
            <div className={styles.consoleBar}>
              <span className={styles.consoleTitle}>product.build</span>
              <span className={styles.consoleStatus}>em execução</span>
            </div>
            <ol className={styles.sequence}>
              {buildSequence.map((step, index) => (
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
              <span>produto antes da tecnologia</span>
              <Icon name="code" />
            </div>
          </div>

          <div className={styles.guideWrap}>
            <div className={styles.guideNote}>
              <Icon name="spark" />
              <span>
                este personagem é o meu guia — ele vai acompanhar a jornada
              </span>
            </div>
            <WorkspaceGuide mode="arriving" variant="hero" priority />
          </div>

          <span className={styles.coordinateOne}>x 24.08 / y 07.11</span>
          <span className={styles.coordinateTwo}>workspace.online</span>
        </TiltScene>
      </div>

      <div className={styles.scrollCue} aria-hidden="true">
        <span>continue para entrar</span>
        <span className={styles.scrollLine} />
      </div>
    </section>
  );
}
