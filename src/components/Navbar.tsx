"use client";

import Image from "next/image";
import { useSoundEffects } from "@/audio/SoundProvider";
import { portfolioContent } from "@/data/portfolio";
import { useLanguage } from "@/i18n/LanguageProvider";

import styles from "./Navbar.module.css";

export default function Navbar() {
  const { locale } = useLanguage();
  const { enabled: soundEnabled, toggleSound } = useSoundEffects();
  const { navigation } = portfolioContent[locale];

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        <a className={styles.brand} href="#top" aria-label="Back to top" data-sound="whoosh">
          <Image className={styles.logo} src="/brand/odevntzn-nucleo-animado.svg" alt="odevntzn" width={150} height={41} />
        </a>

        <div className={styles.links}>
          {navigation.map((item) => (
            <a key={item.href} href={item.href} data-sound="whoosh">
              <span>{item.chapter}</span>{item.label}
            </a>
          ))}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.soundToggle}
            onClick={toggleSound}
            data-enabled={soundEnabled || undefined}
            data-sound-control
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? "Disable sound effects" : "Enable sound effects"}
            title={soundEnabled ? "Disable sound effects" : "Enable sound effects"}
          >
            <span className={styles.soundGlyph} aria-hidden="true"><i /><i /><i /><i /></span>
            <span className={styles.soundText}>SFX</span>
          </button>
          <a className={styles.availability} href="#contato" data-sound="whoosh">
            <span className={styles.statusDot} aria-hidden="true" />
            <span className={styles.availabilityLong}>Open to opportunities</span>
            <span className={styles.availabilityShort}>Contact</span>
          </a>
        </div>
      </nav>
    </header>
  );
}
