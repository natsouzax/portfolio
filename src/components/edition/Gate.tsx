"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { editionCopy, LOCALES, type EditionLocale } from "@/i18n/edition";
import styles from "./Gate.module.css";

export default function Gate({ onEnter }: { onEnter: () => void }) {
  const { locale, setLocale } = useLanguage();
  const panel = useRef<HTMLDivElement>(null);
  const copy = editionCopy[locale as EditionLocale]?.gate ?? editionCopy.en.gate;

  // The gate takes the focus so the keyboard lands on the choices, and keeps
  // it until one of them is made.
  useEffect(() => {
    const node = panel.current;
    if (!node) return;
    node.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
    function trap(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); onEnter(); return; }
      if (event.key !== "Tab") return;
      const stops = node!.querySelectorAll<HTMLElement>("button");
      if (!stops.length) return;
      const first = stops[0], last = stops[stops.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    node.addEventListener("keydown", trap);
    return () => node.removeEventListener("keydown", trap);
  }, [onEnter]);

  return (
    <div
      className={styles.gate}
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label={copy.heading}
    >
      <p className={styles.heading}>{copy.heading}</p>

      <div className={styles.row}>
        <span className={styles.legend} id="gate-language">{copy.language}</span>
        <div className={styles.choices} role="group" aria-labelledby="gate-language">
          {LOCALES.map(option => (
            <button
              key={option.id}
              type="button"
              lang={option.id}
              aria-pressed={locale === option.id}
              onClick={() => setLocale(option.id)}
            >
              <b>{option.note}</b> {option.label}
            </button>
          ))}
        </div>
      </div>

      <button type="button" className={styles.enter} onClick={onEnter}>
        {copy.enter} <span aria-hidden="true">↗</span>
      </button>
      <small className={styles.note}>{copy.note}</small>
    </div>
  );
}
