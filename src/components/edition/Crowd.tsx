"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./Closing.module.css";

// The closing projection: Natan standing in a crowd of anonymous holograms,
// edge to edge across the footer. Every figure is stored in the portrait's
// channel layout (R lattice, G body, B rim, A coverage), so the whole crowd is
// first gathered into one buffer and then painted in a single pass, with the
// same raster, chroma split and tearing as the opening.

const HERO = "/edition/portrait/turn.webp";
const HERO_STILL = "/edition/portrait/turn-still.webp";
const ATLAS = "/edition/closing/crowd.webp";
const HERO_ASPECT = 500 / 660;
const CELL_ASPECT = 256 / 320;
const ATLAS_COLS = 4;
const ATLAS_ROWS = 2;
const ATLAS_FILL = 640 / 1024; // the atlas is padded to a power of two
const PEOPLE = ATLAS_COLS * ATLAS_ROWS;
const FLOATS = 8; // x, y, u, v, dim, kind, solid, unused
const bound = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

// A small deterministic generator, so the crowd stands in the same places on
// every visit and on the server-free first paint.
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

type Figure = {
  x: number; bottom: number; height: number; person: number; flip: boolean;
  dim: number; solid: number; depth: number; phase: number; hero?: boolean;
};

// Back to front. Heights and baselines are fractions of the stage height.
const ROWS = [
  { height: .32, bottom: .66, dim: .2, solid: .4, gap: .5, depth: .25 },
  { height: .44, bottom: .8, dim: .28, solid: .6, gap: .54, depth: .5 },
  { height: .6, bottom: .97, dim: .38, solid: .75, gap: .58, depth: .75 },
  { height: .84, bottom: 1.16, dim: .46, solid: .8, gap: .66, depth: 1, clear: true },
];

function arrange(width: number, height: number): Figure[] {
  const random = seeded(7);
  const narrow = width < 760;
  // On a phone the stage is taller than it is wide; size people by the width instead.
  const unit = narrow ? Math.min(height, width * 1.05) : height;
  const heroHeight = unit * (narrow ? .86 : .94);
  const heroClear = heroHeight * HERO_ASPECT * .5;
  const figures: Figure[] = [];

  ROWS.forEach(row => {
    const tall = unit * row.height;
    const wide = tall * CELL_ASPECT;
    let x = -wide * (.2 + random() * .3);
    while (x < width + wide * .5) {
      const near = Math.abs(x - width / 2) < heroClear;
      if (!(row.clear && near)) {
        figures.push({
          x, bottom: height - unit + unit * row.bottom + (random() - .5) * unit * .03,
          height: tall * (.92 + random() * .16),
          person: Math.floor(random() * PEOPLE), flip: random() > .5,
          dim: row.dim * (.82 + random() * .3), solid: row.solid,
          depth: row.depth, phase: random() * 100,
        });
      }
      x += wide * row.gap * (.8 + random() * .45) * (row.clear ? 1.35 : 1);
    }
  });

  figures.push({
    x: width / 2, bottom: height + heroHeight * .05, height: heroHeight,
    person: 0, flip: false, dim: 1, solid: 1, depth: .9, phase: 0, hero: true,
  });
  // Paint back to front; the hero sits between the third row and the sparse front row.
  return figures.sort((a, b) => (a.hero ? .9 : a.depth) - (b.hero ? .9 : b.depth));
}

const gatherVertex = `
  attribute vec2 position;
  attribute vec2 coord;
  attribute vec4 look;
  varying vec2 uv;
  varying vec4 tint;
  void main() {
    gl_Position = vec4(position, 0., 1.);
    uv = coord;
    tint = look;
  }
`;

// Pass one: lay every figure into one premultiplied buffer, still in the
// material channels. Distance is expressed as coverage, not as colour.
const gatherFragment = `
  precision mediump float;
  uniform sampler2D atlas, hero;
  varying vec2 uv;
  varying vec4 tint; // dim, kind, solid, unused
  void main() {
    vec4 t = tint.y > .5 ? texture2D(hero, uv) : texture2D(atlas, uv);
    float a = t.a * tint.x;
    vec3 material = vec3(t.r * (tint.y > .5 ? 1. : .7), t.g * tint.z, t.b);
    gl_FragColor = vec4(material * a, a);
  }
`;

const screenVertex = `
  attribute vec2 position;
  varying vec2 uv;
  void main() {
    gl_Position = vec4(position, 0., 1.);
    uv = vec2(.5 + position.x * .5, .5 - position.y * .5);
  }
`;

