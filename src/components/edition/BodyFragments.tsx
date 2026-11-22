"use client";

import Image from "next/image";
import { mountBodyProjection } from "./body-projection";
import { drawShard, makeCopyShards, makeTitleShards, sampleTiles } from "./fragment-art";
import fragments from "./Fragments.module.css";
import styles from "./BodyFragments.module.css";

const empty = "inset(50%)";
const clip = (path: string) => path ? `path("${path}")` : empty;

export function mountBodyFragments(scene: HTMLElement, title: HTMLElement, lead: HTMLElement | null) {
  const body = scene.querySelector("img");
  const output = scene.querySelector<HTMLElement>("[data-body-surface]");
  const display = output?.querySelector("canvas");
  const layer = scene.querySelector<HTMLCanvasElement>("[data-body-fragments]");
  const context = layer?.getContext("2d");
  const copy = Array.from(scene.querySelectorAll<HTMLElement>(":scope > p"));
  const lines = Array.from(title.querySelectorAll<HTMLElement>(":scope > span, :scope > em"));
  if (lead) lines.push(lead);
  if (!body || !output || !display || !layer || !context || copy.length !== 2) return null;

  const sample = document.createElement("canvas");
  const ink = sample.getContext("2d", { willReadFrequently: true });
  if (!ink) return null;
  const projection = mountBodyProjection(output, body, display);
  const destinations = [output, ...copy];

  const measure = () => {
    const narrow = window.innerWidth <= 700;
    const origins = lines.flatMap((node, line) => {
      const shards = node === lead
        ? makeCopyShards(node, narrow ? 3 : 4)
        : makeTitleShards(node, sample, narrow ? 80 : 180, true);
      return shards.map(shard => ({ ...shard, line, leaves: shard.start * .93 }));
    });
    if (!origins.length || !body.naturalWidth || !body.offsetWidth || !body.offsetHeight) return null;

    sample.width = body.offsetWidth;
    sample.height = body.offsetHeight;
    ink.drawImage(body, 0, 0, sample.width, sample.height);
    const bodyTiles = sampleTiles(ink, sample.width, sample.height, sample.width * sample.height, narrow ? 195 : 350);
    const targets = [bodyTiles, ...copy.map(node => makeCopyShards(node, narrow ? 4 : 5))];
    if (targets.some(tiles => !tiles.length)) return null;

    const routes = targets.map((tiles, destination) => tiles.map((tile, index) => {
      const shard = origins[Math.floor((((index + destination * 13) * .6180339887) % 1) * origins.length)];
      return { tile, shard, lands: .48 + shard.leaves * .98 + ((index * .3819660113) % 1) * .15 };
    }));
    return { origins, routes };
  };

  let geometry: ReturnType<typeof measure> = null;
  let needsMeasure = true;
  let painted = false;
  const invalidate = () => { needsMeasure = true; };
  const layout = new ResizeObserver(invalidate);
  const content = new MutationObserver(invalidate);
  for (const node of [...lines, ...destinations]) {
    layout.observe(node);
    content.observe(node, { childList: true, characterData: true, subtree: true });
  }
  body.addEventListener("load", invalidate);
  document.fonts.addEventListener("loadingdone", invalidate);

  function setSourceClips(paths: string[]) {
    title.setAttribute("data-body-disassembling", "");
    for (const [index, line] of lines.entries()) {
      line.style.setProperty("--body-title-clip", clip(paths[index]));
    }
  }

  function clearSourceClips() {
    title.removeAttribute("data-body-disassembling");
    for (const line of lines) line.style.removeProperty("--body-title-clip");
  }

  function clearCanvas() {
    if (!painted) return;
    context!.resetTransform();
    context!.clearRect(0, 0, layer!.width, layer!.height);
    painted = false;
  }

  function showAll() {
    clearCanvas();
    clearSourceClips();
    for (const target of destinations) target.style.removeProperty("clip-path");
    projection.setArrival(1);
    delete scene.dataset.bodyAssembly;
  }

  function render(progress: number) {
    if (progress === 1 && !body!.naturalWidth) {
      showAll();
      return;
    }
    if (progress === 0 || progress === 1) {
      clearCanvas();
      if (progress === 0) clearSourceClips();
      else setSourceClips(lines.map(() => ""));
      for (const target of destinations) {
        if (progress === 0) target.style.clipPath = empty;
        else target.style.removeProperty("clip-path");
      }
      projection.setArrival(progress);
      scene.dataset.bodyAssembly = progress === 0 ? "pending" : "complete";
      return;
    }

    if (needsMeasure) {
      geometry = measure();
      // Retry once the body or fonts finish loading, rather than hiding the readable copy.
      needsMeasure = false;
    }
    if (!geometry) {
      showAll();
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    const canvasWidth = Math.round(width * pixelRatio);
    const canvasHeight = Math.round(height * pixelRatio);
    if (layer!.width !== canvasWidth || layer!.height !== canvasHeight) {
      layer!.width = canvasWidth;
      layer!.height = canvasHeight;
    }

    const marks = lines.map(line => line.getBoundingClientRect());
    const outgoing = lines.map(() => "");
    context!.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context!.clearRect(0, 0, width, height);
    context!.globalCompositeOperation = "lighter";

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
          drawShard(context!, shard, mark.left + shard.x, Math.max(mark.top + shard.y, -height * .16),
            rect.left + tile.x, rect.top + tile.y, elapsed);
        }
      }
      target.style.clipPath = clip(arrived);
    }
    context!.globalCompositeOperation = "source-over";
    painted = true;
    setSourceClips(outgoing);
    projection.setArrival(progress);
    scene.dataset.bodyAssembly = "playing";
  }

  return {
    isReady: () => body.naturalWidth > 0,
    render,
    showAll,
    dispose() {
      showAll();
      projection.dispose();
      layout.disconnect();
      content.disconnect();
      body.removeEventListener("load", invalidate);
      document.fonts.removeEventListener("loadingdone", invalidate);
    },
  };
}

export default function BodyFragments({ left, right, portrait }: {
  left: string;
  right: string;
  portrait: string;
}) {
  return (
    <div className={styles.stage} data-body-stage>
      <p className={styles.left}>{left}</p>
      <figure className={styles.figure}>
        <div className={styles.surface} data-body-surface>
          <Image className={styles.body} src="/edition/portrait/full-body-hologram-v2.webp"
            alt={portrait} width={605} height={1100} loading="eager" sizes="(max-width: 700px) 52vw, 26vw" />
          <canvas aria-hidden="true" className={styles.projection} />
        </div>
      </figure>
      <p className={styles.right}>{right}</p>
      <canvas aria-hidden="true" className={fragments.shards} data-body-fragments />
    </div>
  );
}
