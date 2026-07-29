"use client";

import Image from "next/image";
import { motion } from "motion/react";

import { useIsReducedMotion } from "@/components/motion/useIsReducedMotion";
import IdentitySprite, { type IdentityMode } from "@/components/workspace/IdentitySprite";
import { EASE } from "@/lib/motion";
import { useLanguage } from "@/i18n/LanguageProvider";

import styles from "./WorkspaceGuide.module.css";

export type GuideMode = IdentityMode;

const labels: Record<"pt" | "en", Record<GuideMode, string>> = {
  pt: {
    arriving: "chegando ao workspace",
    observing: "observando o sistema",
    presenting: "apresentando uma ideia",
    waving: "até a próxima",
  },
  en: {
    arriving: "arriving at the workspace",
    observing: "observing the system",
    presenting: "presenting an idea",
    waving: "see you next time",
  },
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
  const { locale } = useLanguage();
  const shouldReduceMotion = useIsReducedMotion();
  const float = floatingMotion[mode];
  const label = labels[locale][mode];

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
          {mode === "observing" || mode === "waving" ? (
            <Image
              src={mode === "waving" ? "/characters/natan-waving-v2.png" : "/characters/natan-observing.png"}
              alt={locale === "pt" ? `Natan Oliveira em pixel art, ${label}` : `Pixel art of Natan Oliveira, ${label}`}
              fill
              priority={priority}
              sizes="210px"
              className={styles.image}
            />
          ) : (
            <IdentitySprite
              mode={mode}
              preload={priority}
              sizes={variant === "hero" ? "(max-width: 720px) 52vw, 300px" : "210px"}
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
        natan.state / {label}
      </figcaption>
    </motion.figure>
  );
}
