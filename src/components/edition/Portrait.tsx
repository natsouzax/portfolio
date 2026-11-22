"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./Portrait.module.css";
import { projectionLight } from "./projection-light";

// The opening turns the head towards the viewer: it starts on the back of the
// head and settles on the three-quarter. The straight-on front view is not part
// of the sequence.
const views = ["back", "side", "turn"] as const;
const names = ["Back", "Profile", "Three-quarter"];
const LAST = views.length - 1;
const base = "/edition/portrait/";
const bound = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const TURN_DURATION = 1150;

// Left contour, visible feature and right contour at equally spaced heights.
// The points are in the 500 × 660 source images, from crown to shoulders.
const landmarks = [
  [[112, 258, 388], [104, 253, 396], [96, 242, 398]],
  [[128, 281, 377], [122, 259, 386], [107, 248, 394]],
  [[106, 316, 384], [99, 240, 375], [73, 199, 387]],
  [[126, 340, 375], [112, 235, 396], [89, 155, 383]],
  [[170, 291, 329], [167, 228, 373], [153, 181, 362]],
  [[143, 246, 351], [132, 207, 295], [133, 222, 315]],
  [[82, 243, 419], [98, 205, 326], [57, 263, 401]],
  [[82, 243, 419], [107, 211, 354], [72, 266, 423]],
  [[82, 243, 419], [107, 211, 354], [72, 266, 423]],
];

const vertex = `
  attribute vec2 position;
  varying vec2 uv;
  void main() {
    gl_Position = vec4(position, 0., 1.);
    uv = vec2(.5 + position.x * .5, .5 - position.y * .5);
  }
`;

