"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import TiltScene from "@/components/motion/TiltScene";
import { useIsReducedMotion } from "@/components/motion/useIsReducedMotion";
import WorkspaceGuide from "@/components/workspace/WorkspaceGuide";
import { useDesktopPinning } from "@/hooks/useDesktopPinning";

import LaptopShell from "./LaptopShell";
import StepCycle from "./StepCycle";
import { lexuriSteps, type LexuriStepId } from "./steps";
import styles from "./LexuriShowcase.module.css";

function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.appChrome}>
      <header className={styles.appHeader}>
        <span className={styles.lexuriMark}>
          <Image src="/projects/lexuri/logo-icon.svg" width={22} height={22} alt="" />
        </span>
        <strong>lexuri</strong>
        <nav aria-label="Demonstração do aplicativo">
          <span>Explorar</span>
          <span>Minhas lições</span>
          <span>Revisão</span>
        </nav>
        <span className={styles.appStreak}>7 dias</span>
        <span className={styles.avatar}>NO</span>
      </header>
      <div className={styles.appBody}>{children}</div>
    </div>
  );
}

function ImmersionScreen() {
  return (
    <AppChrome>
      <div className={styles.immersionGrid}>
        <div className={styles.mediaCard}>
          <span className={styles.mediaEyebrow}>lição em vídeo</span>
          <div className={styles.albumArt}>
            <span className={styles.playGlyph}>▶</span>
            <small>CONVERSATION / B2</small>
            <strong>Why small habits shape fluency</strong>
          </div>
          <div className={styles.playerBar}>
            <span />
          </div>
          <div className={styles.playerMeta}><span>02:14</span><span>04:08</span></div>
        </div>
        <div className={styles.lyricsPanel}>
          <div className={styles.lessonHeading}>
            <span className={styles.screenLabel}>legenda interativa</span>
            <strong>18 chunks detectados</strong>
          </div>
          <p className={styles.transcriptLine}>
            I used to <span>take it for granted</span> that I could understand English.
          </p>
          <small className={styles.interactionHint}>Toque em uma expressão sem interromper o vídeo.</small>
          <div className={styles.chunkPreviewRow}>
            <span><small>COLLOCATION</small><strong>take it for granted</strong></span>
            <span><small>IDIOM</small><strong>at the end of the day</strong></span>
          </div>
        </div>
      </div>
    </AppChrome>
  );
}

function UnderstandingScreen() {
  return (
    <AppChrome>
      <div className={styles.understandScreen}>
        <span className={styles.screenLabel}>ajuda no momento certo</span>
        <p className={styles.contextLine}>I used to</p>
        <div className={styles.chunkFocus}>
          <span>take it for granted</span>
          <div className={styles.translationBubble}>
            <div><small>COLLOCATION</small><i>🔊</i></div>
            <strong>dar algo como garantido</strong>
            <p>Parar de valorizar algo porque parece normal.</p>
            <span>“Many people take clean water for granted.”</span>
          </div>
        </div>
        <p className={styles.contextLine}>that I could understand English.</p>
        <small className={styles.contextCaption}>Ajuda sob demanda: significado, contexto e pronúncia somente quando necessários.</small>
      </div>
    </AppChrome>
  );
}

function RetentionScreen() {
  return (
    <AppChrome>
      <div className={styles.reviewLayout}>
        <div className={styles.reviewMeta}>
          <span className={styles.screenLabel}>repetição espaçada</span>
          <strong>Revisão de hoje</strong>
          <p>O que surgiu durante a imersão retorna antes de ser esquecido.</p>
          <b>3 de 10 cards</b>
          <div className={styles.reviewProgress}>
            <span style={{ width: "30%" }} />
          </div>
        </div>
        <div className={styles.flashcard}>
          <small>CHUNK DESCOBERTO NA LIÇÃO</small>
          <strong>take it for granted</strong>
          <p>dar algo como garantido</p>
          <i>“I used to take it for granted.”</i>
          <div className={styles.reviewActions}>
            <span>De novo</span><span>Difícil</span><span>Bom</span><span>Fácil</span>
          </div>
        </div>
      </div>
    </AppChrome>
  );
}

function ContinuityScreen() {
  return (
    <AppChrome>
      <div className={styles.syncScreen}>
        <span className={styles.screenLabel}>mesmo progresso / três superfícies</span>
        <div className={styles.deviceMap}>
          <div className={`${styles.device} ${styles.webDevice}`}>
            <span />
            <strong>Hub web</strong>
          </div>
          <div className={styles.syncCore}>
            <span className={styles.syncPulse} />
            <strong>sync</strong>
          </div>
          <div className={`${styles.device} ${styles.phoneDevice}`}>
            <span />
            <strong>Android</strong>
          </div>
          <div className={`${styles.device} ${styles.desktopDevice}`}>
            <span />
            <strong>Windows</strong>
          </div>
        </div>
        <p>O sistema mantém contexto, progresso e revisão em cada dispositivo.</p>
      </div>
    </AppChrome>
  );
}

