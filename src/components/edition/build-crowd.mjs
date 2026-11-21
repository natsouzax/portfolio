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
const ROWS = 2;
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
// Padded to a power of two so the browser can mipmap it; small figures would shimmer otherwise.
const height = 1024;
const pixels = Buffer.alloc(width * height * 4);
const still = Buffer.alloc(width * height * 4);
await mkdir(destination, { recursive: true });

// Shade one point of a figure in the material channels: [structure, body, rim, coverage].
function shade(field, x, y, seed) {
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
  const rings = 0.5 + 0.5 * Math.cos((v * 46 - z * 6) * TAU);
  const ribs = 0.5 + 0.5 * Math.cos((u * 30 + (z - 0.5) * 8) * TAU);
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

// Natan, cut to the same bust as everyone else: the three-quarter portrait for
// the head, standing on a crowd-style torso. Twice the crowd's resolution,
// because this is the one figure people will look at closely.
const HERO_W = CELL_W * 2;
const HERO_H = CELL_H * 2;
const headWidth = 290;
const headHeight = Math.round(headWidth * 660 / 500);
const headLeft = Math.round((HERO_W - headWidth) / 2) + 6;
const headTop = 62;
const head = await sharp("public/edition/portrait/turn.webp")
  .resize(headWidth, headHeight)
  .raw()
  .toBuffer();
const torso = person({ headless: true, head: [36, 46], turn: 0, neck: 40, shoulders: 102, slope: 2 });
const hero = Buffer.alloc(HERO_W * HERO_H * 4);
const heroStill = Buffer.alloc(HERO_W * HERO_H * 4);

for (let y = 0; y < HERO_H; y++) {
  for (let x = 0; x < HERO_W; x++) {
    const hx = x - headLeft, hy = y - headTop;
    // The portrait is cut at the collar; its own cropped shoulders would never
    // match the crowd's, so the baked torso carries them instead.
    const collar = clamp((headTop + headHeight * 0.7 - y) / 34 + (noise(x, y) - 0.5) * 0.5);
    const portrait = hx >= 0 && hy >= 0 && hx < headWidth && hy < headHeight
      ? [0, 1, 2, 3].map(c => head[(hy * headWidth + hx) * 4 + c] / 255 * collar)
      : [0, 0, 0, 0];
    const takeover = clamp((y - 270) / 50);
    const body = takeover > 0 ? shade(torso, (x + 0.5) / 2, (y + 0.5) / 2, 9) : null;
    if (!body && portrait[3] < 0.004) continue;
    const share = body ? takeover * (1 - portrait[3] * 0.55) : 0;
    const material = portrait.map((value, c) => clamp(value + (body ? body[c] * share : 0)));
    write(hero, heroStill, (y * HERO_W + x) * 4, material);
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
console.log("baked hero");
