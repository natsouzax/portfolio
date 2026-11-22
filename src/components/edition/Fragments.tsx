"use client";

import { useEffect, useRef } from "react";
import styles from "./Fragments.module.css";
import { drawShard, makeCopyShards, makeTitleShards, type Shard } from "./fragment-art";

const FORWARD_DURATION = 1550;
const RETURN_DURATION = 1100;
const bound = (progress: number) => Math.min(1, Math.max(0, progress));
const smooth = (progress: number) => progress * progress * (3 - 2 * progress);
type Destination = 0 | 1;

export default function Fragments() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const layer = canvas.current;
    const context = layer?.getContext("2d", { alpha: true });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 700px)");
    const opening = document.querySelector<HTMLElement>("#top");
    const figure = opening?.querySelector<HTMLElement>('[role="slider"]');
    const title = document.querySelector<HTMLElement>("#about-title");
    const about = title?.closest("section");
    if (!layer || !context || !opening || !figure || !title || !about) return;

    const sample = document.createElement("canvas");
    const lead = about.querySelector<HTMLElement>("[data-assembly-copy]");
    const targets = Array.from(title.querySelectorAll<HTMLElement>(":scope > span, :scope > em"));
    if (lead) targets.push(lead);
    const lines = targets.map(node => ({ node, shards: [] as Shard[], revealed: -1 }));
    let frame = 0;
    let scale = 1;
    let needsSampling = true;
    let painted = false;
    let progress = 0;
    let transition: {
      startedAt: number;
      duration: number;
      from: number;
      to: Destination;
      fromY: number;
      toY: number;
    } | null = null;
    let touch: { x: number; y: number; captured: boolean } | null = null;
    let previousY = window.scrollY;
    let followingAnchor = false;

    function queue() {
      if (!frame && transition) frame = requestAnimationFrame(paint);
    }

    function invalidate() {
      needsSampling = true;
      queue();
    }

    function resize() {
      if (!transition) return;
      scale = Math.min(window.devicePixelRatio || 1, narrow.matches ? 1.25 : 2);
      layer!.width = Math.round(window.innerWidth * scale);
      layer!.height = Math.round(window.innerHeight * scale);
      transition.toY = position(transition.to);
      invalidate();
    }

    function clear() {
      if (painted) {
        context!.resetTransform();
        context!.clearRect(0, 0, layer!.width, layer!.height);
      }
      title!.removeAttribute("data-assembling");
      for (const line of lines) {
        if (line.revealed < 0) continue;
        line.node.style.removeProperty("clip-path");
        line.revealed = -1;
      }
      painted = false;
    }

    function position(destination: Destination) {
      if (destination === 0) return Math.max(0, opening!.getBoundingClientRect().top + window.scrollY);
      const heading = title!.getBoundingClientRect();
      const inset = Math.max(0, Math.min(window.innerHeight * .14, (window.innerHeight - heading.height) / 2));
      return Math.max(0, heading.top + window.scrollY - inset);
    }

    function setBurst() {
      const burst = smooth(bound((progress - .06) / .59));
      opening!.style.setProperty("--burst", burst.toFixed(3));
    }

    function settle(destination: Destination, pulse = false) {
      cancelAnimationFrame(frame);
      frame = 0;
      transition = null;
      progress = destination;
      setBurst();
      clear();
      if (pulse) title!.setAttribute("data-assembly-pulse", "");
      else title!.removeAttribute("data-assembly-pulse");
    }

    function play(to: Destination) {
      if (transition?.to === to) return;
      const wasPlaying = transition !== null;
      title!.removeAttribute("data-assembly-pulse");
      transition = {
        startedAt: performance.now(),
        duration: Math.max(180, (to ? FORWARD_DURATION : RETURN_DURATION) * Math.abs(to - progress)),
        from: progress, to, fromY: window.scrollY, toY: position(to),
      };
      if (wasPlaying) queue();
      else resize();
    }

    function trigger(to: Destination) {
      if (reduced.matches || document.querySelector("[data-curtain]")) return false;
      if (transition) {
        play(to);
        return true;
      }
      const y = window.scrollY;
      const fromOpening = y - position(0);
      if (fromOpening <= 2 && progress === 1) settle(0);
      if (progress === to) return false;
      const nearOpening = fromOpening < window.innerHeight * .8;
      const nearAbout = y - position(1) < window.innerHeight * .12;
      if (to ? !nearOpening : !nearAbout) return false;
      play(to);
      return true;
    }

    function wheel(event: WheelEvent) {
      if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      followingAnchor = false;
      if (event.cancelable && trigger(event.deltaY > 0 ? 1 : 0)) event.preventDefault();
    }

    function touchStart(event: TouchEvent) {
      const point = event.touches.length === 1 ? event.touches[0] : null;
      touch = point ? { x: point.clientX, y: point.clientY, captured: false } : null;
      followingAnchor = false;
    }

    function touchMove(event: TouchEvent) {
      const point = event.touches[0];
      if (reduced.matches || !touch || !point || event.touches.length !== 1 || !event.cancelable) return;
      const dy = touch.y - point.clientY;
      if (Math.abs(dy) >= 6 && Math.abs(dy) > Math.abs(touch.x - point.clientX)) {
        touch.captured = trigger(dy > 0 ? 1 : 0) || touch.captured;
        if (touch.captured) {
          touch.x = point.clientX;
          touch.y = point.clientY;
        }
      }
      if (touch.captured) event.preventDefault();
    }

    function key(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if ((event.target as HTMLElement | null)?.closest?.("a, button, input, select, textarea, [role=slider], [contenteditable]")) return;
      const down = event.key === "ArrowDown" || event.key === "PageDown" || (event.key === " " && !event.shiftKey);
      const up = event.key === "ArrowUp" || event.key === "PageUp" || (event.key === " " && event.shiftKey);
      if (!down && !up) return;
      followingAnchor = false;
      if (trigger(down ? 1 : 0)) event.preventDefault();
    }

    function anchorClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href^='#']");
      if (!link?.hash || event.defaultPrevented) return;
      followingAnchor = true;
      if (transition) settle(progress < .5 ? 0 : 1);
    }

    function anchorSettled() {
      followingAnchor = false;
    }

    function syncNativeScroll() {
      const y = window.scrollY;
      const delta = y - previousY;
      previousY = y;
      if (transition || reduced.matches || document.querySelector("[data-curtain]")) return;
      const aboutTop = about!.getBoundingClientRect().top;
      // Scrollbar gestures and non-cancelable events can move the page before
      // the transition sees them. Long jumps still land normally.
      if (!followingAnchor && Math.abs(delta) <= window.innerHeight * .75) {
        if (delta > 1 && trigger(1)) return;
        if (delta < -1 && trigger(0)) return;
      }
      if (progress === 0 && aboutTop <= 4) settle(1);
      else if (progress === 1 && aboutTop >= window.innerHeight) settle(0);
    }

    function motionChanged() {
      if (reduced.matches) settle(0);
    }

    function endPulse(event: AnimationEvent) {
      if (event.target === title) title!.removeAttribute("data-assembly-pulse");
    }

    function paint(now: number) {
      frame = 0;
      if (!transition) return;
      const { startedAt, duration, from, to, fromY, toY } = transition;
      const elapsed = bound((now - startedAt) / duration);
      progress = from + (to - from) * elapsed;
      window.scrollTo({ top: fromY + (toY - fromY) * smooth(elapsed), behavior: "instant" });
      setBurst();
      if (elapsed === 1) {
        settle(to, to === 1 && painted);
        return;
      }

      if (needsSampling) {
        for (const line of lines) {
          line.shards = line.node === lead
            ? makeCopyShards(line.node, narrow.matches ? 3 : 4)
            : makeTitleShards(line.node, sample, narrow.matches ? 80 : 180);
          line.revealed = -1;
          line.node.style.removeProperty("clip-path");
        }
        needsSampling = false;
      }
      if (lines.some(line => line.node !== lead && !line.shards.length)) {
        clear();
        queue();
        return;
      }

      const marks = lines.map(line => line.node.getBoundingClientRect());
      const origin = figure!.getBoundingClientRect();
      const originY = Math.max(origin.top, -origin.height * .78);
      if (!title!.hasAttribute("data-assembling")) title!.setAttribute("data-assembling", "");
      context!.setTransform(scale, 0, 0, scale, 0, 0);
      context!.clearRect(0, 0, window.innerWidth, window.innerHeight);
      context!.globalCompositeOperation = "lighter";

      for (const [index, line] of lines.entries()) {
        const mark = marks[index];
        let revealed = 0;
        for (const shard of line.shards) {
          if (progress >= shard.land) {
            revealed++;
            continue;
          }
          if (progress <= shard.start) continue;
          const t = (progress - shard.start) / (shard.land - shard.start);
          const fromX = origin.left + shard.fromX * origin.width;
          const fromY = originY + shard.fromY * origin.height;
          const toX = mark.left + shard.x;
          const toY = mark.top + shard.y;
          drawShard(context!, shard, fromX, fromY, toX, toY, t);
        }

        if (revealed === line.revealed) continue;
        line.revealed = revealed;
        if (revealed === line.shards.length) {
          line.node.style.removeProperty("clip-path");
        } else {
          const path = line.shards.slice(0, revealed).map(shard => shard.path).join("");
          line.node.style.clipPath = path ? `path("${path}")` : "inset(50%)";
        }
      }
      context!.globalCompositeOperation = "source-over";
      painted = true;
      queue();
    }

    const layout = new ResizeObserver(invalidate);
    for (const { node } of lines) layout.observe(node);
    const copy = new MutationObserver(invalidate);
    copy.observe(title, { childList: true, characterData: true, subtree: true });
    if (lead) copy.observe(lead, { childList: true, characterData: true, subtree: true });
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("touchstart", touchStart, { passive: true });
    window.addEventListener("touchmove", touchMove, { passive: false });
    window.addEventListener("keydown", key);
    window.addEventListener("click", anchorClick);
    window.addEventListener("scroll", syncNativeScroll, { passive: true });
    window.addEventListener("scrollend", anchorSettled);
    window.addEventListener("resize", resize);
    title.addEventListener("animationend", endPulse);
    title.addEventListener("animationcancel", endPulse);
    reduced.addEventListener("change", motionChanged);
    document.fonts.addEventListener("loadingdone", invalidate);
    return () => {
      cancelAnimationFrame(frame);
      layout.disconnect();
      copy.disconnect();
      clear();
      opening.style.removeProperty("--burst");
      title.removeEventListener("animationend", endPulse);
      title.removeEventListener("animationcancel", endPulse);
      title.removeAttribute("data-assembly-pulse");
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("keydown", key);
      window.removeEventListener("click", anchorClick);
      window.removeEventListener("scroll", syncNativeScroll);
      window.removeEventListener("scrollend", anchorSettled);
      window.removeEventListener("resize", resize);
      reduced.removeEventListener("change", motionChanged);
      document.fonts.removeEventListener("loadingdone", invalidate);
    };
  }, []);

  return <canvas ref={canvas} aria-hidden="true" className={styles.shards} />;
}
