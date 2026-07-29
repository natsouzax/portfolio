"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useIsReducedMotion } from "@/components/motion/useIsReducedMotion";

import styles from "./SoundProvider.module.css";
import {
  SynthSoundEngine,
  type SoundEffect,
  type SoundOptions,
} from "./synth";

type SoundContextValue = {
  enabled: boolean;
  toggleSound: () => void;
  playSound: (effect: SoundEffect, options?: SoundOptions) => void;
};

type SoundCue = {
  id: number;
  text: string;
};

const SoundContext = createContext<SoundContextValue | null>(null);

const SECTION_IDS = ["top", "sobre", "lexuri", "projetos", "contato"] as const;
type SectionId = (typeof SECTION_IDS)[number];

const sectionEffects: Record<
  SectionId,
  { effect?: SoundEffect; cue?: string; intensity?: number }
> = {
  top: { effect: "binary", cue: "RADAR", intensity: 0.68 },
  sobre: { effect: "calculations", cue: "CALCULATING", intensity: 0.68 },
  lexuri: { effect: "futuristic", cue: "SYSTEM ONLINE", intensity: 0.64 },
  projetos: {},
  contato: { effect: "confirm", cue: "OK", intensity: 0.68 },
};

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [cue, setCue] = useState<SoundCue | null>(null);
  const engineRef = useRef<SynthSoundEngine | null>(null);
  const enabledRef = useRef(false);
  const cueIdRef = useRef(0);
  const cueTimerRef = useRef<number | null>(null);
  const shouldReduceMotion = useIsReducedMotion();

  const getEngine = useCallback(() => {
    if (engineRef.current) return engineRef.current;
    if (typeof AudioContext === "undefined") return null;

    engineRef.current = new SynthSoundEngine();
    return engineRef.current;
  }, []);

  const showCue = useCallback((text: string) => {
    if (cueTimerRef.current !== null) {
      window.clearTimeout(cueTimerRef.current);
    }

    cueIdRef.current += 1;
    setCue({ id: cueIdRef.current, text });
    cueTimerRef.current = window.setTimeout(() => setCue(null), 680);
  }, []);

  const toggleSound = useCallback(() => {
    const engine = getEngine();
    if (!engine) return;

    if (enabled) {
      enabledRef.current = false;
      engine.play("powerOff");
      setEnabled(false);
      return;
    }

    enabledRef.current = true;
    setEnabled(true);
    void engine.unlock().then(() => {
      engine.play("powerOn");
      if (!shouldReduceMotion) showCue("POWER ON");
      void engine.preloadSamples().then(() => {
        if (enabledRef.current) {
          engine.play("binary", { intensity: 0.42, step: 0 });
        }
      });
    });
  }, [enabled, getEngine, shouldReduceMotion, showCue]);

  const playSound = useCallback(
    (effect: SoundEffect, options?: SoundOptions) => {
      if (!enabled) return;
      getEngine()?.play(effect, options);
    },
    [enabled, getEngine],
  );

  useEffect(() => {
    if (!enabled) return;

    const engine = getEngine();
    if (!engine) return;

    let animationFrame = 0;
    let lastY = window.scrollY;
    let lastTime = performance.now();
    let lastScrollSound = 0;
    let lastHoverSound = 0;
    let lastHoveredControl: Element | null = null;
    const hoverSelector = "a, button, [data-sound-hover]";

    const findActiveSection = (): SectionId => {
      const viewportMarker = window.innerHeight * 0.46;
      let activeId: SectionId = "top";

      for (const id of SECTION_IDS) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= viewportMarker) {
          activeId = id;
        }
      }

      return activeId;
    };

    let activeSection = findActiveSection();
    const maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    let scrollBucket = Math.floor((window.scrollY / maxScroll) * 30);

    const updateScrollSound = () => {
      animationFrame = 0;
      const now = performance.now();
      const currentY = window.scrollY;
      const elapsed = Math.max(16, now - lastTime);
      const delta = currentY - lastY;
      const velocity = Math.abs(delta) / elapsed;
      const currentMaxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const nextBucket = Math.floor((currentY / currentMaxScroll) * 30);

      if (
        !shouldReduceMotion &&
        nextBucket !== scrollBucket &&
        Math.abs(delta) > 3 &&
        now - lastScrollSound > 70
      ) {
        engine.play("scroll", {
          direction: delta >= 0 ? 1 : -1,
          intensity: Math.min(1.35, 0.5 + velocity * 0.7),
          step: nextBucket,
        });
        lastScrollSound = now;
        scrollBucket = nextBucket;
      }

      const nextSection = findActiveSection();
      if (nextSection !== activeSection) {
        activeSection = nextSection;
        const sectionSound = sectionEffects[nextSection];
        if (sectionSound.effect) {
          engine.play(sectionSound.effect, {
            intensity: sectionSound.intensity,
            direction: delta >= 0 ? 1 : -1,
            step: SECTION_IDS.indexOf(nextSection),
          });
        }
        if (!shouldReduceMotion && sectionSound.cue) {
          showCue(sectionSound.cue);
        }
      }

      lastY = currentY;
      lastTime = now;
    };

    const handleScroll = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateScrollSound);
    };

    const handlePointerOver = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest(hoverSelector);
      if (!target || target === lastHoveredControl) return;
      if (target.hasAttribute("data-sound-control")) return;

      const now = performance.now();
      if (now - lastHoverSound > 80) {
        const contextualEffect = target.getAttribute(
          "data-sound-hover",
        ) as SoundEffect | null;
        engine.play(contextualEffect ?? "hover", {
          intensity: contextualEffect ? 0.4 : 1,
        });
        lastHoverSound = now;
      }
      lastHoveredControl = target;
    };

    const handlePointerOut = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest(hoverSelector);
      if (target !== lastHoveredControl) return;

      const nextTarget = (event.relatedTarget as Element | null)?.closest(
        hoverSelector,
      );
      if (nextTarget !== target) lastHoveredControl = null;
    };

    const handleClick = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest("a, button");
      if (!target || target.hasAttribute("data-sound-control")) return;
      const contextualEffect = target.getAttribute("data-sound") as SoundEffect | null;

      if (target.matches("a[href]")) {
        if (contextualEffect === "check" || contextualEffect === "confirm") {
          engine.play(contextualEffect, { intensity: 0.62 });
          return;
        }
        if (contextualEffect) {
          engine.play(contextualEffect, { intensity: 0.46 });
        }
        engine.play("correct", { intensity: 0.62 });
        return;
      }

      engine.play(contextualEffect ?? "push", {
        intensity: contextualEffect ? 0.68 : 0.48,
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("pointerover", handlePointerOver);
    document.addEventListener("pointerout", handlePointerOut);
    document.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerout", handlePointerOut);
      document.removeEventListener("click", handleClick);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [enabled, getEngine, shouldReduceMotion, showCue]);

  useEffect(() => {
    return () => {
      if (cueTimerRef.current !== null) {
        window.clearTimeout(cueTimerRef.current);
      }
    };
  }, []);

  return (
    <SoundContext.Provider value={{ enabled, toggleSound, playSound }}>
      {children}
      {cue ? (
        <span key={cue.id} className={styles.cue} aria-hidden="true">
          {cue.text}
        </span>
      ) : null}
    </SoundContext.Provider>
  );
}

export function useSoundEffects() {
  const context = useContext(SoundContext);

  if (!context) {
    throw new Error("useSoundEffects must be used within SoundProvider");
  }

  return context;
}
