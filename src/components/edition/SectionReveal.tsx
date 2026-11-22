"use client";

import { useEffect } from "react";
import "./SectionReveal.css";

const visibleFraction = 0.14;

export default function SectionReveal({ scene }: { scene: React.RefObject<HTMLDivElement | null> }) {
  useEffect(() => {
    const content = scene.current;
    if (!content || !("IntersectionObserver" in window)) return;

    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    if (!motion.matches) return;

    const targets = Array.from(content.querySelectorAll<HTMLElement>("[data-section-reveal]"));
    const observer = new IntersectionObserver((entries) => {
      for (const { target, intersectionRatio } of entries) {
        if (intersectionRatio < visibleFraction) continue;
        observer.unobserve(target);
        if (!motion.matches) {
          target.removeAttribute("data-reveal-state");
        } else if (target.hasAttribute("data-reveal-state")) {
          target.setAttribute("data-reveal-state", "playing");
        }
      }
    }, { threshold: visibleFraction });

    function finish(event: AnimationEvent) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if ((event.animationName === "section-type-in" && target.tagName === "EM") ||
        event.animationName === "section-media-in") {
        target.parentElement?.removeAttribute("data-reveal-state");
      }
      if (event.animationName === "section-copy-in" || event.animationName === "section-scan-in") {
        target.removeAttribute("data-reveal-state");
      }
    }

    content.addEventListener("animationend", finish);
    content.addEventListener("animationcancel", finish);
    for (const target of targets) {
      if (target.getBoundingClientRect().top < window.innerHeight) continue;
      target.setAttribute("data-reveal-state", "pending");
      observer.observe(target);
    }

    return () => {
      observer.disconnect();
      content.removeEventListener("animationend", finish);
      content.removeEventListener("animationcancel", finish);
      for (const target of targets) target.removeAttribute("data-reveal-state");
    };
  }, [scene]);

  return null;
}
