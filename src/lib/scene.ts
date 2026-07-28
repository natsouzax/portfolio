/**
 * Tuning constants for the ambient 3D layer.
 *
 * This module is intentionally free of any `three` / `@react-three/*` import so
 * that `AmbientWorld` (which ships in the main client bundle) can share values
 * with the lazily loaded WebGL scene without pulling three.js into that bundle.
 */

/**
 * WebGL cannot read CSS custom properties, so the palette has to be duplicated
 * as literal hex here. These MUST be kept in sync by hand with the tokens in
 * `src/app/globals.css`:
 *   --signal          #c8ff70
 *   --warm            #ffb66e
 *   --surface-bright  #1d211b
 *   --surface-raised  #171a16
 *   --text            #f0f4e9
 */
export const SCENE_COLOR = {
  signal: "#c8ff70",
  warm: "#ffb66e",
  surfaceBright: "#1d211b",
  surfaceRaised: "#171a16",
  text: "#f0f4e9",
} as const;

/**
 * Scroll-driven rotation range, in degrees, shared by the CSS orbit rings in
 * `AmbientWorld` and the 3D object group. Keeping a single source here is what
 * makes the WebGL version and the CSS fallback feel like the same motion.
 */
export const SCROLL_ROTATION = {
  fromDeg: -14,
  toDeg: 42,
} as const;

/** Scroll-driven depth shift of the whole object group (world units). */
export const GROUP_DEPTH = {
  from: -2,
  to: 1,
} as const;

/**
 * Opacity of the whole canvas layer once live. Deliberately low: this abstract
 * field is atmosphere only. The 3D that carries meaning lives in the content
 * itself — the capability orbit and the Lexuri cycle — and this must stay
 * subordinate to it, never competing for attention.
 */
export const SCENE_LAYER_OPACITY = 0.18;

export const CAMERA = {
  // Pulled well back so the primitives read as a distant field rather than as
  // large shapes crowding the text.
  position: [0, 0, 19] as [number, number, number],
  fov: 45,
  /**
   * How far the camera travels on each axis at full pointer deflection. Scaled
   * up to match the pulled-back camera — the same world-space travel reads as
   * less movement on screen from further away.
   */
  parallaxX: 2,
  parallaxY: 1.25,
  /** Per-second lerp rate for the camera follow. */
  followRate: 2.4,
  /** Delta clamp so returning from a background tab does not jump. */
  maxDelta: 0.1,
} as const;

export const LIGHTS = {
  /** Near-white ambient so unlit faces never reach pure black. */
  ambient: { color: SCENE_COLOR.text, intensity: 0.18 },
  /** Key light — mirrors the on-screen position of `.lightTop` (top / right). */
  key: {
    color: SCENE_COLOR.signal,
    intensity: 0.8,
    position: [9, 7, 6] as [number, number, number],
  },
  /** Fill light — mirrors the position of `.lightMiddle` (bottom / left). */
  fill: {
    color: SCENE_COLOR.warm,
    intensity: 0.42,
    position: [-9, -6, 4] as [number, number, number],
  },
} as const;

/** Renderer ceiling. Raising this needs a fresh perf measurement, not a guess. */
export const RENDERER = {
  dpr: [1, 1.5] as [number, number],
} as const;

type FloatConfig = {
  speed: number;
  rotationIntensity: number;
  floatIntensity: number;
};

type GeometrySpec =
  | { kind: "icosahedron"; args: [radius: number, detail: number] }
  | { kind: "octahedron"; args: [radius: number, detail: number] }
  | { kind: "tetrahedron"; args: [radius: number, detail: number] }
  | {
      kind: "torus";
      args: [
        radius: number,
        tube: number,
        radialSegments: number,
        tubularSegments: number,
      ];
    };

type SolidSurface = {
  render: "solid";
  color: string;
  emissive: string;
  emissiveIntensity: number;
  roughness: number;
  metalness: number;
};

type WireSurface = {
  render: "wire";
  color: string;
  opacity: number;
};

export type SceneObject = {
  id: string;
  geometry: GeometrySpec;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  float: FloatConfig;
} & (SolidSurface | WireSurface);

