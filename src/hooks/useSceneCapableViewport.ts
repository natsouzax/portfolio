"use client";

import { useSyncExternalStore } from "react";

/**
 * The ambient 3D layer is desktop-with-a-mouse only.
 *
 * `pointer: fine` + `hover: hover` excludes phones and tablets: the pointer
 * parallax has no touch equivalent, and a continuous render loop is a real
 * battery / thermal cost while someone is just scrolling and reading.
 */
const SCENE_QUERY = "(min-width: 860px) and (pointer: fine) and (hover: hover)";

function subscribe(callback: () => void) {
  const mediaQuery = window.matchMedia(SCENE_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(SCENE_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function useSceneCapableViewport() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
