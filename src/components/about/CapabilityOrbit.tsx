"use client";

import { useCallback, useEffect, useState } from "react";

import { useIsReducedMotion } from "@/components/motion/useIsReducedMotion";
import { useDesktopPinning } from "@/hooks/useDesktopPinning";
import { capabilities } from "@/data/portfolio";

import styles from "./CapabilityOrbit.module.css";

const COUNT = capabilities.length;
const STEP = 360 / COUNT;
const AUTO_ADVANCE_MS = 6400;

/** Posição de cada nó em relação ao que está de frente: 0 frente, 2 fundo. */
function relativeSlot(index: number, active: number) {
  return (index - active + COUNT) % COUNT;
}

function CapabilityList() {
  return (
    <div className={styles.fallbackGrid}>
      {capabilities.map((capability) => (
        <article key={capability.number}>
          <span className={styles.number}>{capability.number}</span>
          <h3>{capability.title}</h3>
          <p>{capability.description}</p>
          <ul aria-label={`Competências em ${capability.title}`}>
            {capability.technologies.map((technology) => (
              <li key={technology}>{technology}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

export default function CapabilityOrbit() {
  const shouldReduceMotion = useIsReducedMotion();
  const hasRoomForOrbit = useDesktopPinning();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const select = useCallback((index: number) => {
    setActive(((index % COUNT) + COUNT) % COUNT);
  }, []);

  const orbiting = hasRoomForOrbit && !shouldReduceMotion;

  useEffect(() => {
    if (!orbiting || paused) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % COUNT);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [orbiting, paused]);

  if (!orbiting) {
    return <CapabilityList />;
  }

  const spin = -active * STEP;

  return (
    <div
      className={styles.orbit}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className={styles.stage}>
        <div className={styles.ring} style={{ transform: `rotateY(${spin}deg)` }}>
          {/*
            Base do sistema: núcleo comum + raios até cada capacidade. Fica
            abaixo dos cards, num plano horizontal, para permanecer visível —
            é ele que mostra que as quatro partem do mesmo centro.
          */}
          <div className={styles.hub} aria-hidden="true">
            <span className={styles.core} />
            <span className={styles.hubPath} />
            {capabilities.map((capability, index) => (
              <i
                key={`spoke-${capability.number}`}
                className={styles.spoke}
                data-slot={relativeSlot(index, active)}
                style={{ transform: `rotateY(${index * STEP}deg) rotateX(90deg)` }}
              />
            ))}
          </div>

          {capabilities.map((capability, index) => {
            const slot = relativeSlot(index, active);
            return (
              <article
                key={capability.number}
                className={styles.node}
                data-slot={slot}
                style={{
                  transform: `translate(-50%, -50%) rotateY(${index * STEP}deg) translateZ(var(--orbit-radius))`,
                }}
              >
                <span className={styles.number}>{capability.number}</span>
                <h3>{capability.title}</h3>
                <p>{capability.description}</p>
                <ul aria-label={`Competências em ${capability.title}`}>
                  {capability.technologies.map((technology) => (
                    <li key={technology}>{technology}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>

      <div className={styles.controls} role="group" aria-label="Capacidades">
        {capabilities.map((capability, index) => (
          <button
            key={capability.number}
            type="button"
            onClick={() => select(index)}
            aria-pressed={index === active}
            className={index === active ? styles.activeControl : undefined}
          >
            <span>{capability.number}</span>
            <span>{capability.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
