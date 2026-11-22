"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { mountBodyProjection } from "./body-projection";
import { drawShard, makeCopyShards, makeTitleShards, sampleTiles } from "./fragment-art";
import fragments from "./Fragments.module.css";
import styles from "./BodyFragments.module.css";

const bound = (value: number) => Math.min(1, Math.max(0, value));
const empty = "inset(50%)";
const ASSEMBLY_DURATION = 2600;

export default function BodyFragments({ left, right, portrait }: {
  left: string;
  right: string;
  portrait: string;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const projectionCanvas = useRef<HTMLCanvasElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const scene = stage.current;
    const body = image.current;
    const output = surface.current;
    const display = projectionCanvas.current;
    const layer = canvas.current;
    const context = layer?.getContext("2d");
    const section = scene?.closest("section");
    const title = section?.querySelector<HTMLHeadingElement>("h2");
    const copy = scene ? Array.from(scene.querySelectorAll<HTMLElement>(":scope > p")) : [];
    const lines = title ? Array.from(title.querySelectorAll<HTMLElement>(":scope > span, :scope > em")) : [];
    if (!scene || !section || !title || !lines.length || copy.length !== 2 || !body || !output || !display || !layer || !context) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sample = document.createElement("canvas");
    const ink = sample.getContext("2d", { willReadFrequently: true });
    if (!ink) return;
    const projection = mountBodyProjection(output, body, display);

    const destinations = [output, ...copy];
    const measure = () => {
      const narrow = window.innerWidth <= 700;
      const origins = lines.flatMap((node, line) => makeTitleShards(node, sample, narrow ? 80 : 180, true)
        .map(shard => ({ ...shard, line, leaves: shard.start * .93 })));
      if (!origins.length || !body.naturalWidth || !body.offsetWidth || !body.offsetHeight) return null;

      sample.width = body.offsetWidth;
      sample.height = body.offsetHeight;
      ink.drawImage(body, 0, 0, sample.width, sample.height);
      const bodyTiles = sampleTiles(ink, sample.width, sample.height, sample.width * sample.height, narrow ? 195 : 350);
      const targets = [bodyTiles, ...copy.map(node => makeCopyShards(node, narrow ? 4 : 5))];
      if (targets.some(tiles => !tiles.length)) return null;

      // The title's pieces branch out to the body and both paragraphs.
      const routes = targets.map((tiles, destination) => tiles.map((tile, index) => {
        const shard = origins[Math.floor((((index + destination * 13) * .6180339887) % 1) * origins.length)];
        return {
          tile,
          shard,
          lands: .48 + shard.leaves * .98 + ((index * .3819660113) % 1) * .15,
        };
      }));
      return { origins, routes };
    };

    let frame = 0;
    let size = 1;
    let geometry: ReturnType<typeof measure> = null;
    let needsMeasure = true;
    let startedAt: number | null = null;
    let finished = false;
    let framing: { from: number; to: number } | null = null;

    const reveal = () => {
      context.resetTransform();
      context.clearRect(0, 0, layer.width, layer.height);
      title.removeAttribute("data-body-disassembling");
      for (const line of lines) line.style.removeProperty("--body-title-clip");
      for (const target of destinations) target.style.removeProperty("clip-path");
      projection.setArrival(1);
    };

    const settle = () => {
      finished = true;
      framing = null;
      scene.dataset.bodyAssembly = "complete";
      reveal();
    };

    const queue = () => {
      if (!frame && !finished) frame = requestAnimationFrame(paint);
    };

    const paint = (now: number) => {
      frame = 0;
      if (reduced.matches) {
        if (startedAt !== null) settle();
        else {
          delete scene.dataset.bodyAssembly;
          reveal();
        }
        return;
      }

      const height = window.innerHeight;
      if (startedAt === null) {
        if (scene.dataset.bodyAssembly !== "pending") {
          scene.dataset.bodyAssembly = "pending";
          for (const target of destinations) target.style.clipPath = empty;
        }
        const stageBounds = scene.getBoundingClientRect();
        const sectionTop = section.getBoundingClientRect().top;
        if (stageBounds.bottom <= 0) {
          settle();
          return;
        }
        if (stageBounds.top > height * .78 || sectionTop > -height * .12 ||
            title.hasAttribute("data-assembling") || title.hasAttribute("data-assembly-pulse") ||
            document.querySelector("[data-curtain]")) return;
        if (!body.complete) return;
        startedAt = now;
        scene.dataset.bodyAssembly = "playing";
        const inset = Math.max(68, (height - stageBounds.height) / 2);
        const from = window.scrollY;
        framing = { from, to: Math.max(from, from + stageBounds.top - inset) };
      }

      if (needsMeasure) {
        geometry = measure();
        needsMeasure = false;
      }
      if (!geometry) {
        settle();
        return;
      }

      const progress = bound((now - startedAt) / ASSEMBLY_DURATION);
      if (progress === 1) {
        settle();
        return;
      }
      if (framing) {
        const travel = bound(progress / .62);
        const eased = travel * travel * (3 - 2 * travel);
        window.scrollTo({ top: framing.from + (framing.to - framing.from) * eased, behavior: "instant" });
        if (travel === 1) framing = null;
      }
      projection.setArrival(progress);

      const marks = lines.map(line => line.getBoundingClientRect());
      const outgoing = lines.map(() => "");
      context.setTransform(size, 0, 0, size, 0, 0);
      context.clearRect(0, 0, window.innerWidth, height);
      context.globalCompositeOperation = "lighter";

      for (const source of geometry.origins) {
        if (progress <= source.leaves) outgoing[source.line] += source.path;
      }
      for (const [index, routes] of geometry.routes.entries()) {
        const target = destinations[index];
        const rect = target.getBoundingClientRect();
        let arrived = "";
        for (const { tile, shard, lands } of routes) {
          if (progress >= lands) arrived += tile.path;
          else if (progress > shard.leaves) {
            const mark = marks[shard.line];
            const elapsed = (progress - shard.leaves) / (lands - shard.leaves);
            drawShard(context, shard, mark.left + shard.x, Math.max(mark.top + shard.y, -height * .16),
              rect.left + tile.x, rect.top + tile.y, elapsed);
          }
        }
        target.style.clipPath = arrived ? `path("${arrived}")` : empty;
      }
      context.globalCompositeOperation = "source-over";
      for (const [index, line] of lines.entries()) {
        line.style.setProperty("--body-title-clip", outgoing[index] ? `path("${outgoing[index]}")` : empty);
      }
      if (!title.hasAttribute("data-body-disassembling")) title.setAttribute("data-body-disassembling", "");
      queue();
    };

    const invalidate = () => {
      needsMeasure = true;
      queue();
    };
    const resize = () => {
      if (finished) return;
      size = Math.min(window.devicePixelRatio || 1, 1.5);
      layer.width = Math.round(window.innerWidth * size);
      layer.height = Math.round(window.innerHeight * size);
      invalidate();
    };
    const releaseFraming = () => { framing = null; };

    const layout = new ResizeObserver(invalidate);
    for (const node of [title, ...destinations]) layout.observe(node);
    const content = new MutationObserver(invalidate);
    for (const node of copy) content.observe(node, { childList: true, characterData: true, subtree: true });
    content.observe(title, { attributes: true, attributeFilter: ["data-assembling", "data-assembly-pulse"] });
    resize();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("wheel", releaseFraming, { passive: true });
    window.addEventListener("touchstart", releaseFraming, { passive: true });
    window.addEventListener("keydown", releaseFraming);
    document.fonts.addEventListener("loadingdone", invalidate);
    body.addEventListener("load", invalidate);
    reduced.addEventListener("change", queue);
    return () => {
      cancelAnimationFrame(frame);
      reveal();
      projection.dispose();
      layout.disconnect();
      content.disconnect();
      delete scene.dataset.bodyAssembly;
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", resize);
      window.removeEventListener("wheel", releaseFraming);
      window.removeEventListener("touchstart", releaseFraming);
      window.removeEventListener("keydown", releaseFraming);
      document.fonts.removeEventListener("loadingdone", invalidate);
      body.removeEventListener("load", invalidate);
      reduced.removeEventListener("change", queue);
    };

  }, []);

  return (
    <div ref={stage} className={styles.stage} data-body-stage>
      <p className={styles.left}>{left}</p>
      <figure className={styles.figure}>
        <div ref={surface} className={styles.surface}>
          <Image ref={image} className={styles.body} src="/edition/portrait/full-body-hologram-v2.webp"
            alt={portrait} width={605} height={1100} loading="eager" sizes="(max-width: 700px) 52vw, 26vw" />
          <canvas ref={projectionCanvas} aria-hidden="true" className={styles.projection} />
        </div>
      </figure>
      <p className={styles.right}>{right}</p>
      <canvas ref={canvas} aria-hidden="true" className={fragments.shards} />
    </div>
  );
}
