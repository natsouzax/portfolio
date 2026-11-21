// Bake a transparent relief and depth channel once; the browser only projects the surface.
// Run from the project root with node src/components/edition/build-portrait.mjs.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const destination = "public/edition/portrait";
const source = "public/characters/identity-sprites-v3";
const width = 500;
const height = 660;
const views = [
  ["front", "real", 47, 400, false],
  ["turn", "mesh-three-quarter", 48, 400, false],
  ["side", "mesh-profile", 82, 365, true],
  ["back", "mesh-back", 68, 380, false],
];
const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
const noise = (x, y) => {
  const seed = Math.sin(x * 47.32 + y * 73.17) * 7585.13;
  return seed - Math.floor(seed);
};
await mkdir(destination, { recursive: true });

for (const [name, input, left, right, flip] of views) {
  const isFace = name === "front";
  const pipeline = sharp(`${source}/portrait-${input}.webp`).extract({ left, top: 55, width: right - left, height: 595 });
  const { data, info } = await pipeline.removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const get = (x, y, channel) => data[(Math.floor(clamp(y, 0, info.height-1)) * info.width + Math.floor(clamp(x, 0, info.width-1))) * info.channels + channel] / 255;
  const lum = (x,y) => isFace ? get(x,y,0) * .85 + get(x,y,1) * .15 : get(x,y,1);
  const pixels = Buffer.alloc(width * height * 4);
  const depth = Buffer.alloc(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = x / width, v = y / height;
      // Preserve the face's aspect ratio. The wider texture leaves room for displaced edge particles.
      const sx = (flip ? 1-u : u) * 452 + (info.width - 452) / 2;
      const sy = v * info.height;
      if (sx < 1 || sx > info.width-2) continue;
      const value = lum(sx,sy);
      const smooth = (value * 2 + lum(sx-2,sy) + lum(sx+2,sy) + lum(sx,sy+2) + lum(sx,sy-2)) / 6;
      const ridge = Math.max(Math.abs(lum(sx+1,sy) - lum(sx-1,sy)), Math.abs(lum(sx,sy+1) - lum(sx,sy-1)));
      const material = isFace ? clamp((smooth-.036)*1.7) : clamp((smooth-.033)*3.65 + ridge*.95);
      if (material < .012) continue;
      const grain = noise(x,y);
      const surface = Math.sqrt(clamp(1 - ((u - .5) / .34)**2 - ((v - .42) / .53)**2));
      const z = surface * .68 + smooth * .32;
      const stipple = grain > .62 ? 1 : .37;
      const contour = (Math.cos(v * 285 - z * 18 + u * 12) + 1) * .5;
      const line = contour > .90 ? .34 : 0;
      const light = clamp((material ** .66) * (.54 + stipple * .43 + line) + ridge * .34);
      const idx = (y * width + x) * 4;
      // Pale lithium highlights, fern green in the midtones. Dark gaps let the page show through.
      pixels[idx] = 47 + 199 * light ** .85;
      pixels[idx+1] = 105 + 150 * light ** .52;
      pixels[idx+2] = 22 + 186 * light ** 2.35;
      const threshold = .9 - Math.abs(u-.49)*.40 + .02*Math.sin(u*31);
      const dissolve = clamp((threshold-v)*12 + grain*.9);
      const edge = clamp(Math.min(sx, info.width-1-sx) / 22);
      pixels[idx+3] = 255 * clamp(material * 4.8) * dissolve * edge * (.55 + .45*stipple);
      depth[y*width+x] = Math.round(255*z);
    }
  }
  await sharp(pixels,{raw:{width,height,channels:4}}).webp({ quality: 91, alphaQuality: 94 }).toFile(`${destination}/${name}.webp`);
  await sharp(depth,{raw:{width,height,channels:1}}).resize(128,169).webp({quality:72}).toFile(`${destination}/${name}-depth.webp`);
}
