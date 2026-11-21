// Bake the crowd that stands around the closing portrait, and Natan's place in it.
// Run from the project root with node src/components/edition/build-crowd.mjs.
//
// Eight anonymous busts, carved from signed distance fields and stored in one
// 4 x 2 atlas with the same channel layout as the portrait views, so the
// closing projector paints them with exactly the same material:
//   R  structure  the wire lattice and the silhouette detail
//   G  body       the smooth volume behind the lattice
//   B  rim        the silhouette edge that catches the projector light
//   A  coverage   where the projection exists at all
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const destination = "public/edition/closing";
const CELL_W = 256;
const CELL_H = 320;
const COLS = 4;
const TAU = Math.PI * 2;

const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
const mix = (a, b, t) => a + (b - a) * t;
const noise = (x, y) => {
  const seed = Math.sin(x * 47.32 + y * 73.17) * 7585.13;
  return seed - Math.floor(seed);
};
// Smooth union, so necks melt into shoulders instead of meeting at a seam.
const smin = (a, b, k) => {
  const h = clamp(0.5 + (0.5 * (b - a)) / k);
  return mix(b, a, h) - k * h * (1 - h);
};
const ellipse = (x, y, cx, cy, rx, ry) => (Math.hypot((x - cx) / rx, (y - cy) / ry) - 1) * Math.min(rx, ry);
const roundBox = (x, y, cx, cy, hw, hh, r) => {
  const qx = Math.abs(x - cx) - hw + r;
  const qy = Math.abs(y - cy) - hh + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
};

// hair: short | curly | long | bun | cap | buzz
// turn: -1 looks left, 1 looks right; the nose and the jaw follow it.
const people = [
  { hair: "short", turn: 0, head: [36, 46], neck: 46, shoulders: 112, slope: 0 },
  { hair: "curly", turn: 0.35, head: [35, 45], neck: 44, shoulders: 106, slope: 4 },
  { hair: "long", turn: -0.2, head: [33, 43], neck: 38, shoulders: 96, slope: -3 },
  { hair: "bun", turn: 0.8, head: [33, 44], neck: 40, shoulders: 98, slope: 2 },
  { hair: "cap", turn: -0.75, head: [36, 46], neck: 48, shoulders: 116, slope: -2 },
  { hair: "buzz", turn: 0, head: [37, 46], neck: 52, shoulders: 122, slope: 0 },
  { hair: "short", turn: -0.9, head: [35, 45], neck: 45, shoulders: 108, slope: 3 },
  { hair: "long", turn: 0.85, head: [33, 44], neck: 38, shoulders: 100, slope: -4 },
];

