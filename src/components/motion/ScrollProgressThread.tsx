"use client";

import { motion, useScroll, useSpring } from "motion/react";

import { SPRING } from "@/lib/motion";

import styles from "./ScrollProgressThread.module.css";

const chapters = ["Entrada", "Método", "Lexuri", "Projetos", "Contato"];

export default function ScrollProgressThread() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, SPRING.ambient);

  return (
    <aside className={styles.rail} aria-label="Progresso da história">
      <span className={styles.label}>workspace</span>
      <div className={styles.track} aria-hidden="true">
        <motion.span className={styles.progress} style={{ scaleY: progress }} />
        {chapters.map((chapter) => (
          <span key={chapter} className={styles.dot} />
        ))}
      </div>
      <span className="sr-only">
        A página possui cinco capítulos: {chapters.join(", ")}.
      </span>
    </aside>
  );
}