// Pass two: paint the gathered crowd as light.
const paintFragment = `
  precision mediump float;
  varying vec2 uv;
  uniform sampler2D scene;
  uniform vec2 texel, cell;
  uniform float time, glitch, rows, reveal;

  float hash(float n) { return fract(sin(n * 91.3458) * 47453.5453); }
  float hash2(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  vec4 take(vec2 p) { return texture2D(scene, vec2(p.x, 1. - p.y)); }

  void main() {
    vec2 p = uv;

    // Whole bands of the picture slip sideways when the signal breaks up.
    float beat = floor(time * 9.);
    float band = floor(p.y * 23. + hash(beat) * 6.);
    float slip = hash(band * 3.17 + beat * 7.3) - .5;
    float torn = step(.64, hash(band * 1.61 + beat * 2.9));
    p.x += slip * torn * glitch * .05;

    // The three colour guns never land on quite the same spot.
    vec2 ch = vec2(texel.x * (1.8 + glitch * 16.), 0.);
    vec4 r = take(p + ch), m = take(p), b = take(p - ch);
    float cover = max(max(r.a, b.a), m.a);

    vec3 wire = vec3(r.r, m.r, b.r);
    vec3 color =
        vec3(.07, .21, .09) * m.g
      + wire * vec3(.76, 1., .42)
      + wire * wire * wire * vec3(.9, 1., .78)
      + m.b * vec3(.4, .72, .25);

    // A soft halo, so the figures light the air around them.
    float halo = 0.;
    for (int i = 0; i < 8; i++) {
      float angle = float(i) * .785398 + .39;
      vec2 o = vec2(cos(angle), sin(angle)) * texel;
      vec4 near = take(p + o * 7.);
      vec4 far = take(p + o * 19.);
      halo += (near.r * .5 + near.b * .7 + near.g * .3) * .6 + (far.r * .4 + far.b * .5 + far.g * .4) * .4;
    }
    halo /= 8.;
    color += vec3(.32, .58, .18) * halo * .55;
    float alpha = max(cover, halo * .35);

    // Code rain. Each column falls at its own pace; inside a figure it reads
    // as the data the figure is made of, in the open air it is barely there.
    vec2 pixel = vec2(gl_FragCoord.x, gl_FragCoord.y);
    vec2 slot = floor(pixel / cell);
    vec2 inner = fract(pixel / cell);
    float speed = .25 + hash(slot.x * 1.31) * .55;
    float head = fract(time * speed * .16 + hash(slot.x * 4.7));
    float rowN = 1. - gl_FragCoord.y * texel.y;
    float trail = fract(head - rowN);
    float lit = exp(-trail * 9.) * step(.32, hash(slot.x * 2.9 + floor(time * .3 + hash(slot.x)) * 5.1));
    vec2 bit = floor(inner * vec2(4., 6.));
    float glyph = step(.5, hash2(slot * 1.7 + floor(time * (1. + hash(slot.y) * 3.)) * .31 + bit * vec2(3.1, 7.7)));
    glyph *= step(.12, inner.x) * step(inner.x, .88) * step(.08, inner.y) * step(inner.y, .92);
    float inside = smoothstep(.02, .35, m.a);
    float rain = glyph * lit * mix(.04 * (1. - uv.y), .42, inside);
    color += vec3(.5, 1., .38) * rain;
    alpha = max(alpha, rain * .8);

    // Raster lines locked to the screen, creeping upward.
    color *= .86 + .14 * cos((uv.y * rows - time * .4) * 6.2831853);
    // A soft interference bar rolling down the frame.
    float bar = fract(uv.y * .62 - time * .055);
    color *= 1. + .13 * smoothstep(0., .07, bar) * smoothstep(.2, .09, bar);
    // Mains hum, plus the dimming of a torn frame.
    color *= .965 + .035 * hash(floor(time * 11.));
    color *= 1. - .34 * glitch * torn;
    color += vec3(.10, .16, .06) * glitch * torn * cover;

    // The crowd is printed from the floor up the first time it is seen.
    float rise = 1. - uv.y;
    float front = reveal * 1.25 - .08;
    float shown = smoothstep(front + .015, front - .05, rise);
    float seam = exp(-abs(rise - front) * 70.) * (1. - smoothstep(.85, 1., reveal));
    // And sinks back into the emitter at the bottom edge.
    float floorFade = smoothstep(0., .13, rise);

    alpha *= shown * floorFade;
    color = color * shown * floorFade + vec3(.55, 1., .4) * seam * max(cover, .15) * floorFade;
    alpha = max(alpha, seam * .3 * floorFade);
    gl_FragColor = vec4(color, min(1., alpha));
  }
`;

