"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { editionCopy, LOCALES, type EditionLocale } from "@/i18n/edition";
import EntranceLogo from "./EntranceLogo";
import styles from "./Edition.module.css";

const COMPACT_SCROLL_DISTANCE = 180;
const FULL_TRANSITION_MS = 750;

export default function Masthead({ phase }: { phase: "loading" | "choosing" | "exiting" | "lifting" | "open" }) {
  const header = useRef<HTMLElement>(null);
  const { locale, setLocale } = useLanguage();
  const copy = editionCopy[locale as EditionLocale] ?? editionCopy.en;

  useEffect(() => {
    const masthead = header.current;
    if (!masthead) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const readScrollProgress = () => Math.max(0, Math.min(window.scrollY / COMPACT_SCROLL_DISTANCE, 1));
    let progress = readScrollProgress();
    let frame = 0;
    let lastFrameTime = 0;

    const paintSize = () => {
      const eased = reducedMotion.matches ? Number(progress >= 0.5) : progress ** 2 * (3 - 2 * progress);
      masthead.style.setProperty("--mast-progress", String(eased));
      masthead.style.setProperty("--mast-return-progress", String(1 - eased));
    };

    const animateSize = (now: number) => {
      frame = 0;
      const target = readScrollProgress();
      const distance = target - progress;
      // Switch timelines only where their visual states match.
      if (!reducedMotion.matches && progress === 1 && distance < 0) {
        masthead.setAttribute("data-opening", "");
      }
      const maxStep = Math.max(0, now - lastFrameTime) / FULL_TRANSITION_MS;
      lastFrameTime = now;

      progress = reducedMotion.matches || Math.abs(distance) <= maxStep
        ? target
        : progress + Math.sign(distance) * maxStep;

      if (reducedMotion.matches || progress === 0 || progress === 1) {
        masthead.removeAttribute("data-opening");
      }

      paintSize();
      if (progress !== target) frame = window.requestAnimationFrame(animateSize);
    };

    const scheduleSize = () => {
      if (frame) return;
      lastFrameTime = performance.now();
      frame = window.requestAnimationFrame(animateSize);
    };

    paintSize();
    window.addEventListener("scroll", scheduleSize, { passive: true });
    reducedMotion.addEventListener("change", scheduleSize);

    return () => {
      window.removeEventListener("scroll", scheduleSize);
      reducedMotion.removeEventListener("change", scheduleSize);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header ref={header} className={styles.mast}>
      <a href="#top" data-signature="" className={styles.signature} aria-label={copy.nav.home}>
        {(phase === "lifting" || phase === "open") && (
          <EntranceLogo followScroll />
        )}
      </a>
      <nav aria-label={copy.nav.home}>
        <a href="#trabalhos" data-marker="">{copy.nav.work}</a>
        <a href="#projetos" data-marker="">{copy.nav.projects}</a>
        <a href="#sobre" data-marker="">{copy.nav.about}</a>
        <a href="#contato" data-marker="">{copy.nav.contact}</a>
      </nav>
      <div className={styles.controls}>
        <div className={styles.tongues} role="group" aria-label={copy.gate.language}>
          {LOCALES.map(option => (
            <button
              key={option.id}
              type="button"
              lang={option.id}
              title={option.label}
              aria-pressed={locale === option.id}
              onClick={() => setLocale(option.id)}
            >
              {option.note}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
