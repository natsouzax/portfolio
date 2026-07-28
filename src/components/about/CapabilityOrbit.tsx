"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";

import { useIsReducedMotion } from "@/components/motion/useIsReducedMotion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { capabilities } from "@/data/portfolio";

import styles from "./CapabilityOrbit.module.css";

const COUNT = capabilities.length;
const STEP = 360 / COUNT;
const AUTO_ADVANCE_MS = 6400;
/**
 * O anel é horizontal: precisa de largura, não de altura. O palco ocupa ~26rem
 * e os controles ~4rem, então 560px de altura já sobra. Usar o gate do
 * scroll-pin do Lexuri (680px) escondia o carrossel em notebooks 1366x768 com
 * a barra do navegador — altura útil ali fica por volta de 650px.
 */
const ORBIT_QUERY = "(min-width: 880px) and (min-height: 560px)";
/** Graus de rotação por pixel arrastado. */
const DRAG_DEG_PER_PX = 0.32;
/** Abaixo disso o gesto conta como clique, não como arrasto. */
const CLICK_SLOP_PX = 6;

function wrap(index: number) {
  return ((index % COUNT) + COUNT) % COUNT;
}

/** Posição de cada nó em relação ao que está de frente: 0 frente, 2 fundo. */
function relativeSlot(index: number, active: number) {
  return wrap(index - active);
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
  const hasRoomForOrbit = useMediaQuery(ORBIT_QUERY);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  /** Graus de deslocamento enquanto o dedo/mouse está pressionado. */
  const [dragDeg, setDragDeg] = useState(0);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef({ startX: 0, moved: false });
  const controlsRef = useRef<HTMLDivElement>(null);

  const select = useCallback((index: number) => setActive(wrap(index)), []);

  const orbiting = hasRoomForOrbit && !shouldReduceMotion;

  useEffect(() => {
    if (!orbiting || paused || dragging) return;

    const timer = window.setInterval(() => {
      setActive((current) => wrap(current + 1));
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [orbiting, paused, dragging]);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    // Sem isto o pointer capture do palco engole o clique nas setas.
    if ((event.target as HTMLElement).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = { startX: event.clientX, moved: false };
    setDragging(true);
    setDragDeg(0);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const dx = event.clientX - gesture.current.startX;
    if (Math.abs(dx) > CLICK_SLOP_PX) gesture.current.moved = true;
    setDragDeg(dx * DRAG_DEG_PER_PX);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    // Encaixa no card mais próximo do que foi arrastado.
    setActive((current) => wrap(current - Math.round(dragDeg / STEP)));
    setDragDeg(0);
    setDragging(false);
  }

  /** Clique num card só conta se não houve arrasto — evita seleção acidental. */
  function handleCardClick(index: number) {
    if (gesture.current.moved) return;
    select(index);
  }

  function handleControlsKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next = wrap(active + (event.key === "ArrowRight" ? 1 : -1));
    select(next);
    const buttons = controlsRef.current?.querySelectorAll("button");
    buttons?.[next]?.focus();
  }

  if (!orbiting) {
    return <CapabilityList />;
  }

  const spin = -active * STEP + dragDeg;

  return (
    <div
      className={styles.orbit}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className={styles.stage}
        data-dragging={dragging || undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className={styles.ring}
          data-dragging={dragging || undefined}
          style={{ transform: `rotateY(${spin}deg)` }}
        >
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
                onClick={() => handleCardClick(index)}
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

        {/*
          Num anel de quatro, os cards vizinhos ficam a 90° — de perfil, sem
          área clicável útil. Estas setas são o alvo confiável; o arrasto e a
          barra abaixo cobrem os outros modos de interação.
        */}
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowPrev}`}
          onClick={() => select(active - 1)}
          aria-label="Capacidade anterior"
        >
          ‹
        </button>
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowNext}`}
          onClick={() => select(active + 1)}
          aria-label="Próxima capacidade"
        >
          ›
        </button>

        <p className={styles.hint} aria-hidden="true">
          arraste o anel ou use as setas
        </p>
      </div>

      <div
        ref={controlsRef}
        className={styles.controls}
        role="group"
        aria-label="Capacidades"
        onKeyDown={handleControlsKeyDown}
      >
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
