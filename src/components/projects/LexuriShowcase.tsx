"use client";

import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import TiltScene from "@/components/motion/TiltScene";
import { useIsReducedMotion } from "@/components/motion/useIsReducedMotion";
import { useDesktopPinning } from "@/hooks/useDesktopPinning";
import { useLanguage } from "@/i18n/LanguageProvider";

import LaptopShell from "./LaptopShell";
import StepCycle from "./StepCycle";
import { lexuriStepsByLocale, type LexuriStepId } from "./steps";
import styles from "./LexuriShowcase.module.css";

const lexuriCopy = {
  pt: {
    appDemo: "Demonstração do aplicativo",
    appNav: ["Explorar", "Minhas lições", "Revisão"],
    streak: "7 dias",
    immersion: {
      lesson: "lição em vídeo",
      mediaLevel: "CONVERSA / B2",
      interactiveCaption: "legenda interativa",
      chunks: "18 chunks detectados",
      hint: "Toque em uma expressão sem interromper o vídeo.",
    },
    understanding: {
      label: "ajuda no momento certo",
      translation: "dar algo como garantido",
      definition: "Parar de valorizar algo porque parece normal.",
      caption:
        "Ajuda sob demanda: significado, contexto e pronúncia somente quando necessários.",
    },
    retention: {
      label: "repetição espaçada",
      title: "Revisão de hoje",
      description:
        "O que surgiu durante a imersão retorna antes de ser esquecido.",
      progress: "3 de 10 cards",
      discovered: "CHUNK DESCOBERTO NA LIÇÃO",
      translation: "dar algo como garantido",
      actions: ["De novo", "Difícil", "Bom", "Fácil"],
    },
    continuity: {
      label: "mesmo progresso / três superfícies",
      description:
        "O sistema mantém contexto, progresso e revisão em cada dispositivo.",
    },
    introduction: {
      kicker: "produto principal / startup",
      title: "Aprender inglês com o conteúdo que já prende sua atenção.",
      lede:
        "No Lexuri, desenhei a experiência para preservar o fluxo de atenção: conteúdo real vira compreensão contextual, prática curta e memória — no navegador, no Android e no Windows.",
      decisionsLabel: "Decisões de experiência do Lexuri",
      decisions: [
        ["Contexto primeiro", "O idioma nasce do conteúdo que a pessoa escolheu."],
        ["Ajuda sem ruptura", "Significado e pronúncia aparecem dentro do fluxo."],
        ["Memória contínua", "Descobertas retornam no ritmo certo para revisar."],
      ],
      link: "Abrir lexuri.app",
    },
    objectLabel: "lexuri / produto principal em evolução",
  },
  en: {
    appDemo: "Application demo",
    appNav: ["Explore", "My lessons", "Review"],
    streak: "7 days",
    immersion: {
      lesson: "video lesson",
      mediaLevel: "CONVERSATION / B2",
      interactiveCaption: "interactive captions",
      chunks: "18 chunks detected",
      hint: "Tap an expression without interrupting the video.",
    },
    understanding: {
      label: "help at the right moment",
      translation: "to assume something will always be there",
      definition: "To stop valuing something because it seems normal.",
      caption:
        "On-demand help: meaning, context, and pronunciation only when needed.",
    },
    retention: {
      label: "spaced repetition",
      title: "Today's review",
      description:
        "What appeared during immersion returns before it can be forgotten.",
      progress: "3 of 10 cards",
      discovered: "CHUNK DISCOVERED IN THE LESSON",
      translation: "to assume something will always be there",
      actions: ["Again", "Hard", "Good", "Easy"],
    },
    continuity: {
      label: "same progress / three surfaces",
      description:
        "The system preserves context, progress, and review on every device.",
    },
    introduction: {
      kicker: "main product / startup",
      title: "Learn English with content that already holds your attention.",
      lede:
        "For Lexuri, I designed the experience to preserve the flow of attention: real content becomes contextual understanding, short practice, and lasting memory — in the browser, on Android, and on Windows.",
      decisionsLabel: "Lexuri experience decisions",
      decisions: [
        ["Context first", "Language starts with content the person chose."],
        ["Help without disruption", "Meaning and pronunciation appear within the flow."],
        ["Continuous memory", "Discoveries return at the right time for review."],
      ],
      link: "Open lexuri.app",
    },
    objectLabel: "lexuri / main product in development",
  },
} as const;

function AppChrome({ children }: { children: React.ReactNode }) {
  const { locale } = useLanguage();
  const copy = lexuriCopy[locale];

  return (
    <div className={styles.appChrome}>
      <header className={styles.appHeader}>
        <span className={styles.lexuriMark}>
          <Image src="/projects/lexuri/logo-icon.svg" width={22} height={22} alt="" />
        </span>
        <strong>lexuri</strong>
        <nav aria-label={copy.appDemo}>
          {copy.appNav.map((item) => <span key={item}>{item}</span>)}
        </nav>
        <span className={styles.appStreak}>{copy.streak}</span>
        <span className={styles.avatar}>NO</span>
      </header>
      <div className={styles.appBody}>{children}</div>
    </div>
  );
}

