"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { useState } from "react";

import { useIsReducedMotion } from "@/components/motion/useIsReducedMotion";
import { SPRING } from "@/lib/motion";

import styles from "./TiltScene.module.css";

export default function TiltScene({
  children,
  className,
  intensity = 6,
  lift = 8,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
  lift?: number;
}) {
  const shouldReduceMotion = useIsReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const [isActive, setIsActive] = useState(false);

  const rotateX = useSpring(
    useTransform(pointerY, [-0.5, 0.5], [intensity, -intensity]),
    SPRING.object,
  );
  const rotateY = useSpring(
    useTransform(pointerX, [-0.5, 0.5], [-intensity, intensity]),
    SPRING.object,
  );
  const glowX = useSpring(
    useTransform(pointerX, [-0.5, 0.5], [-120, 120]),
    SPRING.ambient,
  );
  const glowY = useSpring(
    useTransform(pointerY, [-0.5, 0.5], [-90, 90]),
    SPRING.ambient,
  );

  function handleMouseMove(event: ReactMouseEvent<HTMLDivElement>) {
    if (shouldReduceMotion) return;

    if ((event.target as Element).closest("[data-tilt-lock]")) {
      resetScene();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function resetScene() {
    setIsActive(false);
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <motion.div
      data-tilt-scene="true"
      className={`${styles.scene}${className ? ` ${className}` : ""}`}
      onMouseEnter={() => {
        if (!shouldReduceMotion) setIsActive(true);
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetScene}
      style={shouldReduceMotion ? undefined : { rotateX, rotateY }}
      animate={shouldReduceMotion ? undefined : { y: isActive ? -lift : 0 }}
      transition={SPRING.object}
    >
      <motion.span
        className={styles.pointerGlow}
        aria-hidden="true"
        style={shouldReduceMotion ? undefined : { x: glowX, y: glowY }}
        animate={{ opacity: isActive && !shouldReduceMotion ? 1 : 0 }}
      />
      {children}
    </motion.div>
  );
}
