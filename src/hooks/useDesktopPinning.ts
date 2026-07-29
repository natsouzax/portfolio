"use client";

import { useSyncExternalStore } from "react";

const DESKTOP_QUERY =
  "(min-width: 900px) and (hover: hover) and (pointer: fine)";

function subscribe(callback: () => void) {
  const mediaQuery = window.matchMedia(DESKTOP_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function useDesktopPinning() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