// The textures carry form, not colour: red is the wire lattice, green the volume
// behind it, blue the silhouette rim, alpha the coverage. Everything that makes
// this read as a projection — the raster, the chroma split, the tearing and the
// interference — is painted here, per frame, so the image never sits still.
const fragment = `
  precision mediump float;
  varying vec2 uv;
  uniform sampler2D first, second, reliefA, reliefB;
  uniform sampler2D contours;
  uniform vec2 fit, tilt;
  uniform float fraction, scan, time, glitch, rows, burst;
  uniform vec2 poses;
  uniform vec3 hover;

  ${projectionLight}

  float hash(float n) { return fract(sin(n * 91.3458) * 47453.5453); }

  float remap(float x, float left, float right, float sourceLeft, float sourceRight) {
    return mix(sourceLeft, sourceRight, (x - left) / (right - left));
  }

  // Sample the two captures at corresponding points on the moving silhouette.
  float warp(float x, vec3 contour, vec3 source) {
    if (x < contour.x) return remap(x, 0., contour.x, 0., source.x);
    if (x < contour.y) return remap(x, contour.x, contour.y, source.x, source.y);
    if (x < contour.z) return remap(x, contour.y, contour.z, source.y, source.z);
    return remap(x, contour.z, 1., source.z, 1.);
  }

  void main() {
    vec2 p = (uv - .5) * fit + .5;

    // The projection swells and breaks apart at the end of the opening. The
    // sampling runs backwards, so growing the figure means pulling the sample
    // point towards the centre, and scattering it means pulling it inwards
    // along each cell's escape direction.
    vec2 core = vec2(.5, .44);
    float swell = 1. + burst * .22;
    p = (p - core) / swell + core;
    vec2 cell = floor(p * vec2(52., 68.));
    float seed = hash(cell.x * 7.13 + cell.y * 13.37);
    vec2 escape = normalize(p - core + vec2(.0001, .0002));
    p -= escape * burst * burst * (.05 + seed * .20);

    // The pointer is a probe. Around it the projection is resampled into
    // coarse blocks, as if the figure were being read cell by cell, and the
    // surface ripples outward from the contact point.
    vec2 probe = ((hover.xy - .5) * fit + .5 - core) / swell + core;
    vec2 toward = (p - probe) * vec2(.758, 1.);
    float reach = length(toward);
    float touch = hover.z * smoothstep(.2, .0, reach);
    float blocks = mix(150., 34., touch);
    p = mix(p, (floor(p * blocks) + .5) / blocks, step(.08, touch));
    p += normalize(toward + .0001) * sin(reach * 95. - time * 11.) * .005 * touch;

    // Horizontal tearing. Whole bands of the raster slip sideways when the
    // signal breaks up, the way a picture does on a mistracked tape.
    float step8 = floor(time * 9.);
    float band = floor(p.y * 17. + hash(step8) * 6.);
    float slip = (hash(band * 3.17 + step8 * 7.3) - .5);
    float torn = step(.62, hash(band * 1.61 + step8 * 2.9));
    p.x += slip * torn * glitch * .11;

    if (min(p.x, p.y) < 0. || max(p.x, p.y) > 1.) discard;

    float row = (p.y * ${landmarks.length - 1}. + .5) / ${landmarks.length}.;
    vec3 contourA = texture2D(contours, vec2(poses.x, row)).rgb;
    vec3 contourB = texture2D(contours, vec2(poses.y, row)).rgb;
    vec3 contour = mix(contourA, contourB, fraction);
    vec2 a = vec2(warp(p.x, contour, contourA), p.y);
    vec2 b = vec2(warp(p.x, contour, contourB), p.y);
    a -= (texture2D(reliefA, a).r - .27) * tilt;
    b -= (texture2D(reliefB, b).r - .27) * tilt;
    float blend = smoothstep(0., 1., fraction);

    // The three colour guns never land on quite the same spot, and they drift
    // further apart while the signal is unstable.
    vec2 ch = vec2(.0014 + glitch * .013 + touch * .011, 0.);
    vec4 red = mix(texture2D(first, a + ch), texture2D(second, b + ch), blend);
    vec4 mid = mix(texture2D(first, a), texture2D(second, b), blend);
    vec4 blu = mix(texture2D(first, a - ch), texture2D(second, b - ch), blend);

    vec3 wire = vec3(red.r, mid.r, blu.r);
    float body = mid.g;
    float rim = mid.b;
    float cover = max(max(red.a, blu.a), mid.a);
    // Fragments let go at their own moment rather than all at once.
    cover *= clamp(1. - burst * (.30 + seed * 1.7), 0., 1.) * (1. - smoothstep(.72, 1., burst));

    vec3 color = phosphor(wire, body, rim);

    // Each fragment flares as it tears loose.
    color += vec3(.70, 1., .42) * burst * (1. - burst * .7) * (.45 + seed * 1.1);

    // Scan rings travelling out from the probe, and the figure lighting up
    // under it.
    float ring = exp(-pow((fract(reach * 9. - time * 1.4) - .5) * 9., 2.));
    color += vec3(.55, 1., .35) * ring * touch * .55;
    color += wire * vec3(.5, .9, .3) * touch * .6;

    // The scan line moves with the opening turn.
    float sweep = smoothstep(.025, .051, .026 - abs(p.y - scan));
    color += vec3(.24, .33, .15) * sweep;

    // Raster lines, locked to the screen rather than the texture, creeping
    // upward so the projection never looks like a printed picture.
    color *= raster(uv.y, rows, time, .12);

    // A soft interference bar rolling down the frame.
    float bar = fract(uv.y * .62 - time * .055);
    color *= 1. + .13 * smoothstep(0., .07, bar) * smoothstep(.2, .09, bar);

    // Mains hum in the lamp, plus the dimming of a torn frame.
    color *= .965 + .035 * hash(floor(time * 11.));
    color *= 1. - .34 * glitch * torn;
    color += vec3(.10, .16, .06) * glitch * torn;

    gl_FragColor = vec4(color * cover, cover);
  }
`;

