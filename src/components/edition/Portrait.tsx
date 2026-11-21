"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./Portrait.module.css";

const views = ["front", "turn", "side", "back"] as const;
const names = ["Front", "Three-quarter", "Profile", "Back"];
const base = "/edition/portrait/";
const bound = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const vertex = `
  attribute vec2 position;
  varying vec2 uv;
  void main() {
    gl_Position = vec4(position, 0., 1.);
    uv = vec2(.5 + position.x * .5, .5 - position.y * .5);
  }
`;
const fragment = `
  precision mediump float;
  varying vec2 uv;
  uniform sampler2D first, second, reliefA, reliefB;
  uniform vec2 fit, tilt;
  uniform float fraction, scan;
  void main() {
    vec2 p = (uv - .5) * fit + .5;
    if (min(p.x,p.y) < 0. || max(p.x,p.y) > 1.) discard;
    vec2 a = p - (texture2D(reliefA,p).r - .27) * tilt;
    vec2 b = p - (texture2D(reliefB,p).r - .27) * tilt;
    vec4 ca = texture2D(first, a);
    vec4 cb = texture2D(second, b);
    float noise = fract(sin(dot(floor(p * vec2(280.,360.)), vec2(12.9898,78.233))) * 451.76);
    float threshold = .09 + p.y * .72 + noise * .10;
    float blend = smoothstep(threshold-.085, threshold+.085, fraction);
    vec4 color = mix(ca,cb,blend);
    float sweep = smoothstep(.025, .0 + .026, .026 - abs(p.y - scan));
    color.rgb += vec3(.24,.33,.15) * sweep;
    gl_FragColor = vec4(color.rgb * color.a, color.a);
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
  const uniforms = Object.fromEntries(["first","second","reliefA","reliefB","fraction","scan","fit","tilt"]
    .map(name => [name,gl.getUniformLocation(program,name)]));
  ["first","second","reliefA","reliefB"].forEach((name,index) => gl.uniform1i(uniforms[name],index));
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
  function draw(angle: number, pitch: number, scan: number) {
    const i = Math.floor(angle), j = Math.min(i+1,3);
    [i*2,j*2,i*2+1,j*2+1].forEach((idx, unit) => {
      gl!.activeTexture(gl!.TEXTURE0+unit);
      gl!.bindTexture(gl!.TEXTURE_2D, textures[idx]);
    });
    const aspect = canvas.width / canvas.height / (500/660);
    gl!.viewport(0,0,canvas.width,canvas.height);
    gl!.uniform2f(uniforms.fit, Math.max(1,aspect), Math.max(1,1/aspect));
    gl!.uniform2f(uniforms.tilt, Math.sin((angle-1)*Math.PI)*.09, pitch*.045);
    gl!.uniform1f(uniforms.fraction, angle-i);
    gl!.uniform1f(uniforms.scan, scan);
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
    const hero = stage.closest("#top") ?? stage;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const projector = createProjector(layer);
    let ready = false, disposed = false, visible = true, frame = 0;
    let angle = 1, scrollAngle = 1, drag = 0, pitch = 0, targetPitch = 0, travel = 0;
    let origin: { x: number; y: number; drag: number; id: number } | null = null;
    let last = 1;

    function paint() {
      frame = 0;
      if (disposed || !visible) return;
      const target = bound(scrollAngle+drag,0,3);
      angle += (target-angle) * (reduced.matches ? 1 : .24);
      pitch += (targetPitch-pitch)*.24;
      const view = Math.round(angle);
      if (view !== last) {
        stage!.setAttribute("aria-valuenow",String(view));
        stage!.setAttribute("aria-valuetext",names[view]);
        if (!ready || reduced.matches) still!.src = base+views[view]+".webp";
        last = view;
      }
      if (ready && !reduced.matches) projector?.draw(angle,pitch,travel);
      if (Math.abs(target-angle)>.001 || Math.abs(pitch-targetPitch)>.001) queue();
    }
    function queue() { if (!frame && visible && !disposed) frame = requestAnimationFrame(paint); }
    function scroll() {
      const rect = hero.getBoundingClientRect();
      travel = bound(-rect.top / Math.max(1, rect.height - window.innerHeight*.25),0,1);
      scrollAngle = reduced.matches ? 1 : 1 + travel * 2;
      queue();
    }
    function resize() {
      const rect = layer!.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio,1.6);
      layer!.width = Math.max(1,Math.round(rect.width*scale));
      layer!.height = Math.max(1,Math.round(rect.height*scale));
      scroll();
    }
    function mode() {
      layer!.style.opacity = ready && !reduced.matches ? "1" : "0";
      still!.style.opacity = ready && !reduced.matches ? "0" : "1";
      if (reduced.matches) still!.src = base+views[last]+".webp";
      scroll();
    }
    function down(event: PointerEvent) {
      if (!event.isPrimary || event.button !== 0) return;
      origin = { x: event.clientX, y: event.clientY, drag, id:event.pointerId };
      stage!.setPointerCapture(event.pointerId);
    }
    function move(event: PointerEvent) {
      if (origin?.id !== event.pointerId || !origin) return;
      drag = bound(origin.drag+(event.clientX-origin.x)/Math.max(80,stage!.clientWidth*.28),-scrollAngle,3-scrollAngle);
      targetPitch = bound((origin.y-event.clientY)/150,-1,1);
      queue();
    }
    function end() { origin = null; targetPitch = 0; queue(); }
    function key(event: KeyboardEvent) {
      let next = Math.round(scrollAngle+drag);
      if (event.key === "ArrowRight" || event.key === "ArrowUp") next++;
      else if (event.key === "ArrowLeft" || event.key === "ArrowDown") next--;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = 3;
      else return;
      event.preventDefault();
      drag = bound(next,0,3)-scrollAngle;
      queue();
    }
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) scroll(); });
    const dimensions = new ResizeObserver(resize);
    const lost = () => { ready = false; still!.src = base+views[last]+".webp"; mode(); };
    intersection.observe(stage); dimensions.observe(stage);
    stage.addEventListener("pointerdown",down);
    stage.addEventListener("pointermove",move);
    stage.addEventListener("lostpointercapture",end);
    stage.addEventListener("keydown",key);
    layer.addEventListener("webglcontextlost",lost);
    reduced.addEventListener("change",mode);
    window.addEventListener("scroll",scroll,{passive:true});
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
        projector.draw(angle,pitch,travel); mode();
      }).catch(() => { /* The HTML portrait remains interactive when a texture is unavailable. */ });
    }
    return () => {
      disposed = true; cancelAnimationFrame(frame);
      dimensions.disconnect(); intersection.disconnect(); projector?.release();
      stage.removeEventListener("pointerdown",down); stage.removeEventListener("pointermove",move);
      stage.removeEventListener("lostpointercapture",end); stage.removeEventListener("keydown",key);
      layer.removeEventListener("webglcontextlost",lost);
      reduced.removeEventListener("change",mode); window.removeEventListener("scroll",scroll);
    };
  },[]);

  return (
    <div className={styles.projection} ref={holder} role="slider" tabIndex={0}
      aria-label="Holographic portrait of Natan. Drag or use the arrow keys to turn."
      aria-valuemin={0} aria-valuemax={3} aria-valuenow={1} aria-valuetext="Three-quarter">
      <Image ref={poster} src="/edition/portrait/turn.webp" alt="" fill preload unoptimized
        data-intro-poster draggable={false} className={styles.poster} />
      <canvas ref={canvas} aria-hidden="true" className={styles.canvas} />
    </div>
  );
}
