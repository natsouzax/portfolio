"use client";

import Image from "next/image";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, useState, type PointerEvent, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { profile } from "@/data/portfolio";

import styles from "./Hero.module.css";

const portraitFrames = [
  { src: "/characters/identity-sprites-v3/portrait-real.webp", label: "facial reference" },
  { src: "/characters/identity-sprites-v3/portrait-half-scan.webp", label: "signal scan" },
  { src: "/characters/identity-sprites-v3/portrait-mesh-three-quarter.webp", label: "mesh projection" },
  { src: "/characters/identity-sprites-v3/portrait-mesh-profile.webp", label: "profile analysis" },
  { src: "/characters/identity-sprites-v3/portrait-mesh-back.webp", label: "rear scan" },
];

function PortraitFrame({ src, index, progress, reduceMotion }: {
  src: string;
  index: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  // Layers paint in capture order. Only the incoming view fades over the previous one.
  const opacity = useTransform(progress, [index * 0.2 - 0.08, index * 0.2], [0, 1]);
  return (
    <motion.div className={styles.frame} style={reduceMotion ? { opacity: index === 2 ? 1 : 0 } : { opacity }}>
      <Image src={src} alt={index === 0 ? "Holographic portrait of Natan" : ""} draggable={false} fill sizes="(max-width: 800px) 86vw, 45vw" preload={index === 0} unoptimized />
    </motion.div>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [scanStage, setScanStage] = useState(0);
  const dragOffset = useMotionValue(0);
  const dragRotateX = useMotionValue(0);
  const dragRotateY = useMotionValue(0);
  const pointerStart = useRef<{ x: number; y: number; offset: number } | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const logoOpacity = useTransform(scrollYProgress, [0, 0.12, 0.25], [1, 1, 0]);
  const logoY = useTransform(scrollYProgress, [0, 0.25], [0, -30]);
  const portraitY = useTransform(scrollYProgress, [0, 0.75], [8, -8]);
  const scrollRotate = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [-7, 5, -4, 7, 0]);
  const portraitRotate = useTransform([scrollRotate, dragRotateY], ([scroll, drag]) => Number(scroll) + Number(drag));
  const sceneProgress = useTransform([scrollYProgress, dragOffset], ([scroll, offset]) => Math.max(0, Math.min(1, Number(scroll) + Number(offset))));
  const portraitScale = useTransform(scrollYProgress, [0, 0.2, 0.7, 1], [0.84, 1, 1.04, 0.94]);
  useMotionValueEvent(sceneProgress, "change", (value) => {
    const nextStage = Math.min(4, Math.floor(value * 5));
    setScanStage((currentStage) => currentStage === nextStage ? currentStage : nextStage);
  });

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || !event.isPrimary || event.button !== 0 || !(event.target instanceof Element) || !event.target.closest("[data-face-card]")) return;
    dragOffset.stop();
    pointerStart.current = { x: event.clientX, y: event.clientY, offset: dragOffset.get() };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!pointerStart.current || !event.isPrimary) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - pointerStart.current.x;
    const dy = event.clientY - pointerStart.current.y;
    dragOffset.set(Math.max(-1, Math.min(1, pointerStart.current.offset + dx / Math.min(bounds.width * 0.5, 260))));
    dragRotateY.set(Math.max(-14, Math.min(14, (dx / bounds.width) * 28)));
    dragRotateX.set(Math.max(-9, Math.min(9, (-dy / bounds.height) * 18)));
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!pointerStart.current) return;
    pointerStart.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    animate(dragOffset, 0, { type: "spring", stiffness: 90, damping: 24 });
    animate(dragRotateX, 0, { type: "spring", stiffness: 160, damping: 22 });
    animate(dragRotateY, 0, { type: "spring", stiffness: 160, damping: 22 });
  }

  function handleKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    const direction = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
    if (!direction) return;
    event.preventDefault();
    const nextView = Math.max(0, Math.min(4, scanStage + direction));
    dragOffset.set(nextView * 0.2 + 0.01 - scrollYProgress.get());
  }

  return (
    <section ref={sectionRef} id="top" className={styles.story} aria-labelledby="hero-title">
      <div className={styles.sticky}>
        <div className={styles.ambient} aria-hidden="true" />
        <div className={styles.topline}>
          <span className={styles.topIdentity}>ODEVNTZN / PERSONAL SYSTEM</span>
          <span className={styles.live}><i /> IDENTITY SYSTEM / ONLINE</span>
        </div>

        <div className={styles.composition}>
          <div className={styles.copy}>
            <motion.p className={styles.kicker} style={reduceMotion ? undefined : { opacity: logoOpacity }}>
              <span>01</span> DIGITAL IDENTITY / PORTFOLIO
            </motion.p>
            <h1 id="hero-title">Ideas, made <em>real.</em></h1>
            <p className={styles.lede}>
              I’m Natan — a product-minded full stack developer connecting thoughtful design with dependable engineering.
            </p>
            <div className={styles.ctas}>
              <a className={styles.primary} href="#lexuri">Explore selected work <Icon name="arrowDown" /></a>
              <a className={styles.secondary} href="#contato">Start a conversation <Icon name="arrowUpRight" /></a>
            </div>
            <div className={styles.coordinates}>
              <span>BASED IN PORTUGAL</span><span>AVAILABLE FOR SELECT PROJECTS</span>
            </div>
          </div>

          <div
            className={styles.portraitStage}
            role="group"
            aria-label="Interactive holographic portrait. Scroll to scan or drag to look around. Use the left and right arrow keys to explore."
            tabIndex={reduceMotion ? undefined : 0}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={handleKeyboard}
          >
            <motion.div className={styles.logoReveal} style={reduceMotion ? undefined : { opacity: logoOpacity, y: logoY }}>
              <Image src="/brand/odevntzn-nucleo-animado.svg" alt="odevntzn" width={480} height={131} priority />
              <span>PERSONAL PORTFOLIO / 2026</span>
            </motion.div>
            <motion.div className={styles.portrait} data-face-card style={reduceMotion ? undefined : { y: portraitY, rotateX: dragRotateX, rotateY: portraitRotate, scale: portraitScale }}>
              {portraitFrames.map((frame, index) => <PortraitFrame key={frame.src} src={frame.src} index={index} progress={sceneProgress} reduceMotion={Boolean(reduceMotion)} />)}
              <div className={styles.frameHud} aria-hidden="true"><span>{portraitFrames[reduceMotion ? 2 : scanStage].label.toUpperCase()}</span></div>
              <motion.div className={styles.scanline} aria-hidden="true" style={{ scaleY: sceneProgress }} />
              <div className={styles.crosshair} aria-hidden="true"><i /><i /><i /><i /></div>
            </motion.div>
            <div className={styles.orbit} aria-hidden="true"><i /><i /></div>
            <div className={styles.readout}>
              <span className={styles.readoutDot} />
              <span>{reduceMotion || scanStage === 4 ? "SIGNAL RECOGNIZED" : "BIOMETRIC RECOGNITION"}</span>
              <span className={styles.readoutCode}>NTZ-0{scanStage + 1}</span>
            </div>
          </div>
        </div>

        <div className={styles.bottomline}>
          <span>SCROLL TO SCAN · DRAG TO TURN</span>
          <motion.span className={styles.progress} style={{ scaleX: reduceMotion ? 0 : scrollYProgress }} />
          <span>SCROLL / {profile.displayName.toUpperCase()}</span>
        </div>
      </div>
    </section>
  );
}
