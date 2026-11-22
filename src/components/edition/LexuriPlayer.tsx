"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./LexuriPlayer.module.css";

const VIDEO = "ZbZSe6N_BXs";
const START = 5;
const END = 38;
const WATCH = `https://www.youtube.com/watch?v=${VIDEO}&t=${START}s`;

const EXPRESSIONS = [
  { time: 5.5, phrase: "I'm 'bout to say", meaning: "An informal way to say you’re going to speak in a moment.", translation: "Estou prestes a dizer", example: "I’m about to leave. Can I call you back?" },
  { time: 13.01, phrase: "take a break", meaning: "Stop what you’re doing for a little while to rest.", translation: "Fazer uma pausa", example: "Let’s take a break before we start the next lesson." },
  { time: 24.22, phrase: "by the way", meaning: "Use this to add something or gently change the subject.", translation: "A propósito", example: "By the way, I sent you the link yesterday." },
] as const;

type Player = {
  cueVideoById(options: { videoId: string; startSeconds: number; endSeconds: number }): void;
  getCurrentTime(): number;
  getIframe(): HTMLIFrameElement;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(time: number, allowSeekAhead: boolean): void;
  destroy(): void;
};
type PlayerOptions = {
  videoId: string;
  playerVars: { start: number; end: number; origin: string; playsinline: number; rel: number };
  events: {
    onReady(event: { target: Player }): void;
    onStateChange(event: { target: Player; data: number }): void;
    onError(): void;
  };
};
type YouTube = { Player: new (element: HTMLElement, options: PlayerOptions) => Player };
type YouTubeWindow = Window & { YT?: YouTube; onYouTubeIframeAPIReady?: () => void };

let apiRequest: Promise<YouTube> | undefined;

function loadYouTube(): Promise<YouTube> {
  const browser = window as YouTubeWindow;
  if (browser.YT?.Player) return Promise.resolve(browser.YT);
  if (apiRequest) return apiRequest;

  apiRequest = new Promise<YouTube>((resolve, reject) => {
    const script = document.createElement("script");
    const previous = browser.onYouTubeIframeAPIReady;
    const timeout = window.setTimeout(fail, 12_000);

    function cleanUp() {
      window.clearTimeout(timeout);
      script.removeEventListener("error", fail);
      if (browser.onYouTubeIframeAPIReady === ready) browser.onYouTubeIframeAPIReady = previous;
    }
    function fail() {
      cleanUp();
      script.remove();
      reject(new Error("YouTube player unavailable"));
    }
    function ready() {
      cleanUp();
      if (browser.YT?.Player) resolve(browser.YT);
      else reject(new Error("YouTube player unavailable"));
      previous?.();
    }

    browser.onYouTubeIframeAPIReady = ready;
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.addEventListener("error", fail);
    document.head.append(script);
  }).catch(error => {
    apiRequest = undefined;
    throw error;
  });

  return apiRequest;
}

type Status = "loading" | "ready" | "playing" | "paused" | "ended" | "unavailable";