/**
 * Hard ceiling of 8 objects (see the perf notes in the plan): three primitive
 * families plus one non-uniformly scaled variant. Segment counts are kept
 * deliberately low so everything reads faceted / schematic rather than smooth.
 *
 * Float parameters are hand-tuned per object rather than randomised, so the
 * drift never reads as synchronised and stays identical between reloads.
 */
export const SCENE_OBJECTS: readonly SceneObject[] = [
  {
    id: "hero-icosahedron",
    geometry: { kind: "icosahedron", args: [1, 0] },
    position: [6.2, 3.05, 0.5],
    rotation: [0.35, 0.5, 0.1],
    render: "solid",
    color: SCENE_COLOR.surfaceBright,
    emissive: SCENE_COLOR.signal,
    emissiveIntensity: 0.12,
    roughness: 0.42,
    metalness: 0.18,
    float: { speed: 0.6, rotationIntensity: 0.35, floatIntensity: 0.8 },
  },
  {
    id: "hero-icosahedron-echo",
    geometry: { kind: "icosahedron", args: [0.5, 0] },
    position: [7.9, 1.4, -0.5],
    rotation: [0.2, 0.9, 0.4],
    render: "wire",
    color: SCENE_COLOR.signal,
    opacity: 0.6,
    float: { speed: 0.9, rotationIntensity: 0.55, floatIntensity: 1 },
  },
  {
    id: "orbit-torus",
    geometry: { kind: "torus", args: [1, 0.35, 8, 24] },
    position: [-6.6, 2.2, -2.5],
    rotation: [1.15, 0.4, 0],
    render: "solid",
    color: SCENE_COLOR.surfaceRaised,
    emissive: SCENE_COLOR.warm,
    emissiveIntensity: 0.14,
    roughness: 0.5,
    metalness: 0.22,
    float: { speed: 1.3, rotationIntensity: 0.25, floatIntensity: 0.55 },
  },
  {
    id: "orbit-torus-echo",
    geometry: { kind: "torus", args: [0.6, 0.2, 8, 20] },
    position: [4.6, -3.6, -1.5],
    rotation: [1.4, -0.35, 0.2],
    render: "wire",
    color: SCENE_COLOR.warm,
    opacity: 0.55,
    float: { speed: 0.7, rotationIntensity: 0.5, floatIntensity: 0.9 },
  },
  {
    id: "node-octahedron",
    geometry: { kind: "octahedron", args: [1, 0] },
    position: [-5.2, -3.2, -0.5],
    rotation: [0.3, 0.6, 0.1],
    render: "solid",
    color: SCENE_COLOR.surfaceBright,
    emissive: SCENE_COLOR.signal,
    emissiveIntensity: 0.09,
    roughness: 0.55,
    metalness: 0.12,
    float: { speed: 1.1, rotationIntensity: 0.4, floatIntensity: 0.65 },
  },
  {
    id: "node-octahedron-echo",
    geometry: { kind: "octahedron", args: [0.55, 0] },
    position: [1.2, 4.3, -3],
    rotation: [0.1, 0.4, 0.6],
    render: "wire",
    color: SCENE_COLOR.warm,
    opacity: 0.58,
    float: { speed: 0.8, rotationIntensity: 0.6, floatIntensity: 0.85 },
  },
  {
    id: "crystal",
    geometry: { kind: "icosahedron", args: [1, 0] },
    position: [-2.9, 3.6, -1.2],
    rotation: [0.2, 0.5, 0.15],
    scale: [0.6, 1.4, 0.6],
    render: "solid",
    color: SCENE_COLOR.surfaceBright,
    emissive: SCENE_COLOR.signal,
    emissiveIntensity: 0.16,
    roughness: 0.35,
    metalness: 0.25,
    float: { speed: 1.4, rotationIntensity: 0.3, floatIntensity: 0.5 },
  },
  {
    id: "distant-tetrahedron",
    geometry: { kind: "tetrahedron", args: [0.4, 0] },
    position: [2, -1, -9],
    rotation: [0.5, 0.2, 0.3],
    render: "wire",
    color: SCENE_COLOR.signal,
    opacity: 0.32,
    float: { speed: 0.5, rotationIntensity: 0.2, floatIntensity: 0.4 },
  },
];
