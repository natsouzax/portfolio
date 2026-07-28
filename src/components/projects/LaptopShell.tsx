"use client";

import { motion, type MotionValue } from "motion/react";
import type { ReactNode } from "react";

import styles from "./LaptopShell.module.css";

type AnimatedNumber = number | MotionValue<number>;

export default function LaptopShell({
  lidRotate,
  lift = 0,
  glow = 1,
  children,
}: {
  lidRotate: AnimatedNumber;
  lift?: AnimatedNumber;
  glow?: AnimatedNumber;
  children: ReactNode;
}) {
  return (
    <div className={styles.perspective}>
      <motion.div className={styles.notebook} style={{ y: lift }}>
        <motion.div
          className={styles.lid}
          style={{
            rotateX: lidRotate,
            transformOrigin: "50% 100%",
            transformStyle: "preserve-3d",
          }}
        >
          <div className={styles.lidFace}>
            <div className={styles.camera} aria-hidden="true" />
            <div className={styles.screen}>
              {children}
              <motion.span className={styles.screenGlow} style={{ opacity: glow }} />
            </div>
          </div>
          <div className={styles.lidBack} aria-hidden="true">
            <span>NO</span>
          </div>
        </motion.div>

        <div className={styles.hinge} aria-hidden="true" />
        <div className={styles.base} aria-hidden="true">
          <div className={styles.keyboard}>
            {Array.from({ length: 42 }, (_, index) => (
              <span key={index} />
            ))}
          </div>
          <span className={styles.trackpad} />
        </div>
        <div className={styles.frontEdge} aria-hidden="true">
          <span />
        </div>
      </motion.div>
    </div>
  );
}
