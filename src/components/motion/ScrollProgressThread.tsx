"use client";

import { motion, useScroll, useSpring } from "motion/react";

import { SPRING } from "@/lib/motion";
import { useLanguage } from "@/i18n/LanguageProvider";

import styles from "./ScrollProgressThread.module.css";

export default function ScrollProgressThread() {
  const { locale } = useLanguage();
  const copy = locale === "pt"
    ? {
        label: "Progresso da história",
        chapters: ["Entrada", "Método", "Lexuri", "Projetos", "Contato"],
        summary: "A página possui cinco capítulos",
      }
    : {
        label: "Story progress",
        chapters: ["Entrance", "Method", "Lexuri", "Projects", "Contact"],
        summary: "The page has five chapters",
      };
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, SPRING.ambient);

  return (
    <aside className={styles.rail} aria-label={copy.label}>
      <span className={styles.label}>workspace</span>
      <div className={styles.track} aria-hidden="true">
        <motion.span className={styles.progress} style={{ scaleY: progress }} />
        {copy.chapters.map((chapter) => (
          <span key={chapter} className={styles.dot} />
        ))}
      </div>
      <span className="sr-only">
        {copy.summary}: {copy.chapters.join(", ")}.
      </span>
    </aside>
  );
}
