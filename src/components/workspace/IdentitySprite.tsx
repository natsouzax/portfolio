"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { useSoundEffects } from "@/audio/SoundProvider";
import { useIsReducedMotion } from "@/components/motion/useIsReducedMotion";
import { useLanguage } from "@/i18n/LanguageProvider";

import styles from "./IdentitySprite.module.css";

export type IdentityMode = "arriving" | "observing" | "presenting" | "waving";

const ARRIVAL_CYCLE_MS = 8800;
const FRAME_TRANSITIONS = [0.23, 0.38, 0.52, 0.68, 0.72] as const;
const AUDIO_SYNC_LEAD_MS = 130;
const AUDIO_SYNC_GRACE_MS = AUDIO_SYNC_LEAD_MS;

type IdentityFrame = {
  primary: string;
  holograms?: string[];
  code: string;
};

const frames: Record<IdentityMode, IdentityFrame> = {
  arriving: {
    primary: "/characters/identity-sprites-v3/portrait-real.webp",
    holograms: [
      "/characters/identity-sprites-v3/portrait-mesh-three-quarter.webp",
      "/characters/identity-sprites-v3/portrait-mesh-back.webp",
      "/characters/identity-sprites-v3/portrait-mesh-profile.webp",
      "/characters/identity-sprites-v3/portrait-half-scan.webp",
    ],
    code: "ID.01",
  },
  observing: {
    primary: "/characters/identity-sprites-v1/portrait-front.webp",
    holograms: ["/characters/identity-sprites-v1/portrait-mesh-three-quarter.webp"],
    code: "ID.02",
  },
  presenting: {
    primary: "/characters/identity-sprites-v1/fullbody-profile.webp",
    holograms: ["/characters/identity-sprites-v1/portrait-mesh-profile.webp"],
    code: "ID.03",
  },
  waving: {
    primary: "/characters/identity-sprites-v1/fullbody-wave.webp",
    code: "ID.04",
  },
};

const frameCopy = {
  pt: {
    arriving: {
      alt: "Retrato 3D de Natan Oliveira chegando ao workspace",
      axis: "entrada / 032°",
    },
    observing: {
      alt: "Retrato 3D de Natan Oliveira observando o sistema",
      axis: "scan / identidade",
    },
    presenting: {
      alt: "Renderização 3D de Natan Oliveira apresentando uma ideia",
      axis: "produto / perfil",
    },
    waving: {
      alt: "Renderização 3D de Natan Oliveira acenando",
      axis: "saída / online",
    },
  },
  en: {
    arriving: {
      alt: "3D portrait of Natan Oliveira arriving at the workspace",
      axis: "entry / 032°",
    },
    observing: {
      alt: "3D portrait of Natan Oliveira observing the system",
      axis: "scan / identity",
    },
    presenting: {
      alt: "3D rendering of Natan Oliveira presenting an idea",
      axis: "product / profile",
    },
    waving: {
      alt: "3D rendering of Natan Oliveira waving",
      axis: "exit / online",
    },
  },
} as const;

export default function IdentitySprite({
  mode,
  preload = false,
  sizes,
}: {
  mode: IdentityMode;
  preload?: boolean;
  sizes: string;
}) {
  const { locale } = useLanguage();
  const { enabled: soundEnabled, playSound } = useSoundEffects();
  const shouldReduceMotion = useIsReducedMotion();
  const spriteRef = useRef<HTMLDivElement>(null);
  const cycleStartRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);
  const frame = frames[mode];
  const copy = frameCopy[locale][mode];

  useEffect(() => {
    cycleStartRef.current = mode === "arriving" ? performance.now() : null;
  }, [mode]);

  useEffect(() => {
    const sprite = spriteRef.current;
    if (!sprite || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting && entry.intersectionRatio > 0.12;
      },
      { threshold: [0, 0.12, 0.5] },
    );

    observer.observe(sprite);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (mode !== "arriving" || !soundEnabled || shouldReduceMotion) return;

    const sprite = spriteRef.current;
    const primaryLayer = sprite?.querySelector<HTMLElement>(
      `.${styles.primaryLayer}`,
    );
    const cssAnimationTime = primaryLayer?.getAnimations()[0]?.currentTime;
    const fallbackCycleStart = cycleStartRef.current ?? performance.now();
    const elapsed = typeof cssAnimationTime === "number"
      ? ((cssAnimationTime % ARRIVAL_CYCLE_MS) + ARRIVAL_CYCLE_MS) % ARRIVAL_CYCLE_MS
      : (performance.now() - fallbackCycleStart) % ARRIVAL_CYCLE_MS;
    const timers: number[] = [];

    FRAME_TRANSITIONS.forEach((progress, step) => {
      const transitionAt = progress * ARRIVAL_CYCLE_MS;
      let delay = transitionAt - AUDIO_SYNC_LEAD_MS - elapsed;

      if (delay < -AUDIO_SYNC_GRACE_MS) delay += ARRIVAL_CYCLE_MS;
      else delay = Math.max(0, delay);

      const playTransition = () => {
        if (isVisibleRef.current && document.visibilityState === "visible") {
          playSound("frameTransition", {
            step,
            intensity: step === FRAME_TRANSITIONS.length - 1 ? 0.9 : 0.68,
          });
        }

        timers[step] = window.setTimeout(playTransition, ARRIVAL_CYCLE_MS);
      };

      timers[step] = window.setTimeout(playTransition, delay);
    });

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [mode, playSound, shouldReduceMotion, soundEnabled]);

  return (
    <div
      ref={spriteRef}
      className={`${styles.sprite} ${styles[mode]}`}
      data-identity-frame={frame.code}
    >
      <span className={styles.depthPlaneBack} aria-hidden="true" />
      <span className={styles.depthPlaneMiddle} aria-hidden="true" />

      <span className={styles.primaryLayer}>
        <Image
          src={frame.primary}
          alt={copy.alt}
          fill
          preload={preload}
          sizes={sizes}
          unoptimized
          className={styles.spriteImage}
        />
      </span>

      {frame.holograms?.map((hologram, index) => (
        <span
          key={hologram}
          className={`${styles.hologramLayer} ${styles[`hologram${index + 1}`]}`}
          aria-hidden="true"
        >
          <Image
            src={hologram}
            alt=""
            fill
            sizes={sizes}
            unoptimized
            className={styles.spriteImage}
          />
        </span>
      ))}

      <span className={styles.scanBeam} aria-hidden="true" />
      <span className={styles.crtNoise} aria-hidden="true" />
      <span className={styles.crtGlitch} aria-hidden="true" />
      <span className={styles.depthGrid} aria-hidden="true" />
      <span className={styles.dataRail} aria-hidden="true">
        <strong>{frame.code}</strong>
        <i />
        <small>{copy.axis}</small>
      </span>
    </div>
  );
}