function createProjector(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, depth: false, powerPreference: "low-power" });
  if (!gl) return null;
  const program = gl.createProgram();
  if (!program) return null;
  const textures: WebGLTexture[] = [];
  const buffer = gl.createBuffer();
  const shaders: WebGLShader[] = [];
  function release() {
    textures.forEach(texture => gl!.deleteTexture(texture));
    shaders.forEach(shader => gl!.deleteShader(shader));
    gl!.deleteProgram(program);
    gl!.deleteBuffer(buffer);
  }
  for (const [kind, text] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]] as const) {
    const shader = gl.createShader(kind);
    if (!shader) { release(); return null; }
    shaders.push(shader);
    gl.shaderSource(shader, text);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { release(); return null; }
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uniforms = Object.fromEntries(
    ["first","second","reliefA","reliefB","contours","poses","fraction","scan","fit","tilt","time","glitch","rows","burst","hover"]
      .map(name => [name, gl.getUniformLocation(program, name)]));
  ["first","second","reliefA","reliefB","contours"].forEach((name,index) => gl.uniform1i(uniforms[name],index));
  const contourTexture = gl.createTexture();
  if (!contourTexture) { release(); return null; }
  textures[views.length * 2] = contourTexture;
  gl.activeTexture(gl.TEXTURE4);
  gl.bindTexture(gl.TEXTURE_2D, contourTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  const contourPixels = new Uint8Array(landmarks.flatMap(row =>
    row.flatMap(points => [...points.map(x => Math.round(x / 500 * 255)), 255])
  ));
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, views.length, landmarks.length, 0, gl.RGBA, gl.UNSIGNED_BYTE, contourPixels);
  gl.activeTexture(gl.TEXTURE0);
  function upload(img: HTMLImageElement, index: number) {
    const texture = gl!.createTexture();
    if (!texture) throw new Error("Texture unavailable");
    textures[index] = texture;
    gl!.bindTexture(gl!.TEXTURE_2D, texture);
    for (const axis of [gl!.TEXTURE_WRAP_S, gl!.TEXTURE_WRAP_T])
      gl!.texParameteri(gl!.TEXTURE_2D, axis, gl!.CLAMP_TO_EDGE);
    for (const filter of [gl!.TEXTURE_MIN_FILTER, gl!.TEXTURE_MAG_FILTER])
      gl!.texParameteri(gl!.TEXTURE_2D, filter, gl!.LINEAR);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, img);
  }
  function draw(angle: number, pitch: number, scan: number, time: number, glitch: number, rows: number, burst: number, hover: [number, number, number]) {
    const i = Math.floor(angle), j = Math.min(i+1,LAST);
    [i*2,j*2,i*2+1,j*2+1].forEach((idx, unit) => {
      gl!.activeTexture(gl!.TEXTURE0+unit);
      gl!.bindTexture(gl!.TEXTURE_2D, textures[idx]);
    });
    const aspect = canvas.width / canvas.height / (500/660);
    gl!.viewport(0,0,canvas.width,canvas.height);
    gl!.uniform2f(uniforms.fit, Math.max(1,aspect), Math.max(1,1/aspect));
    gl!.uniform2f(uniforms.tilt, Math.sin(angle/LAST*Math.PI)*.09, pitch*.045);
    gl!.uniform2f(uniforms.poses, (i + .5) / views.length, (j + .5) / views.length);
    gl!.uniform1f(uniforms.fraction, angle-i);
    gl!.uniform1f(uniforms.scan, scan);
    gl!.uniform1f(uniforms.time, time);
    gl!.uniform1f(uniforms.glitch, glitch);
    gl!.uniform1f(uniforms.rows, rows);
    gl!.uniform1f(uniforms.burst, burst);
    gl!.uniform3f(uniforms.hover, hover[0], hover[1], hover[2]);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.drawArrays(gl!.TRIANGLE_STRIP,0,4);
  }
  return { upload, draw, release };
}

