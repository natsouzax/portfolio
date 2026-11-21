// Bake one holographic material for every view, plus a depth channel.
// The browser paints the colour, scan lines and interference; this only carves the form.
// Run from the project root with node src/components/edition/build-portrait.mjs.
//
// Channel layout of <view>.webp
//   R  structure  the wire lattice and the captured ridge detail
//   G  body       the smooth volume behind the lattice
//   B  rim        the silhouette edge that catches the projector light
//   A  coverage   where the projection exists at all
//
// A view may be built from one capture or from two. With two, each capture is
// pushed sideways by the implied depth — one rotating towards the camera, the
// other away — before they are mixed, which stands in for a head angle that
// was never photographed.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const destination = "public/edition/portrait";
const source = "public/characters/identity-sprites-v3";
const width = 500;
const height = 660;

// file, crop left, crop right, mirror, horizontal depth warp
const BACK = ["mesh-back", 68, 380, false, 0];
const PROFILE = ["mesh-profile", 82, 365, true, 0];
const THREE_QUARTER = ["mesh-three-quarter", 48, 400, false, 0];

// name, captures, luminance floor, luminance gain, sparkle
// The photographed front view has no wireframe of its own, so it needs more
// bite in the lattice and the rim to sit beside the rendered views.
const views = [
  ["back", [BACK], 0.034, 3.1, 1],
  ["side", [PROFILE], 0.036, 3.1, 1],
  // The step from profile to three-quarter is too wide to cross in one cut.
  // Turned a little further away than the three-quarter, so the step from the
  // profile is crossed in two.
  ["half", [[...THREE_QUARTER.slice(0, 4), -58]], 0.034, 3.1, 1],
  ["turn", [THREE_QUARTER], 0.034, 3.1, 1],
  ["front", [["real", 47, 400, false, 0]], 0.052, 1.45, 1.5],
];

const TAU = Math.PI * 2;
const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
const noise = (x, y) => {
  const seed = Math.sin(x * 47.32 + y * 73.17) * 7585.13;
  return seed - Math.floor(seed);
};

// Load one capture and expose it as a sampler in the output's 0..1 space.
async function load([input, left, right, flip, warp]) {
  const { data, info } = await sharp(`${source}/portrait-${input}.webp`)
    .extract({ left, top: 55, width: right - left, height: 595 })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const at = (x, y, channel) =>
    data[(Math.floor(clamp(y, 0, info.height - 1)) * info.width + Math.floor(clamp(x, 0, info.width - 1))) * info.channels + channel] / 255;
  const lum =
    input === "real"
      ? (x, y) => at(x, y, 0) * 0.3 + at(x, y, 1) * 0.59 + at(x, y, 2) * 0.11
      : (x, y) => at(x, y, 1);

  // Preserve the head's aspect ratio. The wider texture leaves room for displaced edge particles.
  const place = (u, v, depth) => ({
    sx: (flip ? 1 - u : u) * 452 + (info.width - 452) / 2 + (flip ? -1 : 1) * warp * depth,
    sy: v * info.height,
  });
  const inside = sx => sx >= 1 && sx <= info.width - 2;
  return { lum, place, inside };
}

await mkdir(destination, { recursive: true });

