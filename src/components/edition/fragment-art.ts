export type Tile = { x: number; y: number; path: string };
export type Shard = Tile & {
  fromX: number; fromY: number; bowX: number; bowY: number;
  start: number; land: number; size: number; spin: number; tone: number;
};

export function sampleLine(line: HTMLElement, sample: HTMLCanvasElement, density: number): Tile[] {
  const { offsetWidth: width, offsetHeight: height } = line;
  if (!width || !height) return [];

  const style = getComputedStyle(line);
  const padding = Math.ceil(parseFloat(style.fontSize) * 0.24);
  sample.width = Math.ceil(width) + 2 * padding;
  sample.height = Math.ceil(height) + 2 * padding;
  const ink = sample.getContext("2d", { willReadFrequently: true });
  if (!ink) return [];

  const text = line.textContent ?? "";
  ink.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  ink.letterSpacing = style.letterSpacing;
  const metrics = ink.measureText(text);
  const baseline = padding + (height + metrics.fontBoundingBoxAscent - metrics.fontBoundingBoxDescent) / 2;
  ink.lineWidth = 4;
  ink.strokeText(text, padding, baseline);
  ink.fillText(text, padding, baseline);

  return sampleTiles(ink, sample.width, sample.height, width * height, density, padding);
}

export function sampleTiles(
  ink: CanvasRenderingContext2D,
  width: number,
  height: number,
  area: number,
  density: number,
  padding = 0,
): Tile[] {
  const { data } = ink.getImageData(0, 0, width, height);
  const step = Math.max(4, Math.round(Math.sqrt(area / density)));
  const tiles: Tile[] = [];
  for (let top = 0; top < height; top += step) {
    for (let left = 0; left < width; left += step) {
      const right = Math.min(left + step, width);
      const bottom = Math.min(top + step, height);
      let count = 0, sumX = 0, sumY = 0;
      for (let y = top; y < bottom; y += 2) {
        for (let x = left; x < right; x += 2) {
          if (data[(y * width + x) * 4 + 3] < 32) continue;
          count++;
          sumX += x;
          sumY += y;
        }
      }
      if (!count) continue;
      // Slight overlap avoids hairline seams between adjacent revealed tiles.
      const x = left - padding;
      const y = top - padding;
      const path = `M${x} ${y}h${right - left + 0.3}v${bottom - top + 0.3}H${x}Z`;
      tiles.push({ x: sumX / count - padding, y: sumY / count - padding, path });
    }
  }
  return tiles;
}

export function makeShards(tiles: Tile[], random = Math.random): Shard[] {
  // Each line gets the same arrival window, with its tiles scattered through it.
  return tiles.map((tile, index) => ({
    ...tile,
    fromX: .23 + random() * .54, fromY: .13 + random() * .73,
    bowX: (random() - 0.5) * 0.55, bowY: random() * 0.17 + 0.03,
    start: 0.13 + random() * 0.24,
    land: 0.65 + ((index * 0.6180339887) % 1) * 0.33,
    size: 4 + random() * 11, spin: (random() - 0.5) * 7, tone: random(),
  })).sort((a, b) => a.land - b.land);
}

const assembledTitles = new WeakMap<HTMLElement, { layout: string; shards: Shard[] }>();

export function makeTitleShards(
  line: HTMLElement,
  sample: HTMLCanvasElement,
  density: number,
  reuse = false,
) {
  const layout = `${line.offsetWidth}:${line.offsetHeight}:${density}:${line.textContent}`;
  const existing = assembledTitles.get(line);
  if (reuse && existing?.layout === layout) return existing.shards;
  const shards = makeShards(sampleLine(line, sample, density));
  assembledTitles.set(line, { layout, shards });
  return shards;
}

export function makeCopyShards(node: HTMLElement, columns: number): Shard[] {
  const bounds = node.getBoundingClientRect();
  if (!bounds.height) return [];

  const range = document.createRange();
  range.selectNodeContents(node);
  // Use the rendered lines so each translation follows its own wrapping.
  const tiles = Array.from(range.getClientRects(), line => {
    const left = line.left - bounds.left - 3;
    const top = line.top - bounds.top - 2;
    const width = (line.width + 6) / columns;
    const height = line.height + 4;

    return Array.from({ length: columns }, (_, column) => {
      const x = left + column * width;
      return {
        x: x + width / 2,
        y: top + height / 2,
        path: `M${x.toFixed(2)} ${top.toFixed(2)}h${(width + .3).toFixed(2)}v${height.toFixed(2)}H${x.toFixed(2)}Z`,
      };
    });
  }).flat();

  return makeShards(tiles).map(shard => {
    const land = .66 + .27 * (shard.y / bounds.height) + .04 * shard.tone;
    return {
      ...shard,
      start: land - .35,
      land,
      size: 2 + shard.tone * 3,
      bowX: shard.bowX * .45,
      bowY: shard.bowY * .6,
    };
  }).sort((a, b) => a.land - b.land);
}

export function drawShard(
  context: CanvasRenderingContext2D,
  shard: Shard,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  t: number,
) {
  const k = 1 - Math.pow(1 - t, 1.8);
  const inv = 1 - k;
  const bowX = (fromX + toX) / 2 + shard.bowX * window.innerWidth;
  const bowY = (fromY + toY) / 2 + shard.bowY * window.innerHeight;
  const x = inv * inv * fromX + 2 * inv * k * bowX + k * k * toX;
  const y = inv * inv * fromY + 2 * inv * k * bowY + k * k * toY;
  const dx = 2 * (inv * (bowX - fromX) + k * (toX - bowX));
  const dy = 2 * (inv * (bowY - fromY) + k * (toY - bowY));
  const run = Math.hypot(dx, dy) * Math.pow(inv, 1.6);
  const size = shard.size * (1.35 - k * 0.65);
  const streak = size + Math.min(run * 0.09, 50);
  const alpha = Math.min(1, t / 0.08);

  context.save();
  context.translate(x, y);
  context.rotate(run > 1 ? Math.atan2(dy, dx) : shard.spin);
  context.globalAlpha = alpha * (1 - k) * 0.4;
  context.fillStyle = "#7fd84a";
  context.fillRect(-streak, -size / 8, streak, size / 4);
  context.globalAlpha = alpha * 0.92;
  context.fillStyle = k > 0.97 || shard.tone > 0.72 ? "#f2ffd2" : "#b4ff72";
  context.fillRect(-size / 2, -size / 7, size, size / 3.5);
  if (shard.tone > 0.55) context.fillRect(-size / 7, -size / 2.4, size / 3.5, size / 1.2);
  context.restore();
}
