"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Interference from "./Interference";
import Pointer from "./Pointer";
import MatrixField from "./MatrixField";
import Decode from "./Decode";
import Gate from "./Gate";
import EntranceLogo from "./EntranceLogo";
import Masthead from "./Masthead";
import SectionReveal from "./SectionReveal";
import styles from "./Edition.module.css";

const LOGO_EXIT_MS = 640;

export default function Entrance({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"loading" | "choosing" | "exiting" | "lifting" | "open">("loading");
  const site = useRef<HTMLDivElement>(null);
  const navigation = useRef<HTMLDivElement>(null);
  const skipped = useRef(false);
  const enter = useCallback(() => {
    setPhase(matchMedia("(prefers-reduced-motion: reduce)").matches ? "open" : "exiting");
  }, []);

  useEffect(() => {
    if (phase === "open") return;
    const originalOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const content = site.current;
    const navigationContent = navigation.current;
    if (content) content.inert = true;
    if (navigationContent) navigationContent.inert = true;
    return () => {
      document.documentElement.style.overflow = originalOverflow;
      if (content) content.inert = false;
      if (navigationContent) navigationContent.inert = false;
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "loading") return;
    let active = true;
    const timers: number[] = [];
    const wait = (ms: number) => new Promise<void>((resolve) => timers.push(window.setTimeout(resolve, ms)));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const poster = site.current?.querySelector<HTMLImageElement>("[data-intro-poster]");
    const ready = Promise.allSettled([wait(reduced ? 0 : 1700), document.fonts.ready, poster?.decode()]);
    void Promise.race([ready, wait(4200)]).then(() => {
      if (active) setPhase("choosing");
    });
    return () => { active = false; timers.forEach(clearTimeout); };
  }, [phase]);

  useEffect(() => {
    if (phase === "open" && skipped.current) {
      navigation.current?.querySelector<HTMLAnchorElement>(".skip-link")?.focus({ preventScroll: true });
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "exiting") {
      const done = window.setTimeout(() => setPhase("lifting"), LOGO_EXIT_MS);
      return () => clearTimeout(done);
    }
    if (phase !== "lifting") return;
    const instant = matchMedia("(prefers-reduced-motion: reduce), (max-height: 520px)").matches;
    const done = window.setTimeout(() => setPhase("open"), instant ? 0 : 740);
    return () => clearTimeout(done);
  }, [phase]);

  return (
    <>
      {phase !== "open" && (
        <div
          className={styles.curtain}
          data-curtain=""
          data-phase={phase}
          aria-label="Portfolio introduction"
          style={{ "--logo-exit-duration": `${LOGO_EXIT_MS}ms` } as CSSProperties}
        >
          <EntranceLogo exiting={phase === "exiting"} />
          {(phase === "choosing" || phase === "exiting") && (
            <div className={styles.entranceGate} inert={phase === "exiting"}>
              <Gate onEnter={enter} />
            </div>
          )}
          {phase === "loading" && (
            <button type="button" onClick={() => { skipped.current = true; setPhase("lifting"); }}>Skip intro ↗</button>
          )}
        </div>
      )}
      <noscript><style>{`[data-curtain]{display:none!important}[data-scene]{opacity:1!important;transform:none!important}[data-site-navigation]{visibility:visible!important}`}</style></noscript>
      <div ref={navigation} data-site-navigation="" data-phase={phase} className={styles.navigation}>
        <a className="skip-link" href="#conteudo">Skip to content</a>
        <Masthead />
      </div>
      <div ref={site} data-scene="" data-phase={phase} className={styles.site}>{children}</div>
      {phase === "open" && <SectionReveal scene={site} />}
      {phase === "open" && <><MatrixField /><Interference /><Pointer /><Decode /></>}
    </>
  );
}