function ImmersionScreen() {
  const { locale } = useLanguage();
  const copy = lexuriCopy[locale].immersion;

  return (
    <AppChrome>
      <div className={styles.immersionGrid}>
        <div className={styles.mediaCard}>
          <span className={styles.mediaEyebrow}>{copy.lesson}</span>
          <div className={styles.albumArt}>
            <span className={styles.playGlyph}>▶</span>
            <small>{copy.mediaLevel}</small>
            <strong>Why small habits shape fluency</strong>
          </div>
          <div className={styles.playerBar}>
            <span />
          </div>
          <div className={styles.playerMeta}><span>02:14</span><span>04:08</span></div>
        </div>
        <div className={styles.lyricsPanel}>
          <div className={styles.lessonHeading}>
            <span className={styles.screenLabel}>{copy.interactiveCaption}</span>
            <strong>{copy.chunks}</strong>
          </div>
          <p className={styles.transcriptLine}>
            I used to <span>take it for granted</span> that I could understand English.
          </p>
          <small className={styles.interactionHint}>{copy.hint}</small>
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
  const { locale } = useLanguage();
  const copy = lexuriCopy[locale].understanding;

  return (
    <AppChrome>
      <div className={styles.understandScreen}>
        <span className={styles.screenLabel}>{copy.label}</span>
        <p className={styles.contextLine}>I used to</p>
        <div className={styles.chunkFocus}>
          <span>take it for granted</span>
          <div className={styles.translationBubble}>
            <div><small>COLLOCATION</small><i>🔊</i></div>
            <strong>{copy.translation}</strong>
            <p>{copy.definition}</p>
            <span>“Many people take clean water for granted.”</span>
          </div>
        </div>
        <p className={styles.contextLine}>that I could understand English.</p>
        <small className={styles.contextCaption}>{copy.caption}</small>
      </div>
    </AppChrome>
  );
}

function RetentionScreen() {
  const { locale } = useLanguage();
  const copy = lexuriCopy[locale].retention;

  return (
    <AppChrome>
      <div className={styles.reviewLayout}>
        <div className={styles.reviewMeta}>
          <span className={styles.screenLabel}>{copy.label}</span>
          <strong>{copy.title}</strong>
          <p>{copy.description}</p>
          <b>{copy.progress}</b>
          <div className={styles.reviewProgress}>
            <span style={{ width: "30%" }} />
          </div>
        </div>
        <div className={styles.flashcard}>
          <small>{copy.discovered}</small>
          <strong>take it for granted</strong>
          <p>{copy.translation}</p>
          <i>“I used to take it for granted.”</i>
          <div className={styles.reviewActions}>
            {copy.actions.map((action) => <span key={action}>{action}</span>)}
          </div>
        </div>
      </div>
    </AppChrome>
  );
}

function ContinuityScreen() {
  const { locale } = useLanguage();
  const copy = lexuriCopy[locale].continuity;

  return (
    <AppChrome>
      <div className={styles.syncScreen}>
        <span className={styles.screenLabel}>{copy.label}</span>
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
        <p>{copy.description}</p>
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

function ProductScreen({
  activeStep,
  onSelect,
}: {
  activeStep: number;
  onSelect: (index: number) => void;
}) {
  const { locale } = useLanguage();
  const lexuriSteps = lexuriStepsByLocale[locale];
  const active = lexuriSteps[activeStep] ?? lexuriSteps[0];
  const Screen = screens[active.id];
  const previousLabel = locale === "pt" ? "Etapa anterior" : "Previous step";
  const nextLabel = locale === "pt" ? "Próxima etapa" : "Next step";

  function cycleStep(direction: -1 | 1) {
    onSelect(
      (activeStep + direction + lexuriSteps.length) % lexuriSteps.length,
    );
  }

  return (
    <div className={styles.productScreen}>
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
      <button
        type="button"
        className={`${styles.screenArrow} ${styles.screenArrowPrevious}`}
        aria-label={previousLabel}
        data-sound="binary"
        onClick={() => cycleStep(-1)}
      >
        <span aria-hidden="true">&larr;</span>
      </button>
      <button
        type="button"
        className={`${styles.screenArrow} ${styles.screenArrowNext}`}
        aria-label={nextLabel}
        data-sound="binary"
        onClick={() => cycleStep(1)}
      >
        <span aria-hidden="true">&rarr;</span>
      </button>
    </div>
  );
}

function ProductIntroduction() {
  const { locale } = useLanguage();
  const copy = lexuriCopy[locale].introduction;

  return (
    <div className={styles.productIntro}>
      <p className="chapter-kicker">
        <span className="chapter-number">03</span>
        {copy.kicker}
      </p>
      <h2 id="lexuri-title">{copy.title}</h2>
      <p>{copy.lede}</p>
      <div className={styles.uxDecisions} aria-label={copy.decisionsLabel}>
        {copy.decisions.map(([title, description], index) => (
          <div key={title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{title}</strong>
            <small>{description}</small>
          </div>
        ))}
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
        data-sound="whoosh"
      >
        {copy.link}
        <Icon name="arrowUpRight" />
      </a>
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
  const { locale } = useLanguage();
  const lexuriSteps = lexuriStepsByLocale[locale];
  const copy = lexuriCopy[locale];
  const active = lexuriSteps[activeStep] ?? lexuriSteps[0];

  return (
    <TiltScene className={styles.notebookStage} intensity={4.5} lift={6}>
      <span className={styles.objectLabel}>{copy.objectLabel}</span>
      <LaptopShell lidRotate={lidRotate} lift={lift} glow={glow}>
        <ProductScreen activeStep={activeStep} onSelect={onSelect} />
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

function ScrollExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 72%", "start 18%"],
  });

  const lidRotate = useTransform(scrollYProgress, [0, 0.28], [-88, 0]);
  const lift = useTransform(scrollYProgress, [0, 0.28], [85, 0]);
  const glow = useTransform(scrollYProgress, [0.08, 0.32], [0, 1]);

  return (
    <div ref={containerRef} className={styles.scrollExperience}>
      <div className={styles.stickyScene}>
        <div className={`scene-shell ${styles.scrollLayout}`}>
          <ProductIntroduction />
          <NotebookStage
            activeStep={activeStep}
            onSelect={setActiveStep}
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
