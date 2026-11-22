"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Interference from "./Interference";
import Pointer from "./Pointer";
import MatrixField from "./MatrixField";
import Decode from "./Decode";
import Gate from "./Gate";
import SectionReveal from "./SectionReveal";
import styles from "./Edition.module.css";

export default function Entrance({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"loading" | "choosing" | "lifting" | "open">("loading");
  const logo = useRef<HTMLImageElement>(null);
  const site = useRef<HTMLDivElement>(null);
  const skipped = useRef(false);

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
    // Give the logo its animation time after the SVG is available, including on a cold load.
    const brand = Promise.resolve(logo.current?.decode()).catch(() => {}).then(() =>
      active ? wait(reduced ? 0 : 1700) : undefined
    );
    const ready = Promise.allSettled([brand, document.fonts.ready, poster?.decode()]);
    void Promise.race([ready, wait(4200)]).then(() => {
      if (active) setPhase("choosing");
    });
    return () => { active = false; timers.forEach(clearTimeout); };
  }, [phase]);

  useEffect(() => {
    if (phase === "open" && skipped.current) {
      site.current?.querySelector<HTMLAnchorElement>(".skip-link")?.focus({ preventScroll: true });
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "lifting") return;
    const done = window.setTimeout(() => setPhase("open"), matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 740);
    return () => clearTimeout(done);
  }, [phase]);

  return (
    <>
      {phase !== "open" && (
        <div className={styles.curtain} data-curtain="" data-phase={phase} aria-label="Portfolio introduction">
          <Image ref={logo} src="/brand/odevntzn-nucleo-animado.svg" alt="odevntzn" width={690} height={188} preload />
          {phase === "choosing"
            ? <Gate onEnter={() => setPhase("lifting")} />
            : <button type="button" onClick={() => { skipped.current = true; setPhase("lifting"); }}>Skip intro ↗</button>}
        </div>
      )}
      <noscript><style>{`[data-curtain]{display:none!important}[data-scene]{opacity:1!important;transform:none!important}`}</style></noscript>
      <div ref={site} data-scene="" data-phase={phase} className={styles.site}>{children}</div>
      {phase === "open" && <SectionReveal scene={site} />}
      {phase === "open" && <><MatrixField /><Interference /><Pointer /><Decode /></>}
    </>
  );
}

