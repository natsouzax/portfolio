"use client";

import { Float } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { MathUtils } from "three";
import type { Group } from "three";

import {
  CAMERA,
  GROUP_DEPTH,
  LIGHTS,
  RENDERER,
  SCENE_OBJECTS,
  SCROLL_ROTATION,
  type SceneObject,
} from "@/lib/scene";

export type Scene3DProps = {
  /** Pointer position, already smoothed by `SPRING.ambient` in AmbientWorld. */
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  scrollYProgress: MotionValue<number>;
  /** Fired once the renderer exists and a first frame is committed. */
  onReady: () => void;
  /** Fired on post-mount context loss so the CSS layer can take over again. */
  onFailure: () => void;
};

/**
 * Bridges Motion's value loop to the R3F render loop without any React
 * re-render: the motion values are read with `.get()` inside `useFrame`.
 */
function CameraRig({
  pointerX,
  pointerY,
}: {
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
}) {
  // The camera is read off the per-frame state rather than from `useThree` so
  // that mutating it does not trip the compiler's hook-immutability rule.
  useFrame(({ camera }, delta) => {
    // Clamped so a tab regaining focus does not snap the camera across.
    const step = Math.min(
      Math.min(delta, CAMERA.maxDelta) * CAMERA.followRate,
      1,
    );
    const targetX = pointerX.get() * CAMERA.parallaxX;
    // Pointer Y is +1 at the bottom of the viewport; world Y is up.
    const targetY = -pointerY.get() * CAMERA.parallaxY;

    camera.position.x = MathUtils.lerp(camera.position.x, targetX, step);
    camera.position.y = MathUtils.lerp(camera.position.y, targetY, step);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function ObjectGeometry({ geometry }: { geometry: SceneObject["geometry"] }) {
  switch (geometry.kind) {
    case "icosahedron":
      return <icosahedronGeometry args={geometry.args} />;
    case "octahedron":
      return <octahedronGeometry args={geometry.args} />;
    case "tetrahedron":
      return <tetrahedronGeometry args={geometry.args} />;
    case "torus":
      return <torusGeometry args={geometry.args} />;
  }
}

function SceneShape({ object }: { object: SceneObject }) {
  return (
    <Float
      speed={object.float.speed}
      rotationIntensity={object.float.rotationIntensity}
      floatIntensity={object.float.floatIntensity}
    >
      <mesh
        position={object.position}
        rotation={object.rotation}
        scale={object.scale}
      >
        <ObjectGeometry geometry={object.geometry} />
        {object.render === "solid" ? (
          <meshStandardMaterial
            color={object.color}
            emissive={object.emissive}
            emissiveIntensity={object.emissiveIntensity}
            roughness={object.roughness}
            metalness={object.metalness}
            flatShading
          />
        ) : (
          <meshBasicMaterial
            color={object.color}
            wireframe
            transparent
            opacity={object.opacity}
          />
        )}
      </mesh>
    </Float>
  );
}

/**
 * Scroll drives the whole group, never the individual objects — the per-object
 * `<Float>` drift stays independent so the three motion sources (pointer,
 * scroll, drift) compose additively instead of fighting each other.
 */
function ObjectField({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    const progress = scrollYProgress.get();
    group.rotation.y = MathUtils.degToRad(
      SCROLL_ROTATION.fromDeg +
        (SCROLL_ROTATION.toDeg - SCROLL_ROTATION.fromDeg) * progress,
    );
    group.position.z =
      GROUP_DEPTH.from + (GROUP_DEPTH.to - GROUP_DEPTH.from) * progress;
  });

  return (
    <group ref={groupRef}>
      {SCENE_OBJECTS.map((object) => (
        <SceneShape key={object.id} object={object} />
      ))}
    </group>
  );
}

/**
 * Signals readiness only after a frame has actually been committed, and routes
 * a lost GPU context back to the CSS layer instead of leaving a dead canvas.
 */
function SceneLifecycle({
  onReady,
  onFailure,
}: {
  onReady: () => void;
  onFailure: () => void;
}) {
  const gl = useThree((state) => state.gl);
  const hasSignalled = useRef(false);

  useFrame(() => {
    if (hasSignalled.current) return;
    hasSignalled.current = true;
    onReady();
  });

  useEffect(() => {
    const canvas = gl.domElement;

    function handleContextLost() {
      onFailure();
    }

    canvas.addEventListener("webglcontextlost", handleContextLost);
    return () =>
      canvas.removeEventListener("webglcontextlost", handleContextLost);
  }, [gl, onFailure]);

  return null;
}

export default function Scene3D({
  pointerX,
  pointerY,
  scrollYProgress,
  onReady,
  onFailure,
}: Scene3DProps) {
  // Background tabs stop rendering entirely rather than burning GPU on drift.
  const [frameloop, setFrameloop] = useState<"always" | "never">("always");

  useEffect(() => {
    function syncFrameloop() {
      setFrameloop(document.visibilityState === "visible" ? "always" : "never");
    }

    syncFrameloop();
    document.addEventListener("visibilitychange", syncFrameloop);
    return () => document.removeEventListener("visibilitychange", syncFrameloop);
  }, []);

  return (
    <Canvas
      frameloop={frameloop}
      dpr={RENDERER.dpr}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      camera={{ position: CAMERA.position, fov: CAMERA.fov }}
    >
      <ambientLight
        color={LIGHTS.ambient.color}
        intensity={LIGHTS.ambient.intensity}
      />
      <directionalLight
        color={LIGHTS.key.color}
        intensity={LIGHTS.key.intensity}
        position={LIGHTS.key.position}
      />
      {/* decay 0 keeps the fill readable at this distance without a huge intensity. */}
      <pointLight
        color={LIGHTS.fill.color}
        intensity={LIGHTS.fill.intensity}
        position={LIGHTS.fill.position}
        decay={0}
      />
      <CameraRig pointerX={pointerX} pointerY={pointerY} />
      <ObjectField scrollYProgress={scrollYProgress} />
      <SceneLifecycle onReady={onReady} onFailure={onFailure} />
    </Canvas>
  );
}
