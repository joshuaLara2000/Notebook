/** Geometry helpers shared across draggable desk objects (post-its, etc.). */

export interface Size {
  width: number;
  height: number;
}

/**
 * Keep a box fully inside its container so its drag handle never ends up
 * off-screen and out of reach. Returns the clamped top-left corner.
 *
 * `pad` leaves a small inset from every edge; when the box is larger than the
 * container the box is pinned to the top-left inset instead of overflowing.
 */
export function clampBoxToBounds(
  x: number,
  y: number,
  box: Size,
  bounds: Size,
  pad = 8
): { x: number; y: number } {
  const maxX = Math.max(pad, bounds.width - box.width - pad);
  const maxY = Math.max(pad, bounds.height - box.height - pad);
  return {
    x: Math.min(Math.max(pad, x), maxX),
    y: Math.min(Math.max(pad, y), maxY),
  };
}
