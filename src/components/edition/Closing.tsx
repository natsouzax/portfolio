"use client";

import { profile } from "@/data/portfolio";
import { Icon } from "@/components/ui/Icon";
import Crowd from "./Crowd";
import { useLanguage } from "@/i18n/LanguageProvider";
import { editionCopy, type EditionLocale } from "@/i18n/edition";
import styles from "./Closing.module.css";

export default function Closing() {
  const { locale } = useLanguage();
  const copy = (editionCopy[locale as EditionLocale] ?? editionCopy.en).closing;
  return (
    <footer id="contato" className={styles.closing} aria-labelledby="closing-title">
      <div className={styles.invitation}>
        <div className={styles.copy}>
          <p className={styles.status} data-section-reveal="copy"><i aria-hidden="true"/> {copy.status}</p>
          <h2 id="closing-title" data-section-reveal="heading"><span>{copy.title}</span><br/><em>{copy.titleEm}</em></h2>
        </div>
        <a className={styles.email} data-marker="" href={`mailto:${profile.professionalEmail}`}>
          {copy.email} <Icon name="arrowUpRight" />
        </a>
      </div>
      <Crowd />
      <div className={styles.bottom}>
        <span>{profile.displayName} <span className={styles.slash}>/</span> Portugal</span>
        <nav aria-label="Contact and social links">
          <a href={profile.whatsappUrl} data-marker="" target="_blank" rel="noreferrer">WhatsApp</a>
          <a href={profile.githubUrl} data-marker="" target="_blank" rel="noreferrer">GitHub</a>
          <a href={profile.linkedinUrl} data-marker="" target="_blank" rel="noreferrer">LinkedIn</a>
        </nav>
        <a href="#top" className={styles.back} data-marker="">{copy.back} <span aria-hidden="true">↑</span></a>
      </div>
    </footer>
  );
}
