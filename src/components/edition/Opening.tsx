"use client";

import Portrait from "./Portrait";
import NameBand from "./NameBand";
import { useLanguage } from "@/i18n/LanguageProvider";
import { editionCopy, type EditionLocale } from "@/i18n/edition";
import styles from "./Edition.module.css";

export default function Opening() {
  const { locale } = useLanguage();
  const copy = (editionCopy[locale as EditionLocale] ?? editionCopy.en).opening;
  return (
    <section id="top" className={styles.opening} aria-labelledby="identity-name">
      <div className={styles.viewport}>
        <div className={styles.theatre}>
          <div className={styles.field} aria-hidden="true" />
          <h1 id="identity-name" className={styles.name}><span>Natan</span>{" "}<span>Oliveira</span><NameBand /></h1>
          <div className={styles.subject}><Portrait /></div>
          <span className={styles.caption}>{copy.caption}</span>
        </div>
        <div className={styles.lower}>
          <p>{copy.role}<br/><span>{copy.place}</span></p>
          <a href="#sobre" data-marker="">{copy.about} <span aria-hidden="true">↓</span></a>
        </div>
      </div>
    </section>
  );
}