function compile(gl: WebGLRenderingContext, vertex: string, fragment: string) {
  const program = gl.createProgram();
  if (!program) return null;
  const shaders = ([[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]] as const).map(([kind, text]) => {
    const shader = gl.createShader(kind)!;
    gl.shaderSource(shader, text);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
    return shader;
  });
  gl.linkProgram(program);
  shaders.forEach(shader => gl.deleteShader(shader));
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); return null; }
  return program;
}

function createProjector(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, powerPreference: "low-power" });
  if (!gl) return null;
  const gather = compile(gl, gatherVertex, gatherFragment);
  const paint = compile(gl, screenVertex, paintFragment);
  if (!gather || !paint) return null;

  const quads = gl.createBuffer();
  const screen = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, screen);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const textures: Record<"atlas" | "hero" | "scene", WebGLTexture | null> = { atlas: null, hero: null, scene: null };
  const framebuffer = gl.createFramebuffer();
  let data = new Float32Array(0);
  let sceneSize = [0, 0];

  function texture(source: TexImageSource | null, width = 0, height = 0) {
    const handle = gl!.createTexture();
    gl!.bindTexture(gl!.TEXTURE_2D, handle);
    for (const axis of [gl!.TEXTURE_WRAP_S, gl!.TEXTURE_WRAP_T]) gl!.texParameteri(gl!.TEXTURE_2D, axis, gl!.CLAMP_TO_EDGE);
    for (const filter of [gl!.TEXTURE_MIN_FILTER, gl!.TEXTURE_MAG_FILTER]) gl!.texParameteri(gl!.TEXTURE_2D, filter, gl!.LINEAR);
    if (source) gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, source);
    else gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, width, height, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, null);
    return handle;
  }

  function upload(name: "atlas" | "hero", image: HTMLImageElement) {
    textures[name] = texture(image);
    if (name === "atlas") {
      gl!.generateMipmap(gl!.TEXTURE_2D);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR_MIPMAP_LINEAR);
    }
  }

  function sizeScene(width: number, height: number) {
    if (sceneSize[0] === width && sceneSize[1] === height) return;
    if (textures.scene) gl!.deleteTexture(textures.scene);
    textures.scene = texture(null, width, height);
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, framebuffer);
    gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, textures.scene, 0);
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    sceneSize = [width, height];
  }

  const gatherAt = {
    position: gl.getAttribLocation(gather, "position"),
    coord: gl.getAttribLocation(gather, "coord"),
    look: gl.getAttribLocation(gather, "look"),
  };
  const paintAt = gl.getAttribLocation(paint, "position");
  const uniform = (program: WebGLProgram, name: string) => gl.getUniformLocation(program, name);
  gl.useProgram(gather);
  gl.uniform1i(uniform(gather, "atlas"), 0);
  gl.uniform1i(uniform(gather, "hero"), 1);
  gl.useProgram(paint);
  gl.uniform1i(uniform(paint, "scene"), 0);
  const paintUniforms = Object.fromEntries(["texel", "cell", "time", "glitch", "rows", "reveal"].map(name => [name, uniform(paint, name)]));

  function draw(figures: Figure[], width: number, height: number, scale: number, time: number, glitch: number, rows: number, reveal: number, sway: (figure: Figure) => [number, number, number]) {
    const pw = canvas.width, ph = canvas.height;
    sizeScene(pw, ph);
    if (data.length < figures.length * 6 * FLOATS) data = new Float32Array(figures.length * 6 * FLOATS);
    let n = 0;
    for (const figure of figures) {
      const [dx, dy, flicker] = sway(figure);
      const tall = figure.height;
      const wide = tall * (figure.hero ? HERO_ASPECT : CELL_ASPECT);
      const left = (figure.x + dx - wide / 2) / width * 2 - 1;
      const right = (figure.x + dx + wide / 2) / width * 2 - 1;
      const top = 1 - (figure.bottom + dy - tall) / height * 2;
      const bottom = 1 - (figure.bottom + dy) / height * 2;
      let u0 = 0, u1 = 1, v0 = 0, v1 = 1;
      if (!figure.hero) {
        u0 = (figure.person % ATLAS_COLS) / ATLAS_COLS; u1 = u0 + 1 / ATLAS_COLS;
        v0 = Math.floor(figure.person / ATLAS_COLS) / ATLAS_ROWS * ATLAS_FILL; v1 = v0 + ATLAS_FILL / ATLAS_ROWS;
      }
      if (figure.flip) [u0, u1] = [u1, u0];
      const corner = (x: number, y: number, u: number, v: number) => {
        data.set([x, y, u, v, figure.dim * flicker, figure.hero ? 1 : 0, figure.solid, 0], n);
        n += FLOATS;
      };
      corner(left, top, u0, v0); corner(right, top, u1, v0); corner(left, bottom, u0, v1);
      corner(left, bottom, u0, v1); corner(right, top, u1, v0); corner(right, bottom, u1, v1);
    }

    gl!.disable(gl!.BLEND);
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, framebuffer);
    gl!.viewport(0, 0, pw, ph);
    gl!.clearColor(0, 0, 0, 0);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.enable(gl!.BLEND);
    gl!.blendFunc(gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);
    gl!.useProgram(gather);
    gl!.activeTexture(gl!.TEXTURE0); gl!.bindTexture(gl!.TEXTURE_2D, textures.atlas);
    gl!.activeTexture(gl!.TEXTURE1); gl!.bindTexture(gl!.TEXTURE_2D, textures.hero);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, quads);
    gl!.bufferData(gl!.ARRAY_BUFFER, data.subarray(0, n), gl!.DYNAMIC_DRAW);
    const stride = FLOATS * 4;
    gl!.enableVertexAttribArray(gatherAt.position);
    gl!.vertexAttribPointer(gatherAt.position, 2, gl!.FLOAT, false, stride, 0);
    gl!.enableVertexAttribArray(gatherAt.coord);
    gl!.vertexAttribPointer(gatherAt.coord, 2, gl!.FLOAT, false, stride, 8);
    gl!.enableVertexAttribArray(gatherAt.look);
    gl!.vertexAttribPointer(gatherAt.look, 4, gl!.FLOAT, false, stride, 16);
    gl!.drawArrays(gl!.TRIANGLES, 0, n / FLOATS);
    gl!.disableVertexAttribArray(gatherAt.coord);
    gl!.disableVertexAttribArray(gatherAt.look);

    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    gl!.disable(gl!.BLEND);
    gl!.viewport(0, 0, pw, ph);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.useProgram(paint);
    gl!.activeTexture(gl!.TEXTURE0); gl!.bindTexture(gl!.TEXTURE_2D, textures.scene);
    gl!.uniform2f(paintUniforms.texel, 1 / pw, 1 / ph);
    gl!.uniform2f(paintUniforms.cell, Math.round(9 * scale), Math.round(13 * scale));
    gl!.uniform1f(paintUniforms.time, time);
    gl!.uniform1f(paintUniforms.glitch, glitch);
    gl!.uniform1f(paintUniforms.rows, rows);
    gl!.uniform1f(paintUniforms.reveal, reveal);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, screen);
    gl!.enableVertexAttribArray(paintAt);
    gl!.vertexAttribPointer(paintAt, 2, gl!.FLOAT, false, 0, 0);
    gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
  }

  function release() {
    Object.values(textures).forEach(handle => handle && gl!.deleteTexture(handle));
    gl!.deleteFramebuffer(framebuffer);
    gl!.deleteBuffer(quads); gl!.deleteBuffer(screen);
    gl!.deleteProgram(gather); gl!.deleteProgram(paint);
  }

  return { upload, draw, release };
}

