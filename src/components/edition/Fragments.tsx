"use client";

import { useEffect, useRef } from "react";
import styles from "./Fragments.module.css";
import { mountBodyFragments } from "./BodyFragments";
import { drawShard, makeCopyShards, makeTitleShards, type Shard } from "./fragment-art";

const FORWARD_DURATION = 1550;
const RETURN_DURATION = 1100;
const BODY_FORWARD_DURATION = 2600;
const BODY_RETURN_DURATION = 1850;
const bound = (progress: number) => Math.min(1, Math.max(0, progress));
const smooth = (progress: number) => progress * progress * (3 - 2 * progress);
type Destination = 0 | 1 | 2;

export default function Fragments() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // A full page load should begin at the opening, rather than restoring an
    // old scroll position that can leave the scroll-driven scene mid-transition.
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    if (window.location.hash !== "#top") {
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search + "#top");
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

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
    const bodyStage = about.querySelector<HTMLElement>("[data-body-stage]");
    const body = bodyStage && mountBodyFragments(bodyStage, title, lead);
    const targets = Array.from(title.querySelectorAll<HTMLElement>(":scope > span, :scope > em"));
    if (lead) targets.push(lead);
    const lines = targets.map(node => ({ node, shards: [] as Shard[], revealed: -1 }));
    let frame = 0;
    let scale = 1;
    let needsSampling = true;
    let painted = false;
    let progress = 0;
    let destination: Destination = 0;
    let transition: {
      startedAt: number;
      duration: number;
      from: number;
      to: Destination;
      segment: 0 | 1;
      fromY: number;
      toY: number;
    } | null = null;
    let touch: { x: number; y: number; captured: boolean } | null = null;
    let previousY = 0;
    let followingAnchor = false;
    let previousWheelAt = 0;
    let previousWheelDirection = 0;
    let finishedDirection = 0;

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

    function position(destination: Destination): number {
      if (destination === 0) return Math.max(0, opening!.getBoundingClientRect().top + window.scrollY);
      if (destination === 2 && bodyStage) {
        const stage = bodyStage.getBoundingClientRect();
        const inset = Math.max(68, (window.innerHeight - stage.height) / 2);
        return Math.max(position(1), stage.top + window.scrollY - inset);
      }
      const heading = title!.getBoundingClientRect();
      const inset = Math.max(0, Math.min(window.innerHeight * .14, (window.innerHeight - heading.height) / 2));
      return Math.max(0, heading.top + window.scrollY - inset);
    }

    function setBurst() {
      const burst = smooth(bound((progress - .06) / .59));
      opening!.style.setProperty("--burst", burst.toFixed(3));
    }

    function settle(next: Destination, pulse = false) {
      cancelAnimationFrame(frame);
      frame = 0;
      transition = null;
      progress = destination = next;
      setBurst();
      clear();
      if (reduced.matches) body?.showAll();
      else body?.render(next === 2 ? 1 : 0);
      if (pulse) title!.setAttribute("data-assembly-pulse", "");
      else title!.removeAttribute("data-assembly-pulse");
    }

    function play(to: Destination) {
      if (transition?.to === to) return;
      const wasPlaying = transition !== null;
      const segment = transition?.segment ?? (Math.min(progress, to) >= 1 ? 1 : 0);
      const forward = to > progress;
      const duration = segment
        ? (forward ? BODY_FORWARD_DURATION : BODY_RETURN_DURATION)
        : (forward ? FORWARD_DURATION : RETURN_DURATION);
      title!.removeAttribute("data-assembly-pulse");
      transition = {
        startedAt: performance.now(),
        duration: Math.max(180, duration * Math.abs(to - progress)),
        from: progress, to, segment, fromY: window.scrollY, toY: position(to),
      };
      if (wasPlaying) queue();
      else resize();
    }

    function trigger(direction: 1 | -1) {
      if (reduced.matches || document.querySelector("[data-curtain]")) return false;
      if (transition) {
        play((transition.segment + (direction > 0 ? 1 : 0)) as Destination);
        return true;
      }
      const y = window.scrollY;
      const fromOpening = y - position(0);
      const height = window.innerHeight;
      if (fromOpening <= 2 && destination !== 0) settle(0);
      if (destination === 0 && direction > 0 && fromOpening < height * .8) {
        play(1);
        return true;
      }
      if (destination === 1 && direction < 0 && y <= position(1) + height * .12) {
        play(0);
        return true;
      }
      if (body?.isReady() && y <= position(2) + height * .15 && y >= position(1) - height * .15) {
        if (destination === 1 && direction > 0) {
          play(2);
          return true;
        }
        if (destination === 2 && direction < 0) {
          play(1);
          return true;
        }
      }
      return false;
    }

    function wheel(event: WheelEvent) {
      if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      followingAnchor = false;
      const direction = event.deltaY > 0 ? 1 : -1;
      const now = performance.now();
      const trailing = !transition && destination === 1 && direction === finishedDirection &&
        direction === previousWheelDirection && now - previousWheelAt < 140;
      previousWheelAt = now;
      previousWheelDirection = direction;
      if (event.cancelable && (trailing || trigger(direction))) event.preventDefault();
      if (!trailing && !transition) finishedDirection = 0;
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
        // A swipe that started a leg can reverse it, then releases on the next swipe.
        if (transition || !touch.captured) touch.captured = trigger(dy > 0 ? 1 : -1) || touch.captured;
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
      if (trigger(down ? 1 : -1)) event.preventDefault();
    }

    function anchorClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href^='#']");
      if (!link?.hash || event.defaultPrevented) return;
      followingAnchor = true;
      if (transition) settle(Math.round(progress) as Destination);
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
        if (delta < -1 && trigger(-1)) return;
      }
      if (body && y >= position(2) && destination !== 2) settle(2);
      else if (aboutTop >= window.innerHeight && destination !== 0) settle(0);
      else if (y + window.innerHeight * .14 < position(2) && destination === 2) settle(1);
      else if (aboutTop <= 4 && destination === 0) settle(1);
    }

    function motionChanged() {
      if (reduced.matches) settle(0);
      else syncNativeScroll();
    }

    function endPulse(event: AnimationEvent) {
      if (event.target === title) title!.removeAttribute("data-assembly-pulse");
    }

    function paint(now: number) {
      frame = 0;
      if (!transition) return;
      const { startedAt, duration, from, to, segment, fromY, toY } = transition;
      const elapsed = bound((now - startedAt) / duration);
      progress = from + (to - from) * elapsed;
      const travel = segment && to === 2 ? bound(elapsed / .72) : elapsed;
      const y = fromY + (toY - fromY) * smooth(travel);
      if (Math.abs(window.scrollY - y) > .5) window.scrollTo({ top: y, behavior: "instant" });
      setBurst();
      if (elapsed === 1) {
        finishedDirection = Math.sign(to - from);
        settle(to, segment === 0 && to === 1 && painted);
        return;
      }
      if (segment === 1) {
        body?.render(progress - 1);
        queue();
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
    if (!reduced.matches) {
      settle(0);
    }
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
      body?.dispose();
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
