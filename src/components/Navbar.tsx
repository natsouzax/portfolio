"use client";

import Image from "next/image";
import { portfolioContent } from "@/data/portfolio";
import { useLanguage } from "@/i18n/LanguageProvider";

import styles from "./Navbar.module.css";

export default function Navbar() {
  const { locale } = useLanguage();
  const { navigation } = portfolioContent[locale === "fr" ? "en" : locale];

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        <a className={styles.brand} href="#top" aria-label="Back to top">
          <Image className={styles.logo} src="/brand/odevntzn-nucleo-animado.svg" alt="odevntzn" width={150} height={41} />
        </a>

        <div className={styles.links}>
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              <span>{item.chapter}</span>{item.label}
            </a>
          ))}
        </div>

        <div className={styles.actions}>
          <a className={styles.availability} href="#contato">
            <span className={styles.statusDot} aria-hidden="true" />
            <span className={styles.availabilityLong}>Open to opportunities</span>
            <span className={styles.availabilityShort}>Contact</span>
          </a>
        </div>
      </nav>
    </header>
  );
}
