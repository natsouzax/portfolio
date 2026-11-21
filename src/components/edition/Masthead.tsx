"use client";

import { useSoundEffects } from "@/audio/SoundProvider";
import styles from "./Edition.module.css";

export default function Masthead() {
  const { enabled, toggleSound } = useSoundEffects();
  return (
    <header className={styles.mast}>
      <a href="#top" data-signature="" className={styles.signature} aria-label="odevntzn home">
        <svg viewBox="0 0 96 84" aria-hidden="true" fill="currentColor"><path d="M1 81 45.5 3.5 50.5 35ZM50 0 95 79.5 63.5 61ZM4.5 83 32.5 62 91 83Z"/></svg>
        odevntzn
      </a>
      <nav aria-label="Main navigation"><a href="#projetos" data-marker="">Work</a><a href="#sobre" data-marker="">About</a><a href="#contato" data-marker="">Contact ↗</a></nav>
      <button className={styles.audio} data-marker="" type="button" aria-pressed={enabled} aria-label={enabled ? "Mute sound" : "Enable sound"} onClick={toggleSound}>
        <span aria-hidden="true">▂▄▆▃</span> Sound {enabled ? "on" : "off"}
      </button>
    </header>
  );
}

