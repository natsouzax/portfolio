"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Interference from "./Interference";
import Pointer from "./Pointer";
import MatrixField from "./MatrixField";
import Decode from "./Decode";
import styles from "./Edition.module.css";

export default function Entrance({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"loading" | "lifting" | "open">("loading");
  const logo = useRef<HTMLImageElement>(null);
  const site = useRef<HTMLDivElement>(null);
  const skip = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (phase === "open") return;
    const originalOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const content = site.current;
    if (content) content.inert = true;
    return () => {
      document.documentElement.style.overflow = originalOverflow;
      if (content) content.inert = false;
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "loading") return;
    let active = true;
    const timers: number[] = [];
    const wait = (ms: number) => new Promise<void>((resolve) => timers.push(window.setTimeout(resolve, ms)));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const poster = site.current?.querySelector<HTMLImageElement>("[data-intro-poster]");
    const ready = Promise.allSettled([logo.current?.decode(), document.fonts.ready, poster?.decode()]);
    void Promise.all([Promise.race([ready, wait(4800)]), wait(reduced ? 120 : 2400)]).then(() => {
      if (active) setPhase("lifting");
    });
    return () => { active = false; timers.forEach(clearTimeout); };
  }, [phase]);

  useEffect(() => {
    if (phase !== "lifting") return;
    const done = window.setTimeout(() => setPhase("open"), matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1000);
    return () => clearTimeout(done);
  }, [phase]);

  return (
    <>
      {phase !== "open" && (
        <div className={styles.curtain} data-curtain="" data-phase={phase} aria-label="Portfolio introduction">
          <Image ref={logo} src="/brand/odevntzn-nucleo-animado.svg" alt="odevntzn" width={690} height={188} preload />
          <button ref={skip} type="button" onClick={() => setPhase("open")}>Skip intro ↗</button>
        </div>
      )}
      <noscript><style>{`[data-curtain]{display:none!important}`}</style></noscript>
      <div ref={site} data-scene="" className={styles.site}>{children}</div>
      {phase === "open" && <><MatrixField /><Interference /><Pointer /><Decode /></>}
    </>
  );
}