for (const [name, captures, floor, gain, sparkle] of views) {
  const layers = await Promise.all(captures.map(load));
  const pixels = Buffer.alloc(width * height * 4);
  const depth = Buffer.alloc(width * height);
  // A flattened copy for the loading poster and the reduced-motion fallback,
  // shaded the same way the fragment shader shades the live projection.
  const still = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = x / width;
      const v = y / height;

      // An implied head volume. The lattice bends around it, and a blended
      // view leans each capture along it, so the views read as one object.
      const surface = Math.sqrt(clamp(1 - ((u - 0.5) / 0.34) ** 2 - ((v - 0.42) / 0.53) ** 2));

      let smooth = 0, ridge = 0, coarse = 0, weight = 0;
      for (const layer of layers) {
        const { sx, sy } = layer.place(u, v, surface);
        if (!layer.inside(sx)) continue;
        const { lum } = layer;
        smooth += (lum(sx, sy) * 2 + lum(sx - 2, sy) + lum(sx + 2, sy) + lum(sx, sy + 2) + lum(sx, sy - 2)) / 6;
        // Fine local contrast. Hair, lashes and the captured wireframe all live here.
        ridge += Math.max(Math.abs(lum(sx + 1, sy) - lum(sx - 1, sy)), Math.abs(lum(sx, sy + 1) - lum(sx, sy - 1)));
        coarse += Math.max(Math.abs(lum(sx + 3, sy) - lum(sx - 3, sy)), Math.abs(lum(sx, sy + 3) - lum(sx, sy - 3)));
        weight++;
      }
      if (!weight) continue;
      smooth /= weight; ridge /= weight; coarse /= weight;

      const body = clamp((smooth - floor) * gain);
      if (body < 0.012 && ridge < 0.05) continue;

      const z = surface * 0.68 + smooth * 0.32;

      // The projector draws in two sweeps: rings around the head, then ribs down it.
      const rings = 0.5 + 0.5 * Math.cos((v * 104 - z * 11) * TAU);
      const ribs = 0.5 + 0.5 * Math.cos((u * 68 + (z - 0.5) * 17) * TAU);
      const lattice = clamp(Math.max(rings ** 9, ribs ** 11) * 1.25);
      // Dash the wires so the surface resolves into points rather than solid lines.
      const stipple = (0.46 + 0.54 * (noise(x * 0.5, y * 0.5) > 0.42 ? 1 : 0.22)) ** sparkle;

      const detail = clamp(ridge * 2.6 + coarse * 1.15);
      const structure = clamp((lattice * stipple * (0.35 + 0.8 * body) * sparkle + detail * 0.92 * sparkle) * body ** 0.45);
      const rim = clamp((coarse * 1.7 + ridge * 0.9) * (1 - body * 0.45) * 1.25 * sparkle);

      // The shoulders fade out so the head floats instead of ending in a cut.
      const dissolveLine = 0.9 - Math.abs(u - 0.49) * 0.4 + 0.02 * Math.sin(u * 31);
      const dissolve = clamp((dissolveLine - v) * 12 + noise(x, y) * 0.9);
      const edge = clamp(Math.min(u, 1 - u) * width / 22);
      const coverage = clamp(Math.max(body * 3.6, structure * 1.6, rim * 1.2)) * dissolve * edge;
      if (coverage < 0.004) continue;

      const idx = (y * width + x) * 4;
      pixels[idx] = Math.round(255 * structure);
      pixels[idx + 1] = Math.round(255 * body);
      pixels[idx + 2] = Math.round(255 * rim);
      pixels[idx + 3] = Math.round(255 * coverage);
      depth[y * width + x] = Math.round(255 * z);

      const hot = structure ** 3;
      still[idx] = Math.round(255 * clamp(0.08 * body + 0.78 * structure + 0.92 * hot + 0.42 * rim));
      still[idx + 1] = Math.round(255 * clamp(0.23 * body + 1.0 * structure + 1.0 * hot + 0.74 * rim));
      still[idx + 2] = Math.round(255 * clamp(0.1 * body + 0.44 * structure + 0.8 * hot + 0.26 * rim));
      still[idx + 3] = pixels[idx + 3];
    }
  }

  await sharp(pixels, { raw: { width, height, channels: 4 } })
    .webp({ quality: 93, alphaQuality: 95 })
    .toFile(`${destination}/${name}.webp`);
  await sharp(depth, { raw: { width, height, channels: 1 } })
    .resize(128, 169)
    .webp({ quality: 72 })
    .toFile(`${destination}/${name}-depth.webp`);
  await sharp(still, { raw: { width, height, channels: 4 } })
    .webp({ quality: 88, alphaQuality: 92 })
    .toFile(`${destination}/${name}-still.webp`);
  console.log(`baked ${name}`);
}