export default function Crowd() {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const poster = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const holder = stage.current, layer = canvas.current, still = poster.current;
    if (!holder || !layer || !still) return;
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const projector = createProjector(layer);
    let ready = false, disposed = false, visible = false, frame = 0;
    let figures: Figure[] = [];
    let width = 1, height = 1, scale = 1, rows = 120;
    let revealStart = 0;
    let lean = 0, leanTarget = 0;
    let glitch = 0, burstUntil = 0, burstPeak = 0, nextBurst = 0;

    // Mostly a steady picture, with the occasional hard break-up, and always
    // breaking up together with the page-wide interference.
    function signal(now: number) {
      if (now > burstUntil) {
        if (!nextBurst) nextBurst = now + 1200 + Math.random() * 2600;
        if (now >= nextBurst) {
          burstUntil = now + 70 + Math.random() * 200;
          burstPeak = .3 + Math.random() * .6;
          nextBurst = burstUntil + 1800 + Math.random() * 5200;
        }
      }
      const page = root.dataset.signal === "hard" ? .9 : root.dataset.signal ? .45 : 0;
      const target = Math.max(page, now < burstUntil ? burstPeak * (.45 + .55 * Math.random()) : 0);
      glitch += (target - glitch) * (target > glitch ? .8 : .22);
      return glitch;
    }

    function sway(time: number) {
      return (figure: Figure): [number, number, number] => {
        if (figure.hero) return [lean * 10, Math.sin(time * .7) * height * .006, 1];
        const drift = Math.sin(time * .35 + figure.phase) * figure.height * .012 + lean * 26 * figure.depth;
        const breathe = Math.sin(time * .9 + figure.phase * 1.7) * figure.height * .004;
        // Now and then a figure loses its lock and drops out for a beat.
        const tick = Math.floor(time * 2.3 + figure.phase);
        const drop = Math.sin(tick * 12.9898 + figure.phase * 78.233) * 43758.5453 % 1;
        const flicker = Math.abs(drop) > .975 ? .25 + Math.abs(drop * 7 % 1) * .4 : 1;
        return [drift, breathe, flicker];
      };
    }

    function render(now: number) {
      frame = 0;
      if (disposed || !ready) return;
      const still = reduced.matches;
      const time = still ? 12 : now / 1000;
      const reveal = still ? 1 : revealStart ? bound((now - revealStart) / 2600, 0, 1) : 0;
      lean += (leanTarget - lean) * .05;
      projector!.draw(figures, width, height, scale, time, still ? 0 : signal(now), rows, reveal, sway(time));
      if (!still && visible) frame = requestAnimationFrame(render);
    }
    function queue() { if (!frame && !disposed && ready) frame = requestAnimationFrame(render); }

    function resize() {
      const rect = holder!.getBoundingClientRect();
      scale = Math.min(window.devicePixelRatio, 1.5);
      width = Math.max(1, rect.width); height = Math.max(1, rect.height);
      layer!.width = Math.max(1, Math.round(width * scale));
      layer!.height = Math.max(1, Math.round(height * scale));
      rows = Math.max(32, Math.round(height / 3.2));
      figures = arrange(width, height);
      queue();
    }
    function mode() {
      layer!.style.opacity = ready ? "1" : "0";
      still!.style.opacity = ready ? "0" : "1";
      queue();
    }
    function point(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      const rect = holder!.getBoundingClientRect();
      leanTarget = bound((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
    }
    function leave() { leanTarget = 0; }

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        if (!revealStart) { revealStart = performance.now(); holder!.dataset.live = ""; }
        queue();
      }
    }, { threshold: .18 });
    const dimensions = new ResizeObserver(resize);
    const lost = (event: Event) => { event.preventDefault(); ready = false; mode(); };
    intersection.observe(holder);
    dimensions.observe(holder);
    holder.addEventListener("pointermove", point);
    holder.addEventListener("pointerleave", leave);
    layer.addEventListener("webglcontextlost", lost);
    reduced.addEventListener("change", queue);
    resize();

    if (projector) {
      const load = (name: "atlas" | "hero", src: string) => {
        const image = new window.Image();
        image.src = src;
        return image.decode().then(() => { if (!disposed) projector.upload(name, image); });
      };
      void Promise.all([load("atlas", ATLAS), load("hero", HERO)]).then(() => {
        if (disposed) return;
        ready = true;
        mode();
      }).catch(() => { /* The still portrait stays in place when a texture is unavailable. */ });
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      intersection.disconnect(); dimensions.disconnect();
      holder.removeEventListener("pointermove", point);
      holder.removeEventListener("pointerleave", leave);
      layer.removeEventListener("webglcontextlost", lost);
      reduced.removeEventListener("change", queue);
      projector?.release();
    };
  }, []);

  return (
    <div ref={stage} className={styles.stage}>
      <p className={styles.farewell}>
        <span className={styles.see} data-text="See you">See you</span>{" "}
        <span className={styles.soon} data-text="soon.">soon.</span>
      </p>
      <Image ref={poster} src={HERO_STILL} alt="" width={500} height={660} unoptimized draggable={false} className={styles.poster} />
      <canvas ref={canvas} aria-hidden="true" className={styles.canvas} />
      <span className={styles.emitter} aria-hidden="true" />
    </div>
  );
}
