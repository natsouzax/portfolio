"use client";

import { useEffect, useRef } from "react";
import styles from "./Edition.module.css";

/**
 * The lime band behind the name, drawn as a grid of blocks so it can come
 * apart. When the pointer reaches it the band decodes from that point outward:
 * each block flashes into a symbol and drains away column by column, leaving
 * the name standing in white. When the pointer leaves, it compiles back.
 *
 * Until this mounts, the stylesheet paints a plain band, so the first frame
 * and the no-script page look the same.
 */
const GLYPHS = "01010101+-×÷=≠<>≤≥∑∫√∞πλΔ{}[]()/\\|&!?;*%#$";
const CELL = 11;
const DURATION = 420;
const VOLT = "#c8ff70";
const INK = "#080908";

function pick() { return GLYPHS[(Math.random() * GLYPHS.length) | 0]; }

export default function NameBand() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const title = canvas?.parentElement;
    if (!canvas || !context || !title) return;
    const ctx = context;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const family = getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim() || "monospace";

    let width = 0, height = 0, cols = 0, rows = 0;
    let value = new Float32Array(0);   // 1 solid block, 0 gone
    let startAt = new Float64Array(0);
    let jitter = new Float32Array(0);
    let chars: string[] = [];
    let target = 1;
    let inside = false;
    let frame = 0, last = 0;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      width = rect.width; height = rect.height;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      cols = Math.ceil(width / CELL);
      rows = Math.ceil(height / CELL);
      value = new Float32Array(cols * rows).fill(target);
      startAt = new Float64Array(cols * rows);
      jitter = Float32Array.from({ length: cols * rows }, () => Math.random());
      chars = Array.from({ length: cols * rows }, pick);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `600 ${CELL * 0.95}px ${family}, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      paint();
    }

    function trigger(next: number, x: number, y: number) {
      if (next === target) return;
      target = next;
      title!.dataset.band = next ? "solid" : "gone";
      const now = performance.now();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const dx = Math.abs(c * CELL - x), dy = Math.abs(r * CELL - y);
          // Spreads sideways from the pointer; each column drains top-down when
          // leaving and builds bottom-up when returning, like falling code.
          const fall = next ? (rows - r) * 16 : r * 16;
          startAt[i] = reduced ? now : now + dx * 0.55 + dy * 0.4 + fall + jitter[i] * 160;
        }
      }
      wake();
    }

    function paint(now = performance.now()) {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < value.length; i++) {
        const v = value[i];
        if (v <= 0.001) continue;
        const x = (i % cols) * CELL, y = ((i / cols) | 0) * CELL;
        const block = Math.min(1, Math.max(0, (v - 0.4) / 0.6));
        if (block > 0) {
          ctx.globalAlpha = block;
          ctx.fillStyle = VOLT;
          ctx.fillRect(x, y, CELL + 0.5, CELL + 0.5);
        }
        // Mid-transition every block shows as a symbol.
        const glyph = Math.sin(Math.PI * Math.min(1, v));
        if (glyph > 0.05 && v < 0.999) {
          if (Math.random() < 0.3) chars[i] = pick();
          ctx.globalAlpha = Math.min(1, glyph * 1.3);
          ctx.fillStyle = block > 0.55 ? INK : (now - startAt[i] < 90 ? "#f2ffe0" : VOLT);
          ctx.fillText(chars[i], x + CELL / 2, y + CELL / 2 + 0.5);
        }
      }
      ctx.globalAlpha = 1;
    }

    function step(now: number) {
      frame = 0;
      const dt = Math.min(64, now - (last || now));
      last = now;
      const rate = reduced ? 1 : dt / DURATION;
      let moving = false;
      for (let i = 0; i < value.length; i++) {
        const v = value[i];
        if (v === target) continue;
        moving = true;
        if (now < startAt[i]) continue;
        value[i] = target ? Math.min(1, v + rate) : Math.max(0, v - rate);
      }
      paint(now);
      if (moving) frame = requestAnimationFrame(step);
      else last = 0;
    }
    function wake() { if (!frame) frame = requestAnimationFrame(step); }

    function local(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        hit: event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom,
      };
    }
    function move(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      const { x, y, hit } = local(event);
      if (hit === inside) return;
      inside = hit;
      trigger(hit ? 0 : 1, Math.max(0, Math.min(width, x)), Math.max(0, Math.min(height, y)));
    }
    function tap(event: PointerEvent) {
      if (event.pointerType !== "touch") return;
      const { x, y, hit } = local(event);
      if (hit) trigger(target ? 0 : 1, x, y);
    }
    function leave() {
      if (!inside) return;
      inside = false;
      trigger(1, width / 2, height / 2);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    title.dataset.band = "ready";
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", tap, { passive: true });
    document.addEventListener("pointerleave", leave);

    // The opening plays the effect once on its own: as soon as the curtain is
    // gone the band decodes from the centre, holds, and compiles back. Anyone
    // already pointing at it takes over and the sequence stands down.
    const timers: number[] = [];
    function intro() {
      if (reduced) return;
      if (document.querySelector("[data-curtain]")) { timers.push(window.setTimeout(intro, 120)); return; }
      timers.push(window.setTimeout(() => {
        if (inside) return;
        trigger(0, width / 2, height / 2);
        timers.push(window.setTimeout(() => { if (!inside) trigger(1, width / 2, height / 2); }, 2100));
      }, 420));
    }
    intro();

    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(frame);
      observer.disconnect();
      removeEventListener("pointermove", move);
      removeEventListener("pointerdown", tap);
      document.removeEventListener("pointerleave", leave);
      delete title.dataset.band;
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.band} aria-hidden="true" />;
}
