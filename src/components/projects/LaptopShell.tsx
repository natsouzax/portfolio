"use client";

import { motion, type MotionValue } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import styles from "./LaptopShell.module.css";

type AnimatedNumber = number | MotionValue<number>;

export default function LaptopShell({
  lidRotate,
  lift = 0,
  glow = 1,
  children,
  controls,
}: {
  lidRotate: AnimatedNumber;
  lift?: AnimatedNumber;
  glow?: AnimatedNumber;
  children: ReactNode;
  controls?: ReactNode;
}) {
  const startsOpen = typeof lidRotate === "number" && Math.abs(lidRotate) < 0.08;
  const [isLidOpen, setIsLidOpen] = useState(startsOpen);
  const isLidOpenRef = useRef(startsOpen);

  useEffect(() => {
    function updateOpenState(value: number) {
      const nextIsOpen = Math.abs(value) < 0.08;
      if (nextIsOpen === isLidOpenRef.current) return;

      isLidOpenRef.current = nextIsOpen;
      setIsLidOpen(nextIsOpen);
    }

    if (typeof lidRotate === "number") {
      updateOpenState(lidRotate);
      return;
    }

    updateOpenState(lidRotate.get());
    return lidRotate.on("change", updateOpenState);
  }, [lidRotate]);

  return (
    <div className={styles.perspective} data-open={isLidOpen || undefined}>
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

        {controls ? (
          <motion.div
            className={styles.controlLid}
            style={{ opacity: glow }}
          >
            <div className={styles.screenControls}>{controls}</div>
          </motion.div>
        ) : null}

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
