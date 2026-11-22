"use client";

import { useEffect, useRef } from "react";
import styles from "./Interference.module.css";

/**
 * The whole page is treated as one projected signal: a standing raster, a bar
 * rolling down the glass, and the occasional break-up. The breaks are driven
 * from here rather than from CSS alone so they stay irregular, pause with the
 * tab, and never fire for someone who asked for reduced motion.
 */
export default function Interference() {
  const veil = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = veil.current;
    if (!node) return;
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let pending = 0;
    let recover = 0;

    function schedule(delay = 3200 + Math.random() * 9000) {
      pending = window.setTimeout(fire, delay);
    }
    function settle() {
      delete node!.dataset.break;
      delete root.dataset.signal;
    }
    function fire() {
      if (reduced.matches || document.hidden || root.hasAttribute("data-lexuri")) { schedule(4000); return; }
      // Most breaks are a flicker. Now and then the picture really loses tracking.
      const severity = Math.random() < 0.26 ? "hard" : "soft";
      node!.dataset.break = severity;
      root.dataset.signal = severity;
      recover = window.setTimeout(settle, severity === "hard" ? 430 : 190);
      schedule();
    }
    function wake() { if (document.hidden) { clearTimeout(recover); settle(); } }

    schedule(2400 + Math.random() * 2600);
    document.addEventListener("visibilitychange", wake);
    return () => {
      clearTimeout(pending);
      clearTimeout(recover);
      document.removeEventListener("visibilitychange", wake);
      settle();
    };
  }, []);

  return (
    <div ref={veil} className={styles.veil} aria-hidden="true">
      <i className={styles.raster} />
      <i className={styles.roll} />
      <i className={styles.snow} />
      <i className={styles.tear} />
      <i className={styles.tear} />
      <i className={styles.tear} />
    </div>
  );
}
