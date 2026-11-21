"use client";

import { useEffect, useRef } from "react";
import styles from "./Fragments.module.css";

/**
 * What the opening throws off, the page is built from.
 *
 * When the portrait breaks apart at the end of the pinned opening, its pieces
 * carry on down the page, arc outward, and settle onto the edges of the work
 * that follows — the headline, each project's frame, the archive. As they land
 * the real elements come up underneath them and the shards go out.
 *
 * The whole thing is one scroll-derived number, so it runs backwards exactly
 * as it runs forwards, and it leaves the page fully visible if it never runs.
 */
const SHARDS = 190;
const TURN = 0.74; // Where the portrait starts to come apart, as in Portrait.tsx.

type Shard = {
  // Where it leaves the figure, in that element's own 0..1 space.
  fromX: number; fromY: number;
  // Which target it belongs to, and how far along that target's perimeter.
  target: number; along: number;
  // Arc, timing and drawing.
  bowX: number; bowY: number; delay: number; size: number; spin: number; tone: number;
};

// Thrown hard, then settling: most of the travel happens early so the pieces
// are seen arriving and holding on the edge rather than drifting the whole way.
const ease = (t: number) => 1 - Math.pow(1 - t, 2.6);
const bound = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

// A point on the outline of a rectangle, 0..1 the whole way round.
function perimeter(rect: DOMRect, along: number) {
  const half = rect.width + rect.height;
  const run = along * 2 * half;
  if (run < rect.width) return { x: rect.left + run, y: rect.top };
  if (run < half) return { x: rect.right, y: rect.top + (run - rect.width) };
  if (run < half + rect.width) return { x: rect.right - (run - half), y: rect.bottom };
  return { x: rect.left, y: rect.bottom - (run - half - rect.width) };
}

export default function Fragments() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const layer = canvas.current;
    if (!layer) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const opening = document.querySelector<HTMLElement>("#top");
    const work = document.querySelector<HTMLElement>("#projetos");
    const figure = document.querySelector<HTMLElement>('#top [role="slider"]');
    if (!opening || !work || !figure) return;

    const context = layer.getContext("2d", { alpha: true });
    if (!context) return;

    const shards: Shard[] = [];
    const targets = () => Array.from(work.querySelectorAll<HTMLElement>("[data-assemble]"));
    const count = () => Math.max(1, targets().length);
    for (let i = 0; i < SHARDS; i++) {
      shards.push({
        fromX: Math.random(), fromY: Math.random(),
        target: i % count(), along: (i * 0.6180339887) % 1,
        bowX: (Math.random() - 0.5) * 1.7, bowY: Math.random() * 0.55 + 0.1,
        delay: Math.random() * 0.34, size: 4 + Math.random() * 13,
        spin: (Math.random() - 0.5) * 7, tone: Math.random(),
      });
    }

    let frame = 0, disposed = false, running = false;
    let scale = 1;
    // The figure is gone by the time the shards are mid-flight, so its last
    // position before it broke up is what they are remembered as leaving.
    let origin: DOMRect | null = null;

    function resize() {
      scale = Math.min(window.devicePixelRatio || 1, 2);
      layer!.width = Math.round(window.innerWidth * scale);
      layer!.height = Math.round(window.innerHeight * scale);
    }

    function progress() {
      const top = opening!.offsetTop;
      const start = top + TURN * (opening!.offsetHeight - window.innerHeight);
      const finish = work!.offsetTop + window.innerHeight * 0.55;
      if (finish <= start) return 0;
      return bound((window.scrollY - start) / (finish - start));
    }

    function paint() {
      frame = 0;
      if (disposed) return;
      const p = progress();
      work!.style.setProperty("--assembly", p.toFixed(4));

      context!.setTransform(scale, 0, 0, scale, 0, 0);
      context!.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (p > 0 && p < 1) {
        if (p < 0.4 || !origin) origin = figure!.getBoundingClientRect();
        const marks = targets().map(node => node.getBoundingClientRect());
        context!.globalCompositeOperation = "lighter";
        for (const shard of shards) {
          const t = bound((p - shard.delay) / Math.max(0.0001, 1 - shard.delay));
          if (t <= 0 || t >= 1) continue;
          const k = ease(t);
          const from = {
            x: origin.left + shard.fromX * origin.width,
            y: origin.top + shard.fromY * origin.height,
          };
          const mark = marks[shard.target % Math.max(1, marks.length)];
          const to = mark ? perimeter(mark, shard.along) : from;
          // A quadratic arc: thrown outwards, then drawn back into place.
          const bowX = (from.x + to.x) / 2 + shard.bowX * window.innerWidth * 0.42;
          const bowY = (from.y + to.y) / 2 + shard.bowY * window.innerHeight;
          const inv = 1 - k;
          const x = inv * inv * from.x + 2 * inv * k * bowX + k * k * to.x;
          const y = inv * inv * from.y + 2 * inv * k * bowY + k * k * to.y;

          // In fast as it tears loose, out as it lands.
          // A step further along the same curve gives the heading, and how
          // far it moved gives the streak: long while it is travelling, a
          // still shard once it is on the edge.
          const kn = ease(Math.min(1, t + 0.012));
          const invn = 1 - kn;
          const nx = invn * invn * from.x + 2 * invn * kn * bowX + kn * kn * to.x;
          const ny = invn * invn * from.y + 2 * invn * kn * bowY + kn * kn * to.y;
          const run = Math.hypot(nx - x, ny - y);
          const angle = run > 0.01 ? Math.atan2(ny - y, nx - x) : shard.spin;

          const alpha = Math.min(1, t / 0.06) * Math.min(1, (1 - t) / 0.3);
          const size = shard.size * (1.35 - k * 0.5);
          const streak = size + Math.min(run * 2.6, 52);
          context!.save();
          context!.translate(x, y);
          context!.rotate(angle);
          // The trail, then the piece itself.
          context!.globalAlpha = alpha * 0.3;
          context!.fillStyle = "#7fd84a";
          context!.fillRect(-streak, -size / 8, streak, size / 4);
          context!.globalAlpha = alpha * 0.92;
          context!.fillStyle = shard.tone > 0.72 ? "#f2ffd2" : "#b4ff72";
          context!.fillRect(-size / 2, -size / 7, size, size / 3.5);
          if (shard.tone > 0.55) context!.fillRect(-size / 7, -size / 2.4, size / 3.5, size / 1.2);
          context!.restore();
        }
        context!.globalCompositeOperation = "source-over";
      }

      if (running) queue();
    }
    function queue() { if (!frame && !disposed) frame = requestAnimationFrame(paint); }

    function check() {
      const p = progress();
      const live = p > 0 && p < 1 && !reduced.matches;
      if (live === running) { if (live) queue(); return; }
      running = live;
      if (live) queue();
      else {
        // Clear the canvas and hand the page back its own visibility.
        context!.setTransform(scale, 0, 0, scale, 0, 0);
        context!.clearRect(0, 0, window.innerWidth, window.innerHeight);
        work!.style.setProperty("--assembly", p >= 1 ? "1" : "0");
        if (reduced.matches) work!.style.setProperty("--assembly", "1");
        origin = null;
      }
    }

    function onResize() { resize(); check(); }

    resize();
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", onResize);
    reduced.addEventListener("change", check);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", onResize);
      reduced.removeEventListener("change", check);
      work.style.removeProperty("--assembly");
    };
  }, []);

  return <canvas ref={canvas} aria-hidden="true" className={styles.shards} />;
}
