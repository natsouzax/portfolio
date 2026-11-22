import { projectionLight } from "./projection-light";

const vertex = `
  attribute vec2 position;
  varying vec2 uv;
  void main() {
    gl_Position = vec4(position, 0., 1.);
    uv = vec2(.5 + position.x * .5, .5 - position.y * .5);
  }
`;

const fragment = `
  precision highp float;
  uniform sampler2D image;
  uniform vec2 size;
  uniform float time, arrival;
  varying vec2 uv;

  ${projectionLight}

  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float luma(vec4 sampleColor) {
    return dot(sampleColor.rgb, vec3(.21, .72, .07)) * sampleColor.a;
  }

  void main() {
    vec2 pixel = uv * size;
    vec2 block = floor(pixel / vec2(8., 5.));
    float beat = floor(time * 12.);
    float scan = fract(time * .38 + .15);
    float sweep = exp(-abs(uv.y - scan) * 28.);
    float unstable = 1. - arrival;
    float pulse = step(.965, noise(vec2(floor(time * 3.), 7.)));
    float band = noise(vec2(floor(pixel.y * .23), beat));
    float dropout = noise(block + beat * vec2(.17, .47));
    float displaced = step(.82 - unstable * .28 - pulse * .14, dropout);
    vec2 p = uv;
    p.x += (band - .5) * (1.5 + 15. * unstable + 7. * pulse) * displaced / size.x;
    if (p.x < 0. || p.x > 1.) discard;

    vec2 texel = 1.15 / size;
    vec4 center = texture2D(image, p);
    vec4 left = texture2D(image, p - vec2(texel.x, 0.));
    vec4 right = texture2D(image, p + vec2(texel.x, 0.));
    vec4 up = texture2D(image, p - vec2(0., texel.y));
    vec4 down = texture2D(image, p + vec2(0., texel.y));
    float bright = luma(center);
    float edge = max(abs(luma(right) - luma(left)), abs(luma(down) - luma(up)));
    float rim = max(abs(right.a - left.a), abs(down.a - up.a));
    float cover = max(center.a, rim * .8);

    // Emit light from the photograph's contours and from a sparse phosphor grid.
    vec2 cell = pixel / 4.;
    vec2 dotShape = abs(fract(cell) - .5);
    float cross = max(
      (1. - smoothstep(.08, .18, dotShape.x)) * (1. - smoothstep(.28, .48, dotShape.y)),
      (1. - smoothstep(.08, .18, dotShape.y)) * (1. - smoothstep(.28, .48, dotShape.x))
    );
    float spark = noise(floor(cell) + vec2(beat * .27, 7.));
    float point = cross * (.28 + .72 * spark) * smoothstep(.015, .52, bright + edge);
    float contour = smoothstep(.035, .4, edge + rim * .3);
    float face = exp(-pow((uv.y - .13) * 10., 2.));
    float detail = smoothstep(.06, .74, bright);
    float filament = clamp(.14 * detail + .86 * contour + .88 * point, 0., 1.);
    vec3 wire = vec3(filament * .89 + abs(luma(right) - bright) * .21,
      filament, filament * .82 + abs(luma(left) - bright) * .25);
    vec3 color = phosphor(wire, bright * .58, rim * .66);
    color += vec3(.49, .71, .29) * detail * face * .46;
    color += vec3(.28, .46, .17) * sweep * (.4 * point + .26 * contour) * (1. + unstable);
    color *= raster(uv.y, size.y / 3., time, .18);

    float signal = 1. - displaced * (.11 + unstable * .62 + pulse * .18);
    float opacity = cover * clamp(.22 + filament * .79 + rim * .53 + detail * face * .27, 0., 1.) * signal;
    gl_FragColor = vec4(clamp(color, 0., 1.) * opacity, opacity);
  }
`;

function createProjection(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, depth: false, powerPreference: "low-power" });
  if (!gl) return null;
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  const shaders: WebGLShader[] = [];
  const release = () => {
    shaders.forEach(shader => gl.deleteShader(shader));
    gl.deleteProgram(program);
    gl.deleteBuffer(buffer);
    gl.deleteTexture(texture);
  };
  if (!program || !buffer || !texture) {
    release();
    return null;
  }

  for (const [kind, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]] as const) {
    const shader = gl.createShader(kind);
    if (!shader) { release(); return null; }
    shaders.push(shader);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { release(); return null; }
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const time = gl.getUniformLocation(program, "time");
  const size = gl.getUniformLocation(program, "size");
  const arrival = gl.getUniformLocation(program, "arrival");

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  return {
    release,
    upload(image: HTMLImageElement) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    },
    draw(width: number, height: number, seconds: number, amount: number) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(size, width, height);
      gl.uniform1f(time, seconds);
      gl.uniform1f(arrival, amount);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
  };
}

export function mountBodyProjection(surface: HTMLElement, image: HTMLImageElement, canvas: HTMLCanvasElement) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let projection: ReturnType<typeof createProjection> = null;
  let frame = 0, width = 0, height = 0;
  let visible = false, ready = false, lost = false;
  let arrival = 1;

  const queue = () => {
    if (!frame && visible && ready && width && height && !document.hidden) frame = requestAnimationFrame(paint);
  };
  const paint = (now: number) => {
    frame = 0;
    if (!visible || !ready || document.hidden) return;
    projection?.draw(width, height, reduced.matches ? 0 : now / 1000, reduced.matches ? 1 : arrival);
    surface.setAttribute("data-projection-live", "");
    if (!reduced.matches) queue();
  };
  const resize = (entries: ResizeObserverEntry[]) => {
    ({ width, height } = entries[0].contentRect);
    const density = Math.min(window.devicePixelRatio || 1, 1.6);
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    queue();
  };
  const upload = () => {
    if (!visible || lost || !image.naturalWidth) return;
    projection ??= createProjection(canvas);
    if (!projection) return;
    projection.upload(image);
    ready = true;
    queue();
  };
  const contextLost = (event: Event) => {
    event.preventDefault();
    ready = false;
    lost = true;
    projection = null;
    surface.removeAttribute("data-projection-live");
  };
  const contextRestored = () => {
    lost = false;
    upload();
  };

  const layout = new ResizeObserver(resize);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (ready) queue();
    else upload();
  });
  layout.observe(surface);
  observer.observe(surface);
  canvas.addEventListener("webglcontextlost", contextLost);
  canvas.addEventListener("webglcontextrestored", contextRestored);
  image.addEventListener("load", upload);
  document.addEventListener("visibilitychange", queue);
  reduced.addEventListener("change", queue);

  return {
    setArrival(value: number) { arrival = value; },
    dispose() {
      cancelAnimationFrame(frame);
      projection?.release();
      surface.removeAttribute("data-projection-live");
      observer.disconnect();
      layout.disconnect();
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.removeEventListener("webglcontextrestored", contextRestored);
      image.removeEventListener("load", upload);
      document.removeEventListener("visibilitychange", queue);
      reduced.removeEventListener("change", queue);
    },
  };
}
