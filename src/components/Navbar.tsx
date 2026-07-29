"use client";

import { portfolioContent, profile } from "@/data/portfolio";
import { useLanguage } from "@/i18n/LanguageProvider";

import styles from "./Navbar.module.css";

export default function Navbar() {
  const { locale, toggleLocale } = useLanguage();
  const { navigation } = portfolioContent[locale];
  const copy = locale === "pt"
    ? {
        navigation: "Navegação principal",
        home: "Voltar ao início",
        availability: "Aberto a oportunidades",
        contact: "Contato",
        switchLanguage: "Mudar o site para inglês",
      }
    : {
        navigation: "Main navigation",
        home: "Back to top",
        availability: "Open to opportunities",
        contact: "Contact",
        switchLanguage: "Switch the website to Portuguese",
      };

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label={copy.navigation}>
        <a className={styles.brand} href="#top" aria-label={copy.home}>
          <span className={styles.mark} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
          <span>{profile.displayName}</span>
        </a>

        <div className={styles.links}>
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              <span>{item.chapter}</span>
              {item.label}
            </a>
          ))}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.languageToggle}
            onClick={toggleLocale}
            aria-label={copy.switchLanguage}
            title={copy.switchLanguage}
          >
            <span
              className={styles.languageOption}
              data-active={locale === "pt" || undefined}
            >
              <span className={styles.flag} aria-hidden="true">🇧🇷</span>
              PT
            </span>
            <i aria-hidden="true" />
            <span
              className={styles.languageOption}
              data-active={locale === "en" || undefined}
            >
              <span className={styles.flag} aria-hidden="true">🇬🇧</span>
              EN
            </span>
          </button>

          <a className={styles.availability} href="#contato">
            <span className={styles.statusDot} aria-hidden="true" />
            <span className={styles.availabilityLong}>{copy.availability}</span>
            <span className={styles.availabilityShort}>{copy.contact}</span>
          </a>
        </div>
      </nav>
    </header>
  );
}
