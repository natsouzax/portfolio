export const EASE = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  soft: [0.22, 1, 0.36, 1] as const,
} as const;

export const DURATION = {
  instant: 0.16,
  fast: 0.28,
  base: 0.5,
  slow: 0.82,
  scene: 1.15,
} as const;

export const SPRING = {
  tactile: { type: "spring", stiffness: 420, damping: 30, mass: 0.55 },
  object: { type: "spring", stiffness: 115, damping: 22, mass: 0.9 },
  ambient: { type: "spring", stiffness: 65, damping: 24, mass: 1.2 },
} as const;

export const PARALLAX = {
  near: 18,
  middle: 10,
  far: 5,
  pointerTilt: 5,
} as const;

export const VIEWPORT = {
  once: true,
  margin: "-12% 0px -12% 0px",
} as const;