function person(spec) {
  const [rx, ry] = spec.head;
  const hx = CELL_W / 2 + spec.turn * 6;
  const hy = 98;
  const shoulderY = 172;
  const turned = Math.abs(spec.turn);

  return (x, y) => {
    // The jaw narrows below the cheekbones.
    const below = clamp((y - hy) / ry);
    const jaw = rx * (1 - 0.2 * below * below);
    if (spec.headless) {
      // Only the shoulders and chest: the hero's head comes from the portrait.
      const tilt = ((x - CELL_W / 2) / spec.shoulders) * spec.slope;
      const chest = roundBox(x, y - tilt, CELL_W / 2, shoulderY + 120, spec.shoulders, 120, 62);
      const trapezius = ellipse(x, y - tilt, CELL_W / 2, shoulderY + 40, spec.shoulders * 0.92, 46);
      const neck = roundBox(x, y, CELL_W / 2, shoulderY - 22, spec.neck / 2, 34, 12);
      return { d: smin(neck, smin(chest, trapezius, 16), 24), hair: false, collar: false };
    }
    let head = ellipse(x, y, hx - spec.turn * 4 * below, hy, jaw, ry);
    if (turned > 0.45) {
      const side = Math.sign(spec.turn);
      head = smin(head, ellipse(x, y, hx + side * (jaw - 3), hy + 8, 9, 11), 5);
    }
    // Ears sit on whichever side still faces the projector.
    if (turned < 0.6) {
      head = smin(head, ellipse(x, y, hx - rx + 1, hy + 4, 6, 11), 3);
      head = smin(head, ellipse(x, y, hx + rx - 1, hy + 4, 6, 11), 3);
    }

    const neck = roundBox(x, y, CELL_W / 2 + spec.turn * 2, shoulderY - 22, spec.neck / 2, 34, 12);
    const tilt = ((x - CELL_W / 2) / spec.shoulders) * spec.slope;
    // Shoulders fall away from the neck: a wide rounded chest under a sloped cap.
    const chest = roundBox(x, y - tilt, CELL_W / 2, shoulderY + 120, spec.shoulders, 120, 62);
    const trapezius = ellipse(x, y - tilt, CELL_W / 2, shoulderY + 40, spec.shoulders * 0.92, 46);
    const torso = smin(chest, trapezius, 16);

    let hair = Infinity;
    const crown = ellipse(x, y, hx, hy - 10, rx + 4, ry * 0.86);
    const capLine = y - (hy - ry * 0.18 + spec.turn * (x - hx) * 0.12);
    switch (spec.hair) {
      case "short":
        hair = Math.max(crown, capLine);
        break;
      case "curly": {
        const a = Math.atan2(y - hy, x - hx);
        const curls = 2.6 * Math.sin(a * 17) + 1.8 * Math.sin(a * 29 + 1.3) + 2.4 * noise(Math.floor(x / 4), Math.floor(y / 4));
        hair = Math.max(ellipse(x, y, hx, hy - 12, rx + 10, ry * 0.9) - curls, capLine - 8);
        break;
      }
      case "long": {
        const fall = Math.min(
          roundBox(x, y, hx - rx - 1, hy + 34, 12, 56, 11),
          roundBox(x, y, hx + rx + 1, hy + 34, 12, 56, 11),
        );
        hair = smin(Math.max(crown, capLine), fall, 10);
        break;
      }
      case "bun":
        hair = smin(Math.max(crown, capLine), ellipse(x, y, hx - spec.turn * 18, hy - ry - 8, 17, 15), 6);
        break;
      case "cap": {
        const dome = Math.max(ellipse(x, y, hx, hy - 14, rx + 3, ry * 0.8), y - (hy - ry * 0.3));
        const brim = roundBox(x, y, hx + spec.turn * 26, hy - ry * 0.3, rx * 0.95, 4, 3);
        hair = Math.min(dome, brim);
        break;
      }
      default:
        hair = Math.max(ellipse(x, y, hx, hy - 3, rx + 1.5, ry * 0.98), capLine + 8);
    }

    const figure = smin(smin(Math.min(head, hair), neck, 6), torso, 24);
    return { d: figure, hair: hair < 0.5, collar: Math.abs(neck) < 1.6 && y > shoulderY - 18 && torso < 2 };
  };
}

const width = CELL_W * COLS;
// Two rows of cells, padded to a power of two so the browser can mipmap the
// atlas; small figures would shimmer otherwise.
const height = 1024;
const pixels = Buffer.alloc(width * height * 4);
const still = Buffer.alloc(width * height * 4);
await mkdir(destination, { recursive: true });

