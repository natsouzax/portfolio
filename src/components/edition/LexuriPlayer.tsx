"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./LexuriPlayer.module.css";

/**
 * What Lexuri actually does, playable on the page: a line goes past word by
 * word, and the word you stop on opens its meaning. Reach for any word and the
 * track holds there, which is the product's whole gesture.
 *
 * The line is written for this demo rather than taken from a song.
 */
const LINE = [
  { word: "Every" },
  { word: "word", gloss: "palavra", note: "noun · a single unit of language" },
  { word: "you" },
  { word: "said", gloss: "disse", note: "past of “say”" },
  { word: "is" },
  { word: "still", gloss: "ainda", note: "adverb · continuing up to now" },
  { word: "playing", gloss: "tocando", note: "from “play” · sounding, repeating" },
  { word: "in" },
  { word: "my" },
  { word: "head", gloss: "cabeça", note: "idiom · “in my head” = in my mind" },
];

const BARS = [38, 62, 90, 54, 76, 44, 96, 58, 34, 70, 86, 48, 64, 92, 40];

export default function LexuriPlayer() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pinned, setPinned] = useState<number | null>(null);
  const region = useRef<HTMLDivElement>(null);

  // Play only while it is on screen and only if motion is welcome.
  useEffect(() => {
    const node = region.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;
    const watch = new IntersectionObserver(([entry]) => setPlaying(entry.isIntersecting));
    watch.observe(node);
    return () => watch.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || pinned !== null) return;
    const tick = window.setInterval(() => setIndex(i => (i + 1) % LINE.length), 1250);
    return () => clearInterval(tick);
  }, [playing, pinned]);

  const active = pinned ?? index;
  const entry = LINE[active];

  return (
    <div className={styles.player} ref={region}>
      <div className={styles.bezel}>
        <header className={styles.head}>
          <span className={styles.badge}>Demo track</span>
          <span className={styles.meta}>English in context</span>
        </header>

        <div className={styles.stage}>
          <p className={styles.line}>
            {LINE.map((item, i) => (
              <button
                key={item.word + i}
                type="button"
                className={styles.word}
                data-state={i === active ? "active" : i < active ? "past" : "ahead"}
                data-known={item.gloss ? "" : undefined}
                aria-pressed={pinned === i}
                onClick={() => setPinned(pinned === i ? null : i)}
                onFocus={() => setPinned(i)}
              >
                {item.word}
              </button>
            ))}
          </p>

          <div className={styles.card} aria-live="polite">
            {entry.gloss ? (
              <>
                <strong>{entry.word}</strong>
                <span className={styles.gloss}>{entry.gloss}</span>
                <small>{entry.note}</small>
              </>
            ) : (
              <small className={styles.hint}>Tap any highlighted word to keep it.</small>
            )}
          </div>
        </div>

        <footer className={styles.transport}>
          <button
            type="button"
            className={styles.play}
            aria-pressed={playing && pinned === null}
            onClick={() => { setPinned(null); setPlaying(p => !p); }}
          >
            <span aria-hidden="true">{playing && pinned === null ? "❚❚" : "▶"}</span>
            {playing && pinned === null ? "Pause" : "Play"}
          </button>
          <div className={styles.wave} aria-hidden="true" data-running={playing && pinned === null ? "" : undefined}>
            {BARS.map((height, i) => (
              <i key={i} style={{ "--h": height + "%", "--i": i } as React.CSSProperties} />
            ))}
          </div>
          <span className={styles.counter} aria-hidden="true">
            {String(active + 1).padStart(2, "0")}/{String(LINE.length).padStart(2, "0")}
          </span>
        </footer>
      </div>
    </div>
  );
}
