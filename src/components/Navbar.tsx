"use client";

import { portfolioContent } from "@/data/portfolio";
import { useLanguage } from "@/i18n/LanguageProvider";

import styles from "./Navbar.module.css";

// The "N" drawn on a 5x5 matrix: two stems and a diagonal. Cell [0, 4] is the volt node.
const markModules: ReadonlyArray<readonly [number, number]> = [
  [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
  [0, 4], [1, 4], [2, 4], [3, 4], [4, 4],
  [1, 1], [2, 2], [3, 3],
];

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
          <svg className={styles.mark} viewBox="0 0 64 64" aria-hidden="true">
            <rect width="64" height="64" rx="14" />
            {markModules.map(([row, col]) => (
              <rect
                key={`${row}-${col}`}
                x={10.5 + col * 9}
                y={10.5 + row * 9}
                width="7"
                height="7"
                rx="1.5"
                className={row === 0 && col === 4 ? styles.markDot : undefined}
              />
            ))}
          </svg>
          <span className={styles.wordmark}>
            Natan<span> Oliveira</span>
            <i aria-hidden="true" />
          </span>
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
