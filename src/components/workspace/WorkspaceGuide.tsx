"use client";

import Image from "next/image";
import { motion } from "motion/react";

import { useIsReducedMotion } from "@/components/motion/useIsReducedMotion";
import { EASE } from "@/lib/motion";

import styles from "./WorkspaceGuide.module.css";

export type GuideMode = "arriving" | "observing" | "presenting" | "waving";

const labels: Record<GuideMode, string> = {
  arriving: "chegando ao workspace",
  observing: "observando o sistema",
  presenting: "apresentando uma ideia",
  waving: "até a próxima",
};

const images: Record<GuideMode, string> = {
  arriving: "/characters/natan-arriving.png",
  observing: "/characters/natan-observing.png",
  presenting: "/characters/natan-presenting.png",
  waving: "/characters/natan-waving-v2.png",
};

const floatingMotion: Record<GuideMode, { y: number[]; rotate: number[] }> = {
  arriving: { y: [0, -7, 0], rotate: [-0.6, 0.7, -0.6] },
  observing: { y: [0, -4, 0], rotate: [0.35, -0.35, 0.35] },
  presenting: { y: [0, -5, 0], rotate: [-0.3, 0.4, -0.3] },
  waving: { y: [2, 0, -2, 0, 2], rotate: [-0.2, 0.15, 0, -0.12, -0.2] },
};

export default function WorkspaceGuide({
  mode,
  variant = "compact",
  priority = false,
}: {
  mode: GuideMode;
  variant?: "hero" | "compact" | "ending";
  priority?: boolean;
}) {
  const shouldReduceMotion = useIsReducedMotion();
  const float = floatingMotion[mode];

  return (
    <motion.figure
      className={`${styles.guide} ${styles[mode]} ${styles[variant]}`}
      initial={variant === "ending" && !shouldReduceMotion ? { opacity: 0, y: 28, scale: 0.96 } : false}
      whileInView={variant === "ending" && !shouldReduceMotion ? { opacity: 1, y: 0, scale: 1 } : undefined}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ type: "spring", stiffness: 95, damping: 18, mass: 0.8 }}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.025, rotateY: -3 }}
    >
      <div className={styles.frame}>
        <span className={styles.characterOrbit} aria-hidden="true">
          <i />
        </span>
        <motion.div
          className={styles.imageWrap}
          animate={shouldReduceMotion ? undefined : { y: float.y, rotate: float.rotate }}
          transition={{ duration: mode === "waving" ? 4.4 : 4.2, ease: EASE.inOut, repeat: Infinity }}
        >
          <Image
            src={images[mode]}
            alt={`Natan Oliveira em pixel art, ${labels[mode]}`}
            fill
            priority={priority}
            sizes={variant === "hero" ? "(max-width: 720px) 52vw, 300px" : "210px"}
            className={`${styles.image} ${styles.frameOne}`}
          />
          {mode === "waving" && (
            <Image
              src="/characters/natan-waving-alt-v2.png"
              alt=""
              fill
              aria-hidden="true"
              sizes="210px"
              className={`${styles.image} ${styles.frameTwo}`}
            />
          )}
          <span className={styles.scanlines} aria-hidden="true" />
        </motion.div>
        <span className={styles.pixelSparkOne} aria-hidden="true" />
        <span className={styles.pixelSparkTwo} aria-hidden="true" />
        <span className={styles.cornerOne} aria-hidden="true" />
        <span className={styles.cornerTwo} aria-hidden="true" />
      </div>
      <figcaption className={styles.caption}>
        <span className={styles.liveDot} aria-hidden="true" />
        natan.state / {labels[mode]}
      </figcaption>
    </motion.figure>
  );
}