export default function LexuriPlayer() {
  const region = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const player = useRef<Player | null>(null);
  const visible = useRef(false);
  const [activated, setActivated] = useState(false);
  const [status, setStatus] = useState<Status>("loading");
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const node = media.current;
    const lesson = region.current;
    if (!node || !lesson) return;
    const root = document.documentElement;
    const effects = new IntersectionObserver(([entry]) => {
      root.toggleAttribute("data-lexuri", entry.isIntersecting);
    });
    const preload = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      preload.disconnect();
      setActivated(true);
    }, { rootMargin: "400px 0px" });

    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting && entry.intersectionRatio >= 0.1;
      if (!visible.current) player.current?.pauseVideo();
    }, { threshold: 0.1 });
    function pauseInBackground() {
      if (document.hidden) player.current?.pauseVideo();
    }

    observer.observe(node);
    effects.observe(lesson);
    preload.observe(lesson);
    document.addEventListener("visibilitychange", pauseInBackground);
    return () => {
      observer.disconnect();
      effects.disconnect();
      preload.disconnect();
      delete root.dataset.lexuri;
      document.removeEventListener("visibilitychange", pauseInBackground);
    };
  }, []);

  useEffect(() => {
    if (!activated || !host.current) return;
    const container = host.current;
    let disposed = false;
    let failed = false;
    let readyTimeout: number | undefined;
    let embedded: Player | undefined;

    function unavailable() {
      if (disposed || failed) return;
      failed = true;
      window.clearTimeout(readyTimeout);
      embedded?.destroy();
      embedded = undefined;
      player.current = null;
      setStatus("unavailable");
    }

    void loadYouTube().then(api => {
      if (disposed) return;
      readyTimeout = window.setTimeout(unavailable, 15_000);
      embedded = new api.Player(container.appendChild(document.createElement("div")), {
        videoId: VIDEO,
        playerVars: { start: START, end: END, origin: window.location.origin, playsinline: 1, rel: 0 },
        events: {
          onReady({ target }) {
            if (disposed || failed) return;
            player.current = target;
            target.getIframe().title = "Happy by Pharrell Williams";
            target.cueVideoById({ videoId: VIDEO, startSeconds: START, endSeconds: END });
          },
          onStateChange({ target, data }) {
            if (disposed || failed) return;
            if (data === 5) {
              window.clearTimeout(readyTimeout);
              setStatus(previous => previous === "loading" ? "ready" : previous);
            }
            if (data === 1) {
              if (!visible.current || document.hidden) {
                target.pauseVideo();
                return;
              }
              setSelected(null);
              setStatus("playing");
            }
            if (data === 2) setStatus(previous => previous === "playing" ? "paused" : previous);
            if (data === 0) setStatus("ended");
          },
          onError: unavailable,
        },
      });
    }).catch(unavailable);

    return () => {
      disposed = true;
      window.clearTimeout(readyTimeout);
      embedded?.destroy();
      player.current = null;
      container.replaceChildren();
    };
  }, [activated]);

  useEffect(() => {
    if (status !== "playing") return;

    const timer = window.setInterval(() => {
      const current = player.current;
      if (!current) return;
      const time = current.getCurrentTime();
      const index = EXPRESSIONS.findLastIndex(expression => expression.time <= time);
      setActive(Math.max(0, index));
      if (time >= END) {
        current.pauseVideo();
        setStatus("ended");
      }
    }, 120);

    return () => window.clearInterval(timer);
  }, [status]);

  function togglePlayback() {
    const current = player.current;
    if (!current) return;

    if (status === "playing") {
      current.pauseVideo();
      return;
    }
    if (status === "ended") {
      setActive(0);
      current.seekTo(START, true);
    }
    current.playVideo();
  }

  function explore(index: number) {
    player.current?.pauseVideo();
    setSelected(previous => previous === index ? null : index);
  }

  const expression = selected === null ? undefined : EXPRESSIONS[selected];
  const showPoster = status === "loading" || status === "unavailable";
  const playbackLabel = status === "playing" ? "Pause" : status === "ended" ? "Replay clip" : "Resume";
  const canControlPlayback = status === "playing" || status === "paused" || status === "ended";

  return (
    <div className={styles.player} ref={region}>
      <header className={styles.brand}>
        <div className={styles.wordmark}>
          <Image src="/projects/lexuri/logo-icon.svg" width={36} height={36} alt="" />
          <strong>Lexuri.</strong>
        </div>
        <a href="https://www.lexuri.app/">Open Lexuri <span aria-hidden="true">↗</span></a>
      </header>
      <div className={styles.lesson}>
        <div className={styles.screen}>
          <div className={styles.media} ref={media}>
            {showPoster && <Image src="/projects/lexuri/happy-poster.jpg" alt="" fill sizes="(max-width: 760px) 90vw, 52vw" className={styles.poster} />}
            <div ref={host} className={styles.embed} data-visible={!showPoster} />
          </div>
          <div className={styles.controls}>
            <div><strong>Happy</strong><span>Pharrell Williams</span></div>
            {status === "loading" && <span className={styles.hint} role="status">Loading video…</span>}
            {status === "unavailable" && (
              <a className={styles.play} href={WATCH} target="_blank" rel="noreferrer">Watch on YouTube ↗</a>
            )}
            {canControlPlayback && (
              <button type="button" className={styles.play} onClick={togglePlayback}>
                <span aria-hidden="true">{status === "playing" ? "Ⅱ" : "▶"}</span> {playbackLabel}
              </button>
            )}
          </div>
          {status === "unavailable" && <p className={styles.hint} role="status">The clip couldn’t load here. You can still explore the expressions.</p>}
        </div>

        <div className={styles.lyrics}>
          <p className={styles.label}>Lyrics in context</p>
          <ol className={styles.lines} aria-label="Expressions from the clip">
            {EXPRESSIONS.map(({ time, phrase }, index) => (
              <li key={time} data-current={active === index}>
                <span className={styles.time} aria-hidden="true">0:{String(Math.floor(time)).padStart(2, "0")}</span>
                <button
                  type="button"
                  aria-pressed={selected === index}
                  aria-current={active === index ? "true" : undefined}
                  aria-controls="lexuri-expression"
                  onClick={() => explore(index)}
                >{phrase}</button>
              </li>
            ))}
          </ol>
          <div className={styles.definition} id="lexuri-expression" aria-live="polite">
            {expression ? (
              <>
                <strong lang="pt">{expression.translation}</strong>
                <p>{expression.meaning}</p>
                <p className={styles.example}>{expression.example}</p>
              </>
            ) : <p className={styles.hint}>Tap an expression to pause and see what it means.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