export default function Portrait() {
  const holder = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const poster = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const stage = holder.current, layer = canvas.current, still = poster.current;
    if (!stage || !layer || !still) return;
    const hero = stage.closest<HTMLElement>("#top") ?? stage;
    const curtain = document.querySelector<HTMLElement>("[data-curtain]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const projector = createProjector(layer);
    let ready = false, disposed = false, visible = true, frame = 0;
    let angle = 0, introAngle = 0, drag = 0, pitch = 0, targetPitch = 0;
    let introStart = 0, introProgress = 0;
    // Where the pointer sits over the projection, in its own coordinates, and
    // how present it is (eased so the effect blooms and settles).
    let hoverX = .5, hoverY = .5, hoverOn = 0, hoverTarget = 0;
    let origin: { x: number; y: number; drag: number; id: number } | null = null;
    let last = 0;
    // One raster line every three CSS pixels, whatever the element is scaled to.
    let rows = 120;
    // Burst-driven signal loss: mostly quiet, with the occasional hard break-up.
    let glitch = 0, burstUntil = 0, burstPeak = 0, nextBurst = 0;

    function stillSource(view: number) { return `${base}${views[view]}-still.webp`; }

    function signal(now: number) {
      if (now > burstUntil) {
        if (!nextBurst) nextBurst = now + 900 + Math.random() * 2600;
        if (now >= nextBurst) {
          burstUntil = now + 70 + Math.random() * 190;
          burstPeak = .35 + Math.random() * .65;
          nextBurst = burstUntil + 1400 + Math.random() * 5200;
        }
      }
      const target = now < burstUntil ? burstPeak * (.45 + .55 * Math.random()) : 0;
      glitch += (target - glitch) * (now < burstUntil ? .8 : .22);
      return glitch;
    }

    function isRevealed() {
      if (!curtain?.isConnected) return true;
      return curtain.dataset.phase === "lifting"
        && curtain.getBoundingClientRect().bottom <= stage!.getBoundingClientRect().top;
    }

    function paint(now: number) {
      frame = 0;
      if (disposed || !visible) return;
      if (!introStart && ready && !reduced.matches && isRevealed()) introStart = now;
      if (introStart) {
        const t = bound((now - introStart) / TURN_DURATION, 0, 1);
        introProgress = t * t * (3 - 2 * t);
      }
      // Back to profile covers about twice the arc from profile to three-quarter.
      const arc = introProgress * 3;
      const nextIntroAngle = reduced.matches ? LAST : arc <= 2 ? arc / 2 : arc - 1;
      angle = bound(angle + nextIntroAngle - introAngle, 0, LAST);
      introAngle = nextIntroAngle;
      const target = bound(introAngle+drag,0,LAST);
      angle = reduced.matches || Math.abs(target - angle) < .001
        ? target : angle + (target - angle) * .11;
      pitch += (targetPitch-pitch)*.12;
      const view = Math.round(angle);
      if (view !== last) {
        stage!.setAttribute("aria-valuenow",String(view));
        stage!.setAttribute("aria-valuetext",names[view]);
        if (!ready || reduced.matches) still!.src = stillSource(view);
        last = view;
      }
      if (ready && !reduced.matches) {
        const burst = Number(hero.style.getPropertyValue("--burst"));
        hoverOn += (hoverTarget - hoverOn) * .1;
        const interference = introProgress === 1 && burst === 0 ? signal(now) : 0;
        projector?.draw(angle, pitch, introProgress, now / 1000, interference, rows, burst, [hoverX, hoverY, hoverOn]);
        queue();
      } else if (Math.abs(target-angle)>.001 || Math.abs(pitch-targetPitch)>.001) queue();
    }
    function queue() { if (!frame && visible && !disposed) frame = requestAnimationFrame(paint); }
    function resize() {
      const rect = layer!.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio,1.6);
      layer!.width = Math.max(1,Math.round(rect.width*scale));
      layer!.height = Math.max(1,Math.round(rect.height*scale));
      rows = Math.max(32, Math.round(rect.height / 4));
      queue();
    }
    function mode() {
      layer!.style.opacity = ready && !reduced.matches ? "1" : "0";
      still!.style.opacity = ready && !reduced.matches ? "0" : "calc(1 - var(--burst, 0))";
      if (reduced.matches) {
        still!.src = stillSource(last);
      }
      queue();
    }
    function down(event: PointerEvent) {
      if (!event.isPrimary || event.button !== 0) return;
      origin = { x: event.clientX, y: event.clientY, drag, id:event.pointerId };
      stage!.setPointerCapture(event.pointerId);
    }
    function move(event: PointerEvent) {
      if (origin?.id !== event.pointerId || !origin) return;
      drag = bound(origin.drag+(event.clientX-origin.x)/Math.max(80,stage!.clientWidth*.28),-introAngle,LAST-introAngle);
      targetPitch = bound((origin.y-event.clientY)/150,-1,1);
      queue();
    }
    function probe(event: PointerEvent) {
      if (event.pointerType === "touch" && !origin) return;
      const rect = layer!.getBoundingClientRect();
      hoverX = (event.clientX - rect.left) / Math.max(1, rect.width);
      hoverY = (event.clientY - rect.top) / Math.max(1, rect.height);
      hoverTarget = hoverX >= 0 && hoverX <= 1 && hoverY >= 0 && hoverY <= 1 ? 1 : 0;
    }
    function away() { hoverTarget = 0; }
    function end() { origin = null; targetPitch = 0; queue(); }
    function key(event: KeyboardEvent) {
      let next = Math.round(introAngle+drag);
      if (event.key === "ArrowRight" || event.key === "ArrowUp") next++;
      else if (event.key === "ArrowLeft" || event.key === "ArrowDown") next--;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = LAST;
      else return;
      event.preventDefault();
      drag = bound(next,0,LAST)-introAngle;
      queue();
    }
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; queue(); });
    const dimensions = new ResizeObserver(resize);
    const lost = () => { ready = false; still!.src = stillSource(last); mode(); };
    intersection.observe(stage); dimensions.observe(stage);
    stage.addEventListener("pointerdown",down);
    stage.addEventListener("pointermove",move);
    stage.addEventListener("lostpointercapture",end);
    stage.addEventListener("keydown",key);
    layer.addEventListener("webglcontextlost",lost);
    reduced.addEventListener("change",mode);
    window.addEventListener("pointermove",probe,{passive:true});
    document.addEventListener("pointerleave",away);
    resize();
    if (projector) {
      void Promise.all(views.flatMap((view,index) => ["","-depth"].map(async (suffix,depth) => {
        const img = new window.Image();
        img.src = base+view+suffix+".webp";
        await img.decode();
        if (!disposed) projector.upload(img,index*2+depth);
      }))).then(() => {
        if (disposed) return;
        ready = true;
        mode(); queue();
      }).catch(() => { /* The HTML portrait remains interactive when a texture is unavailable. */ });
    }
    return () => {
      disposed = true; cancelAnimationFrame(frame);
      dimensions.disconnect(); intersection.disconnect(); projector?.release();
      stage.removeEventListener("pointerdown",down); stage.removeEventListener("pointermove",move);
      stage.removeEventListener("lostpointercapture",end); stage.removeEventListener("keydown",key);
      layer.removeEventListener("webglcontextlost",lost);
      reduced.removeEventListener("change",mode);
      window.removeEventListener("pointermove",probe); document.removeEventListener("pointerleave",away);
    };
  },[]);

  return (
    <div className={styles.projection} ref={holder} role="slider" tabIndex={0}
      aria-label="Holographic portrait of Natan. Drag or use the arrow keys to turn."
      aria-valuemin={0} aria-valuemax={2} aria-valuenow={0} aria-valuetext="Back">
      <Image ref={poster} src="/edition/portrait/back-still.webp" alt="" fill preload unoptimized
        data-intro-poster draggable={false} className={styles.poster} />
      <canvas ref={canvas} aria-hidden="true" className={styles.canvas} />
    </div>
  );
}
