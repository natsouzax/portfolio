"use client";

import { useEffect, useRef, useState } from "react";

import { useLanguage } from "@/i18n/LanguageProvider";

import { lexuriStepsByLocale } from "./steps";
import styles from "./StepCycle.module.css";

const COUNT = 4;
const STEP = 360 / COUNT;
/** Inclinação do plano orbital — o ciclo é visto de cima, em perspectiva. */
const TILT = 64;
/** Ângulo que fica de frente para quem olha (base da elipse). */
const FRONT = 180;
const STEP_SETTLE_MS = 660;

export default function StepCycle({
  activeStep,
  onSelect,
}: {
  activeStep: number;
  onSelect: (index: number) => void;
}) {
  const { locale } = useLanguage();
  const [isSettling, setIsSettling] = useState(false);
  const previousStepRef = useRef(activeStep);
  const lexuriSteps = lexuriStepsByLocale[locale];
  const loopNote = locale === "pt"
    ? "ciclo contínuo — a continuidade devolve a pessoa à imersão"
    : "continuous cycle — continuity brings each person back to immersion";
  const spin = FRONT - activeStep * STEP;

  useEffect(() => {
    if (previousStepRef.current === activeStep) return;
    previousStepRef.current = activeStep;
    setIsSettling(true);

    const timer = window.setTimeout(() => setIsSettling(false), STEP_SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [activeStep]);

  function selectStep(index: number) {
    if (index === activeStep) return;
    setIsSettling(true);
    onSelect(index);
  }

  return (
    <div className={styles.cycle}>
      <div className={styles.stage}>
        <div
          className={styles.plane}
          data-settling={isSettling || undefined}
          aria-busy={isSettling}
          style={{ transform: `rotateX(${TILT}deg) rotateZ(${spin}deg)` }}
        >
          <span className={styles.path} aria-hidden="true" />
          <span className={styles.pulse} aria-hidden="true" />

          {lexuriSteps.map((step, index) => {
            const angle = index * STEP;
            const isActive = index === activeStep;

            return (
              <button
                key={step.id}
                type="button"
                className={styles.node}
                data-active={isActive || undefined}
                data-sound="binary"
                aria-pressed={isActive}
                onClick={() => selectStep(index)}
                style={{
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(calc(var(--cycle-radius) * -1))`,
                }}
              >
                {/* Contra-rotação: o rótulo permanece de frente, legível. */}
                <span
                  className={styles.face}
                  style={{
                    transform: `rotateZ(${-(angle + spin)}deg) rotateX(${-TILT}deg)`,
                  }}
                >
                  <small>{step.number}</small>
                  <em>{step.eyebrow}</em>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className={styles.loopNote}>
        <span aria-hidden="true">↻</span>
        {loopNote}
      </p>
    </div>
  );
}
