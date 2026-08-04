import { useSyncExternalStore } from "react";

/**
 * Reactive viewport breakpoint. The free-canvas desk needs width to breathe, so
 * it only runs on **desktop / tablet landscape** (≥ 1024). Narrower viewports
 * (phone *and* tablet portrait) use the compact layout — gate that on
 * `isCompact`. Also exposes coarse-pointer detection so touch-only affordances
 * can differ from hover ones.
 *
 * Breakpoints match Tailwind's defaults: phone < 640, tablet 640–1023,
 * desktop ≥ 1024. `isCompact` = width < 1024 (phone or tablet portrait).
 */
export type Breakpoint = "phone" | "tablet" | "desktop";

const QUERIES = {
  tablet: "(min-width: 640px)",
  desktop: "(min-width: 1024px)",
  coarse: "(hover: none) and (pointer: coarse)",
} as const;

function read() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return { breakpoint: "desktop" as Breakpoint, isCoarsePointer: false };
  }
  const desktop = window.matchMedia(QUERIES.desktop).matches;
  const tablet = window.matchMedia(QUERIES.tablet).matches;
  const breakpoint: Breakpoint = desktop ? "desktop" : tablet ? "tablet" : "phone";
  return {
    breakpoint,
    isCoarsePointer: window.matchMedia(QUERIES.coarse).matches,
  };
}

// Cache so getSnapshot returns a stable reference until something changes.
let snapshot = read();

function subscribe(onChange: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mqls = Object.values(QUERIES).map((q) => window.matchMedia(q));
  const handler = () => {
    const next = read();
    if (
      next.breakpoint !== snapshot.breakpoint ||
      next.isCoarsePointer !== snapshot.isCoarsePointer
    ) {
      snapshot = next;
      onChange();
    }
  };
  mqls.forEach((m) => m.addEventListener("change", handler));
  return () => mqls.forEach((m) => m.removeEventListener("change", handler));
}

export function useBreakpoint() {
  const { breakpoint, isCoarsePointer } = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => snapshot
  );
  return {
    breakpoint,
    isPhone: breakpoint === "phone",
    isTablet: breakpoint === "tablet",
    isDesktop: breakpoint === "desktop",
    // Teléfono o tablet en vertical: se usa el layout compacto en vez del canvas.
    isCompact: breakpoint !== "desktop",
    isCoarsePointer,
  };
}
