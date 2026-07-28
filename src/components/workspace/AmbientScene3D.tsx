"use client";

import type { MotionValue } from "motion/react";
import dynamic from "next/dynamic";
import { Component, type ReactNode } from "react";

/**
 * The only place in the app that reaches three.js code, and it does so behind
 * `ssr: false`. Combined with the conditional render in `AmbientWorld`, the
 * three.js chunk is never even requested for visitors who fail the gates.
 */
const Scene3D = dynamic(() => import("./Scene3D"), {
  ssr: false,
  loading: () => null,
});

type WebGLBoundaryProps = {
  children: ReactNode;
  onFailure: () => void;
};

type WebGLBoundaryState = {
  hasFailed: boolean;
};

/**
 * WebGL support is detected by letting three.js fail, rather than by probing
 * for a context ourselves: `WebGLRenderer` already throws when it cannot get a
 * `webgl2` / `webgl` context, and errors thrown from render or from effects
 * both surface here.
 */
class WebGLBoundary extends Component<WebGLBoundaryProps, WebGLBoundaryState> {
  state: WebGLBoundaryState = { hasFailed: false };

  static getDerivedStateFromError(): WebGLBoundaryState {
    return { hasFailed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[AmbientScene3D] WebGL layer disabled, keeping CSS fallback.", error);
    this.props.onFailure();
  }

  render() {
    return this.state.hasFailed ? null : this.props.children;
  }
}

export type AmbientScene3DProps = {
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  scrollYProgress: MotionValue<number>;
  onReady: () => void;
  onFailure: () => void;
};

export default function AmbientScene3D({
  pointerX,
  pointerY,
  scrollYProgress,
  onReady,
  onFailure,
}: AmbientScene3DProps) {
  return (
    <WebGLBoundary onFailure={onFailure}>
      <Scene3D
        pointerX={pointerX}
        pointerY={pointerY}
        scrollYProgress={scrollYProgress}
        onReady={onReady}
        onFailure={onFailure}
      />
    </WebGLBoundary>
  );
}
