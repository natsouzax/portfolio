"use client";

import { useEffect, useRef } from "react";

/**
 * A grid of glyphs laid over the whole page that is invisible until the
 * pointer disturbs it. Cells near the cursor wake, scramble and fade; fast
 * movement and clicks shed falling columns of code. It reads the brightness
 * of whatever sits under the pointer, so the glyphs are lime on the dark
 * chapters and a deep green on the paper ones.
 *
 * The loop only runs while something is still glowing, so an idle page costs
 * nothing. Off for reduced motion; on touch it only answers taps.
 */
// Binary weighted heavier, then maths and programming symbols.
const GLYPHS = "0101010101010101" + "+-×÷=≠≈<>≤≥±∑∏∫√∞πλΔ∂∇" + "{}[]()<>/\|&!?;:*%#$@^~_" + "0123456789ABCDEFx";
const CELL = 20;
const RADIUS = 118;
const MAX_DROPS = 70;

type Drop = { col: number; y: number; speed: number; life: number; tone: number };

function pick() { return GLYPHS[(Math.random() * GLYPHS.length) | 0]; }

function isLight(x: number, y: number) {
  let node = document.elementFromPoint(x, y) as Element | null;
  while (node && node !== document.documentElement) {
    const color = getComputedStyle(node).backgroundColor;
    const parts = color.match(/[\d.]+/g);
    if (parts && (parts.length < 4 || Number(parts[3]) > 0.5)) {
      const [r, g, b] = parts.map(Number);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b > 140;
    }
    node = node.parentElement;
  }
  return false;
}

export default function MatrixField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = context;
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

    const family = getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim() || "monospace";
    let cols = 0, rows = 0, dpr = 1;
    let energy = new Float32Array(0);
    let tone = new Uint8Array(0); // 0 dark surface, 1 light surface
    let chars: string[] = [];
    const drops: Drop[] = [];
    let frame = 0;
    let px = -1, py = -1, light = 0, lastProbe = 0;

    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      canvas!.width = innerWidth * dpr;
      canvas!.height = innerHeight * dpr;
      cols = Math.ceil(innerWidth / CELL);
      rows = Math.ceil(innerHeight / CELL);
      energy = new Float32Array(cols * rows);
      tone = new Uint8Array(cols * rows);
      chars = Array.from({ length: cols * rows }, pick);
      drops.length = 0;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `500 ${CELL * 0.72}px ${family}, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    }

    function excite(x: number, y: number, radius: number, strength: number) {
      const c0 = Math.max(0, Math.floor((x - radius) / CELL));
      const c1 = Math.min(cols - 1, Math.floor((x + radius) / CELL));
      const r0 = Math.max(0, Math.floor((y - radius) / CELL));
      const r1 = Math.min(rows - 1, Math.floor((y + radius) / CELL));
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const dx = c * CELL + CELL / 2 - x, dy = r * CELL + CELL / 2 - y;
          const d = Math.sqrt(dx * dx + dy * dy) / radius;
          if (d >= 1) continue;
          // Dithered edge: the field breaks up toward the rim instead of fading smoothly.
          const v = (1 - d) * (1 - d) * strength * (0.55 + Math.random() * 0.45);
          const i = r * cols + c;
          if (v > energy[i]) { energy[i] = v; tone[i] = light; }
        }
      }
    }

    function spawn(x: number, y: number, count: number) {
      for (let n = 0; n < count && drops.length < MAX_DROPS; n++) {
        drops.push({
          col: Math.max(0, Math.min(cols - 1, Math.floor((x + (Math.random() - 0.5) * RADIUS * 1.4) / CELL))),
          y: Math.floor((y + (Math.random() - 0.5) * RADIUS) / CELL),
          speed: 0.35 + Math.random() * 0.55,
          life: 10 + Math.random() * 26,
          tone: light,
        });
      }
    }

    function draw() {
      frame = 0;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      let alive = false;

      for (let k = drops.length - 1; k >= 0; k--) {
        const drop = drops[k];
        drop.y += drop.speed;
        drop.life -= drop.speed;
        const r = Math.floor(drop.y);
        if (drop.life <= 0 || r >= rows) { drops.splice(k, 1); continue; }
        if (r >= 0) {
          const i = r * cols + drop.col;
          energy[i] = 1.15; tone[i] = drop.tone; chars[i] = pick();
        }
        alive = true;
      }

      for (let i = 0; i < energy.length; i++) {
        const e = energy[i];
        if (e < 0.03) { energy[i] = 0; continue; }
        alive = true;
        if (Math.random() < e * 0.16) chars[i] = pick();
        const c = i % cols, r = (i / cols) | 0;
        if (tone[i]) ctx.fillStyle = e > 1 ? `rgba(8,12,6,${Math.min(e, 1)})` : `rgba(38,74,6,${e * 0.85})`;
        else ctx.fillStyle = e > 1 ? `rgba(240,255,220,${Math.min(e, 1)})` : `rgba(200,255,112,${e * 0.9})`;
        ctx.fillText(chars[i], c * CELL + CELL / 2, r * CELL + CELL / 2);
        energy[i] = e * 0.93;
      }

      if (alive) frame = requestAnimationFrame(draw);
    }
    function wake() { if (!frame) frame = requestAnimationFrame(draw); }

    function probe(x: number, y: number) {
      const now = performance.now();
      if (now - lastProbe < 120) return;
      lastProbe = now;
      light = isLight(x, y) ? 1 : 0;
    }

    function move(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      const x = event.clientX, y = event.clientY;
      probe(x, y);
      if (px < 0) { px = x; py = y; }
      const dist = Math.hypot(x - px, y - py);
      // Fill in the path so a fast flick leaves a continuous wake.
      const steps = Math.max(1, Math.ceil(dist / (RADIUS * 0.4)));
      for (let s = 1; s <= steps; s++) {
        excite(px + ((x - px) * s) / steps, py + ((y - py) * s) / steps, RADIUS, 0.9);
      }
      if (dist > 14 && Math.random() < Math.min(0.85, dist / 70)) spawn(x, y, 1);
      px = x; py = y;
      wake();
    }
    function press(event: PointerEvent) {
      const x = event.clientX, y = event.clientY;
      lastProbe = 0;
      probe(x, y);
      excite(x, y, RADIUS * 2, 1.05);
      spawn(x, y, event.pointerType === "touch" ? 10 : 16);
      wake();
    }
    function leave() { px = -1; py = -1; }

    resize();
    addEventListener("resize", resize);
    if (fine) addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", press, { passive: true });
    document.addEventListener("pointerleave", leave);

    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", move);
      removeEventListener("pointerdown", press);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <canvas ref={canvasRef} className="matrix-field" aria-hidden="true" />;
}