// Shade one point of a figure in the material channels: [structure, body, rim, coverage].
function shade(field, x, y, seed, density = 1) {
  const here = field(x, y);
  const d = here.d;
  if (d > 2) return null;

  // Surface normal from the field, for a light that comes from above left.
  const gx = field(x + 1, y).d - field(x - 1, y).d;
  const gy = field(x, y + 1).d - field(x, y - 1).d;
  const g = Math.hypot(gx, gy) || 1;
  const light = clamp(0.4 + 0.6 * ((-gx / g) * 0.55 + (-gy / g) * 0.83));

  const u = x / CELL_W;
  const v = y / CELL_H;
  const inside = clamp(-d / 30);
  const z = Math.sqrt(1 - (1 - inside) ** 2);

  // The same two sweeps the portrait is drawn with: rings, then ribs.
  const rings = 0.5 + 0.5 * Math.cos((v * 46 * density - z * 6) * TAU);
  const ribs = 0.5 + 0.5 * Math.cos((u * 30 * density + (z - 0.5) * 8) * TAU);
  const lattice = clamp(Math.max(rings ** 8, ribs ** 10) * 1.2);
  const stipple = noise(x * 0.5 + seed * 31, y * 0.5) > 0.38 ? 1 : 0.25;

  const edge = Math.exp(-Math.abs(d) / 2.2);
  const rim = clamp(edge * (0.45 + 0.75 * light));
  const body = clamp((0.16 + 0.42 * z) * (0.55 + 0.45 * light) * (here.hair ? 0.7 : 1));
  const hairGrain = here.hair ? (noise(x * 0.33, y * 0.33) > 0.6 ? 0.55 : 0.1) : 0;
  const structure = clamp(lattice * stipple * (0.25 + 0.6 * z) + rim * 0.55 + hairGrain + (here.collar ? 0.5 : 0));

  // The busts dissolve towards the bottom so the crowd rises out of the floor.
  const dissolve = clamp((0.97 - v) * 7 + noise(x * 1.7, y * 1.3) * 0.9 - 0.2);
  const coverage = clamp(0.5 - d / 1.4) * clamp(Math.max(body * 3, structure * 1.5, rim)) * dissolve;
  if (coverage < 0.004) return null;
  return [structure, body, rim, coverage];
}

function write(target, preview, i, [structure, body, rim, coverage]) {
  target[i] = Math.round(255 * clamp(structure));
  target[i + 1] = Math.round(255 * clamp(body));
  target[i + 2] = Math.round(255 * clamp(rim));
  target[i + 3] = Math.round(255 * clamp(coverage));
  const hot = structure ** 3;
  preview[i] = Math.round(255 * clamp(0.08 * body + 0.78 * structure + 0.92 * hot + 0.42 * rim));
  preview[i + 1] = Math.round(255 * clamp(0.23 * body + 1.0 * structure + 1.0 * hot + 0.74 * rim));
  preview[i + 2] = Math.round(255 * clamp(0.1 * body + 0.44 * structure + 0.8 * hot + 0.26 * rim));
  preview[i + 3] = target[i + 3];
}

people.forEach((spec, index) => {
  const field = person(spec);
  const ox = (index % COLS) * CELL_W;
  const oy = Math.floor(index / COLS) * CELL_H;
  for (let y = 0; y < CELL_H; y++) {
    for (let x = 0; x < CELL_W; x++) {
      const material = shade(field, x + 0.5, y + 0.5, index);
      if (material) write(pixels, still, ((oy + y) * width + ox + x) * 4, material);
    }
  }
});

await sharp(pixels, { raw: { width, height, channels: 4 } })
  .webp({ quality: 90, alphaQuality: 92 })
  .toFile(`${destination}/crowd.webp`);
// A flattened preview for checking the bake by eye: CROWD_PREVIEW=path/to/file.png
if (process.env.CROWD_PREVIEW) {
  await sharp(still, { raw: { width, height, channels: 4 } })
    .flatten({ background: "#000" })
    .png()
    .toFile(process.env.CROWD_PREVIEW);
}
console.log("baked crowd");

// Natan, facing the visitor, carved from a front photograph into the same
// material as the crowd around him.
// art/natan-front.jpg is a cropped, metadata-free copy of that photograph,
// kept outside public/ so the source picture itself is never served.
const FRONT = "art/natan-front.jpg";
const crop = { left: 60, top: 0, width: 1080, height: 1160 };
const HERO_W = 460;
const HERO_H = Math.round((HERO_W * crop.height) / crop.width);

