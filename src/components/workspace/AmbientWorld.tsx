"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useCallback, useEffect, useState } from "react";

import { useIsReducedMotion } from "@/components/motion/useIsReducedMotion";
import { useSceneCapableViewport } from "@/hooks/useSceneCapableViewport";
import { DURATION, EASE, SPRING } from "@/lib/motion";
import { SCENE_LAYER_OPACITY, SCROLL_ROTATION } from "@/lib/scene";

import AmbientScene3D from "./AmbientScene3D";
import styles from "./AmbientWorld.module.css";

export default function AmbientWorld() {
  const shouldReduceMotion = useIsReducedMotion();
  const isSceneCapableViewport = useSceneCapableViewport();
  const [hasSceneFailed, setHasSceneFailed] = useState(false);
  const [hasRenderedFrame, setHasRenderedFrame] = useState(false);

  // Gate order: reduced motion first, then viewport/input capability, then the
  // WebGL failure latch. All three resolve to `false` on the server and on the
  // first client render, so the fallback markup can never mismatch.
  const wantsScene3D =
    !shouldReduceMotion && isSceneCapableViewport && !hasSceneFailed;
  const enablesAmbientMotion =
    !shouldReduceMotion && isSceneCapableViewport;

  // Derived rather than stored: if the gate closes (resize, WebGL loss) the CSS
  // layer comes straight back with no effect-driven state sync.
  const is3DLive = wantsScene3D && hasRenderedFrame;

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, SPRING.ambient);
  const smoothY = useSpring(pointerY, SPRING.ambient);
  const { scrollYProgress } = useScroll();
  const gridY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const orbitRotation = useTransform(
    scrollYProgress,
    [0, 1],
    [SCROLL_ROTATION.fromDeg, SCROLL_ROTATION.toDeg],
  );
  const nearX = useTransform(smoothX, [-1, 1], [-26, 26]);
  const nearY = useTransform(smoothY, [-1, 1], [-18, 18]);
  const farX = useTransform(smoothX, [-1, 1], [12, -12]);
  const farY = useTransform(smoothY, [-1, 1], [8, -8]);

  const handleSceneReady = useCallback(() => setHasRenderedFrame(true), []);
  const handleSceneFailure = useCallback(() => {
    setHasSceneFailed(true);
    setHasRenderedFrame(false);
  }, []);

  useEffect(() => {
    if (!enablesAmbientMotion) {
      pointerX.set(0);
      pointerY.set(0);
      return;
    }

    function updatePointer(event: PointerEvent) {
      pointerX.set((event.clientX / window.innerWidth) * 2 - 1);
      pointerY.set((event.clientY / window.innerHeight) * 2 - 1);
    }

    window.addEventListener("pointermove", updatePointer, { passive: true });
    return () => window.removeEventListener("pointermove", updatePointer);
  }, [enablesAmbientMotion, pointerX, pointerY]);

  const layerTransition = { duration: DURATION.scene, ease: EASE.soft };

  return (
    <div className={styles.world} aria-hidden="true">
      <motion.div className={styles.grid} style={enablesAmbientMotion ? { y: gridY, x: farX } : undefined} />
      {/*
        The light blobs and orbit rings only fade out once the canvas has proven
        it rendered a frame — not merely once the capability gate passed.
      */}
      <motion.div
        className={styles.atmosphere}
        animate={{ opacity: is3DLive ? 0 : 1 }}
        transition={layerTransition}
      >
        <motion.div className={styles.lightTop} style={enablesAmbientMotion ? { x: nearX, y: nearY } : undefined} />
        <motion.div className={styles.lightMiddle} style={enablesAmbientMotion ? { x: farX, y: farY } : undefined} />
        <motion.div className={styles.orbitOne} style={enablesAmbientMotion ? { rotate: orbitRotation, x: nearX } : undefined} />
        <motion.div className={styles.orbitTwo} style={enablesAmbientMotion ? { rotate: orbitRotation, x: farX } : undefined} />
      </motion.div>
      {wantsScene3D ? (
        <motion.div
          className={styles.scene}
          initial={{ opacity: 0 }}
          animate={{ opacity: is3DLive ? SCENE_LAYER_OPACITY : 0 }}
          transition={layerTransition}
        >
          <AmbientScene3D
            pointerX={smoothX}
            pointerY={smoothY}
            scrollYProgress={scrollYProgress}
            onReady={handleSceneReady}
            onFailure={handleSceneFailure}
          />
        </motion.div>
      ) : null}
      <div className={styles.noise} />
    </div>
  );
}