const screens: Record<LexuriStepId, () => React.JSX.Element> = {
  immerse: ImmersionScreen,
  understand: UnderstandingScreen,
  retain: RetentionScreen,
  continue: ContinuityScreen,
};

function ProductScreen({ activeStep }: { activeStep: number }) {
  const active = lexuriSteps[activeStep] ?? lexuriSteps[0];
  const Screen = screens[active.id];

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={active.id}
        className={styles.screenMotion}
        initial={{ opacity: 0, y: 8, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 1.005 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      >
        <Screen />
      </motion.div>
    </AnimatePresence>
  );
}

function ProductIntroduction() {
  return (
    <div className={styles.productIntro}>
      <p className="chapter-kicker">
        <span className="chapter-number">03</span>
        produto principal / startup
      </p>
      <h2 id="lexuri-title">Aprender inglês com o conteúdo que já prende sua atenção.</h2>
      <p>
        No Lexuri, desenhei a experiência para preservar o fluxo de atenção:
        conteúdo real vira compreensão contextual, prática curta e memória —
        no navegador, no Android e no Windows.
      </p>
      <div className={styles.uxDecisions} aria-label="Decisões de experiência do Lexuri">
        <div><span>01</span><strong>Contexto primeiro</strong><small>O idioma nasce do conteúdo que a pessoa escolheu.</small></div>
        <div><span>02</span><strong>Ajuda sem ruptura</strong><small>Significado e pronúncia aparecem dentro do fluxo.</small></div>
        <div><span>03</span><strong>Memória contínua</strong><small>Descobertas retornam no ritmo certo para revisar.</small></div>
      </div>
      <div className={styles.productMeta}>
        <span>Next.js</span>
        <span>Supabase</span>
        <span>Cloudflare</span>
        <span>Flutter</span>
      </div>
      <a
        className={styles.lexuriLink}
        href="https://lexuri.app"
        target="_blank"
        rel="noreferrer"
      >
        Abrir lexuri.app
        <Icon name="arrowUpRight" />
      </a>
      <div className={styles.lexuriGuide} aria-hidden="true">
        <WorkspaceGuide mode="presenting" variant="compact" />
      </div>
    </div>
  );
}

function NotebookStage({
  activeStep,
  onSelect,
  lidRotate,
  lift,
  glow,
}: {
  activeStep: number;
  onSelect: (index: number) => void;
  lidRotate: number | MotionValue<number>;
  lift?: number | MotionValue<number>;
  glow?: number | MotionValue<number>;
}) {
  const active = lexuriSteps[activeStep] ?? lexuriSteps[0];

  return (
    <TiltScene className={styles.notebookStage} intensity={4.5} lift={6}>
      <span className={styles.objectLabel}>lexuri / produto principal em evolução</span>
      <LaptopShell lidRotate={lidRotate} lift={lift} glow={glow}>
        <ProductScreen activeStep={activeStep} />
      </LaptopShell>
      <div className={styles.activeNarrative} aria-live="polite">
        <span>{active.number} / {active.eyebrow}</span>
        <strong>{active.title}</strong>
        <p>{active.description}</p>
      </div>
      <StepCycle activeStep={activeStep} onSelect={onSelect} />
    </TiltScene>
  );
}

function StaticExperience() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className={`scene-shell ${styles.staticExperience}`}>
      <ProductIntroduction />
      <NotebookStage
        activeStep={activeStep}
        onSelect={setActiveStep}
        lidRotate={0}
        lift={0}
        glow={1}
      />
    </div>
  );
}

function stepFromProgress(progress: number) {
  const normalized = Math.max(0, Math.min(0.999, (progress - 0.22) / 0.68));
  return Math.floor(normalized * lexuriSteps.length);
}

function ScrollExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const lidRotate = useTransform(scrollYProgress, [0.02, 0.2], [-88, 0]);
  const lift = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [85, 0, 0, -24]);
  const glow = useTransform(scrollYProgress, [0.13, 0.24], [0, 1]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const nextStep = stepFromProgress(progress);
    setActiveStep((current) => (current === nextStep ? current : nextStep));
  });

  function scrollToStep(index: number) {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const travel = container.offsetHeight - window.innerHeight;
    const progress = 0.28 + index * (0.62 / (lexuriSteps.length - 1));
    window.scrollTo({ top: top + travel * progress, behavior: "smooth" });
  }

  return (
    <div ref={containerRef} className={styles.scrollExperience}>
      <div className={styles.stickyScene}>
        <div className={`scene-shell ${styles.scrollLayout}`}>
          <ProductIntroduction />
          <NotebookStage
            activeStep={activeStep}
            onSelect={scrollToStep}
            lidRotate={lidRotate}
            lift={lift}
            glow={glow}
          />
        </div>
      </div>
    </div>
  );
}

export default function LexuriShowcase() {
  const supportsPinning = useDesktopPinning();
  const shouldReduceMotion = useIsReducedMotion();

  return (
    <section id="lexuri" className={styles.lexuri} aria-labelledby="lexuri-title">
      {supportsPinning && !shouldReduceMotion ? (
        <ScrollExperience />
      ) : (
        <StaticExperience />
      )}
    </section>
  );
}