// --- Cut the figure out of the room -----------------------------------------
const { data: room, info: roomInfo } = await sharp(FRONT).extract(crop).raw().toBuffer({ resolveWithObject: true });
const RW = roomInfo.width, RH = roomInfo.height;
const key = Buffer.alloc(RW * RH);
// Ears sit in shadow, so the skin test is relaxed in a box around each one.
const ears = [[315, 385, 360, 520], [730, 795, 360, 520]];
for (let y = 0; y < RH; y++) {
  for (let x = 0; x < RW; x++) {
    const i = (y * RW + x) * 3, r = room[i], g = room[i + 1], b = room[i + 2];
    const luma = r * 0.3 + g * 0.59 + b * 0.11;
    const ear = ears.some(([x0, x1, y0, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1);
    // The wall is a near-neutral cream; skin is warm, and keeps its blue where wood does not.
    const skin = r - g > (ear ? 16 : 26) && b / (r + 1) > 0.42 && r > 70;
    const hair = luma < 72 && Math.max(r, g, b) - Math.min(r, g, b) < 40;
    const shirt = b > r + 14 && b > g;
    // Above the shoulders nothing wider than the head belongs to him: the wall
    // there carries an ornament and a wardrobe.
    const beside = y < 640 && (x < 300 || x > (y > 505 ? 750 : 805));
    key[y * RW + x] = !beside && (skin || hair || shirt) ? 255 : 0;
  }
}
const cleaned = await sharp(key, { raw: { width: RW, height: RH, channels: 1 } }).median(7).extractChannel(0).raw().toBuffer();
// Keep only the shape connected to the face, then fill each row between its
// outermost solid runs: a head and shoulders are solid along every row.
const figure = new Uint8Array(RW * RH);
const stack = [520 * RW + 540];
while (stack.length) {
  const p = stack.pop();
  if (figure[p] || cleaned[p] < 128) continue;
  figure[p] = 1;
  const x = p % RW, y = (p / RW) | 0;
  if (x > 0) stack.push(p - 1);
  if (x < RW - 1) stack.push(p + 1);
  if (y > 0) stack.push(p - RW);
  if (y < RH - 1) stack.push(p + RW);
}
const solid = Buffer.alloc(RW * RH);
for (let y = 0; y < RH; y++) {
  let first = -1, last = -1, run = 0;
  for (let x = 0; x < RW; x++) {
    run = figure[y * RW + x] ? run + 1 : 0;
    if (run >= 12) { if (first < 0) first = x - 11; last = x; }
  }
  if (first >= 0) solid.fill(255, y * RW + first, y * RW + last + 1);
}

// --- Work at the size the browser will sample ------------------------------
const shrink = (input, channels, sigma = 0) => {
  let pipeline = sharp(input, { raw: { width: RW, height: RH, channels } }).resize(HERO_W, HERO_H);
  if (sigma) pipeline = pipeline.blur(sigma);
  if (channels === 1) pipeline = pipeline.extractChannel(0);
  return pipeline.raw().toBuffer();
};
const picture = await shrink(room, 3);
const outline = await shrink(solid, 1, 0.8);
const volume = await shrink(solid, 1, 26);
const pick = (buffer, channels, x, y, c = 0) =>
  buffer[(Math.floor(clamp(y, 0, HERO_H - 1)) * HERO_W + Math.floor(clamp(x, 0, HERO_W - 1))) * channels + c] / 255;
const mask = (x, y) => pick(outline, 1, x, y);
const tone = (x, y) => pick(picture, 3, x, y, 0) * 0.3 + pick(picture, 3, x, y, 1) * 0.59 + pick(picture, 3, x, y, 2) * 0.11;

// Light is measured against the figure itself, so a dim room still gives a full range.
let low = 1, high = 0;
for (let y = 0; y < HERO_H; y++) for (let x = 0; x < HERO_W; x++) {
  if (mask(x, y) < 0.9) continue;
  const t = tone(x, y);
  low = Math.min(low, t); high = Math.max(high, t);
}

// Shaped the way the crowd is shaped (see shade above): coarse rings and ribs
// over an implied volume, light from the upper left, a rim on the silhouette
// and grain in the hair. The photograph only lends the silhouette and a faint
// trace of the features, so he reads as one of them, just recognisably him.
const band = await shrink(solid, 1, 3);
const slope = await shrink(solid, 1, 9);
const toneSoft = await shrink(room, 3, 2.5);
const soft = (x, y) => {
  const t = pick(toneSoft, 3, x, y, 0) * 0.3 + pick(toneSoft, 3, x, y, 1) * 0.59 + pick(toneSoft, 3, x, y, 2) * 0.11;
  return clamp((t - low) / Math.max(0.05, high - low));
};
const hero = Buffer.alloc(HERO_W * HERO_H * 4);
const heroStill = Buffer.alloc(HERO_W * HERO_H * 4);

for (let y = 0; y < HERO_H; y++) {
  for (let x = 0; x < HERO_W; x++) {
    const m = mask(x, y);
    if (m < 0.01) continue;
    const u = x / HERO_W, v = y / HERO_H;

    const gx = pick(slope, 1, x + 2, y) - pick(slope, 1, x - 2, y);
    const gy = pick(slope, 1, x, y + 2) - pick(slope, 1, x, y - 2);
    const g = Math.hypot(gx, gy);
    const light = g < 0.01 ? 0.62 : clamp(0.4 + 0.6 * ((gx / g) * 0.55 + (gy / g) * 0.83));
    const inside = clamp((pick(volume, 1, x, y) - 0.5) * 2);
    const z = Math.sqrt(1 - (1 - inside) ** 2);

    const rings = 0.5 + 0.5 * Math.cos((v * 33 - z * 6) * TAU);
    const ribs = 0.5 + 0.5 * Math.cos((u * 25 + (z - 0.5) * 8) * TAU);
    const lattice = clamp(Math.max(rings ** 8, ribs ** 10) * 1.2);
    const stipple = noise(x * 0.5, y * 0.5) > 0.38 ? 1 : 0.25;
    const rim = clamp((1 - Math.abs(pick(band, 1, x, y) - 0.5) * 2.2) ** 2 * (0.45 + 0.75 * light));

    const shade = soft(x, y);
    const isHair = v < 0.45 && shade < 0.25;
    const hairGrain = isHair ? (noise(Math.floor(x / 2), Math.floor(y / 2)) > 0.6 ? 0.55 : 0.1) : 0;
    // Just enough of the face to know whose it is: brows, eyes, the mouth, the beard line.
    const wideSoft = (soft(x - 4, y) + soft(x + 4, y) + soft(x, y - 4) + soft(x, y + 4)) / 4;
    const trace = isHair ? 0 : clamp(Math.abs(shade - wideSoft) * 4.2 - 0.06) * 0.85;

    const body = clamp((0.16 + 0.42 * z) * (0.55 + 0.45 * light) * (isHair ? 0.7 : 1) * (v < 0.62 ? 0.5 + 0.8 * shade : 1));
    // The grid dims where the face is in shadow, so eyes, brows and beard read as
    // darker hollows in the same lattice everyone else is made of.
    const isFace = !isHair && v < 0.62;
    const structure = clamp(lattice * stipple * (0.25 + 0.6 * z) * (isFace ? 0.2 + 1.1 * shade ** 1.3 : 1) + rim * 0.55 + hairGrain + trace);

    // The chest dissolves into the floor and the shoulders into the air.
    const floor = clamp((0.97 - v) * 7 + noise(x * 1.7, y * 1.3) * 0.9 - 0.2);
    const side = clamp(Math.min(x, HERO_W - 1 - x) / 34 + noise(x * 2.1, y) * 0.6 - 0.2);
    const coverage = m * clamp(Math.max(body * 3, structure * 1.5, rim)) * floor * side;
    if (coverage < 0.004) continue;
    write(hero, heroStill, (y * HERO_W + x) * 4, [structure, body, rim, coverage]);
  }
}

await sharp(hero, { raw: { width: HERO_W, height: HERO_H, channels: 4 } })
  .webp({ quality: 92, alphaQuality: 94 })
  .toFile(`${destination}/hero.webp`);
await sharp(heroStill, { raw: { width: HERO_W, height: HERO_H, channels: 4 } })
  .webp({ quality: 88, alphaQuality: 92 })
  .toFile(`${destination}/hero-still.webp`);
if (process.env.CROWD_PREVIEW) {
  await sharp(heroStill, { raw: { width: HERO_W, height: HERO_H, channels: 4 } })
    .flatten({ background: "#000" })
    .png()
    .toFile(process.env.CROWD_PREVIEW.replace(/\.png$/, "-hero.png"));
}
console.log(`baked hero ${HERO_W}x${HERO_H}`);
