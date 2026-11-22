"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { editionCopy, LOCALES, type EditionLocale } from "@/i18n/edition";
import styles from "./Edition.module.css";

export default function Masthead() {
  const { locale, setLocale } = useLanguage();
  const copy = editionCopy[locale as EditionLocale] ?? editionCopy.en;

  return (
    <header className={styles.mast}>
      <a href="#top" data-signature="" className={styles.signature} aria-label={copy.nav.home}>
        <svg viewBox="0 0 96 84" aria-hidden="true" fill="currentColor"><path d="M1 81 45.5 3.5 50.5 35ZM50 0 95 79.5 63.5 61ZM4.5 83 32.5 62 91 83Z"/></svg>
        odevntzn
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
