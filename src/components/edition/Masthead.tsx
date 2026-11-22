"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { editionCopy, LOCALES, type EditionLocale } from "@/i18n/edition";
import EntranceLogo from "./EntranceLogo";
import styles from "./Edition.module.css";

const COMPACT_SCROLL_DISTANCE = 180;
const LOGO_SCROLL_START = 8;

export default function Masthead() {
  const header = useRef<HTMLElement>(null);
  const { locale, setLocale } = useLanguage();
  const copy = editionCopy[locale as EditionLocale] ?? editionCopy.en;

  useEffect(() => {
    const masthead = header.current;
    if (!masthead) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let previousProgress = -1;

    const syncSize = () => {
      frame = 0;
      const scrollY = window.scrollY;
      if (scrollY >= LOGO_SCROLL_START) masthead.toggleAttribute("data-logo-playing", true);
      else if (scrollY <= 1) masthead.removeAttribute("data-logo-playing");

      const scrollProgress = Math.max(0, Math.min(scrollY / COMPACT_SCROLL_DISTANCE, 1));
      // Smoothstep slows the resize near both endpoints.
      const progress = reducedMotion.matches
        ? Number(scrollProgress >= 0.5)
        : scrollProgress ** 2 * (3 - 2 * scrollProgress);

      if (progress === previousProgress) return;
      previousProgress = progress;
      masthead.style.setProperty("--mast-progress", String(progress));
    };

    const scheduleSize = () => {
      if (!frame) frame = window.requestAnimationFrame(syncSize);
    };

    syncSize();
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
        <EntranceLogo waitForScroll />
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
