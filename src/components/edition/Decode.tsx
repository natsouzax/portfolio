"use client";

import { useEffect } from "react";

/**
 * Anything that reacts to the pointer decodes when it is reached: its label
 * dissolves into code and resolves back, left to right. Only short leaf text
 * nodes are touched, and the original string is always written back, so the
 * markup React owns ends exactly as it began.
 */
const CODE = "0101010101<>/{}[]()=+-*%#$&|!?;∑∫√π∞λ";
const TARGETS = 'a, button, summary, [data-scramble]';
const DURATION = 520;

export default function Decode() {
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const running = new WeakSet<Element>();
    const originals = new Map<Text, string>();
    const frames = new Set<number>();

    function textNodes(root: Element) {
      const found: Text[] = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node as Text;
        const value = originals.get(text) ?? text.nodeValue ?? "";
        if (value.trim() && value.length <= 48) found.push(text);
      }
      return found;
    }

    function decode(element: Element) {
      if (running.has(element)) return;
      const nodes = textNodes(element);
      if (!nodes.length) return;
      running.add(element);
      for (const node of nodes) if (!originals.has(node)) originals.set(node, node.nodeValue ?? "");
      const start = performance.now();

      const tick = (now: number) => {
        frames.delete(id);
        const t = Math.min(1, (now - start) / DURATION);
        for (const node of nodes) {
          const source = originals.get(node) ?? "";
          const settled = Math.floor(t * source.length * 1.15);
          let out = "";
          for (let i = 0; i < source.length; i++) {
            const ch = source[i];
            out += i < settled || ch === " " ? ch : CODE[(Math.random() * CODE.length) | 0];
          }
          node.nodeValue = out;
        }
        if (t < 1) { id = requestAnimationFrame(tick); frames.add(id); return; }
        for (const node of nodes) { node.nodeValue = originals.get(node) ?? node.nodeValue; originals.delete(node); }
        running.delete(element);
      };
      let id = requestAnimationFrame(tick);
      frames.add(id);
    }

    function over(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      const target = (event.target as Element | null)?.closest?.(TARGETS);
      if (!target || target.closest("[data-no-decode]")) return;
      const related = event.relatedTarget as Node | null;
      if (related && target.contains(related)) return;
      decode(target);
    }

    document.addEventListener("pointerover", over, { passive: true });
    return () => {
      document.removeEventListener("pointerover", over);
      frames.forEach(cancelAnimationFrame);
      originals.forEach((value, node) => { node.nodeValue = value; });
    };
  }, []);

  return null;
}
