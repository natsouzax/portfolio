"use client";

import { lexuriSteps } from "./steps";
import styles from "./StepCycle.module.css";

const COUNT = lexuriSteps.length;
const STEP = 360 / COUNT;
/** Inclinação do plano orbital — o ciclo é visto de cima, em perspectiva. */
const TILT = 64;
/** Ângulo que fica de frente para quem olha (base da elipse). */
const FRONT = 180;

export default function StepCycle({
  activeStep,
  onSelect,
}: {
  activeStep: number;
  onSelect: (index: number) => void;
}) {
  const spin = FRONT - activeStep * STEP;

  return (
    <div className={styles.cycle}>
      <div className={styles.stage}>
        <div
          className={styles.plane}
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
                aria-pressed={isActive}
                onClick={() => onSelect(index)}
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
        ciclo contínuo — a continuidade devolve a pessoa à imersão
      </p>
    </div>
  );
}
