"use client";

import { useEffect } from "react";

/**
 * The cursor as part of the instrument: a ring that trails the pointer, opens
 * over anything that reacts, and leaves a ripple where it presses. Drawn
 * straight into the DOM rather than through state, so it never costs a render.
 *
 * Nothing here replaces the native cursor, so the page stays usable if the
 * ring is ever hidden, and it is hidden outright on touch and for reduced
 * motion by the stylesheet.
 */
export default function Pointer() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    const ring = document.createElement("div");
    ring.className = "pointer-ring";
    ring.style.opacity = "0";
    ring.setAttribute("aria-hidden", "true");
    // The lens sits exactly under the pointer; the ring trails it.
    const lens = document.createElement("div");
    lens.className = "pointer-lens";
    lens.setAttribute("aria-hidden", "true");
    document.body.append(lens, ring);

    let x = innerWidth / 2, y = innerHeight / 2;
    let ringX = x, ringY = y, frame = 0;

    function paint() {
      frame = 0;
      // The ring lags the pointer slightly, which is what makes it feel weighted.
      ringX += (x - ringX) * 0.19;
      ringY += (y - ringY) * 0.19;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      lens.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (Math.abs(x - ringX) > 0.1 || Math.abs(y - ringY) > 0.1) queue();
    }
    function queue() { if (!frame) frame = requestAnimationFrame(paint); }

    function move(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      x = event.clientX;
      y = event.clientY;
      ring.style.opacity = "1";
      lens.style.opacity = "1";
      const target = event.target as Element | null;
      const over = target?.closest?.('a, button, summary, [role="slider"], input, select, textarea');
      if (!over) delete ring.dataset.over;
      else ring.dataset.over = over.getAttribute("role") === "slider" ? "drag" : "link";
      queue();
    }
    function down(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      ring.dataset.press = "";
      lens.dataset.press = "";
      const ripple = document.createElement("div");
      ripple.className = "pointer-ripple";
      ripple.setAttribute("aria-hidden", "true");
      ripple.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
      document.body.append(ripple);
    }
    function up() { delete ring.dataset.press; delete lens.dataset.press; }
    function leave() { ring.style.opacity = "0"; lens.style.opacity = "0"; }

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    window.addEventListener("pointercancel", up, { passive: true });
    document.addEventListener("pointerleave", leave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      document.removeEventListener("pointerleave", leave);
      ring.remove();
      lens.remove();
      document.querySelectorAll(".pointer-ripple").forEach(node => node.remove());
    };
  }, []);

  return null;
}
