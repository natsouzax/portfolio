"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Lê uma media query sem quebrar a hidratação: o servidor não conhece o
 * viewport, então o primeiro render (servidor e cliente) devolve `false` e o
 * valor real entra depois do mount — mesmo padrão de `useIsReducedMotion` e
 * `useDesktopPinning`.
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener("change", callback);
      return () => mediaQuery.removeEventListener("change", callback);
    },
    [query]
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
