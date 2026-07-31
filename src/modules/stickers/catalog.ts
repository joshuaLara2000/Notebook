/**
 * Sticker catalog. Each kind renders as an inline SVG badge in the playful
 * style of the reference sheet ("GOOD job", "AWESOME", …). Kept as data so it
 * can later be swapped for uploaded artwork without touching the board logic.
 */
export interface StickerDef {
  kind: string;
  label: string;
  bg: string;
  fg: string;
}

export const STICKERS: StickerDef[] = [
  { kind: "good-job", label: "GOOD job", bg: "#ffe58a", fg: "#8a6d00" },
  { kind: "great", label: "GREAT!", bg: "#bfe3f2", fg: "#1f5c7a" },
  { kind: "awesome", label: "AWESOME", bg: "#d9c8f2", fg: "#5b3d8a" },
  { kind: "nice-work", label: "nice WORK", bg: "#c9edc0", fg: "#3c7a2f" },
  { kind: "well-done", label: "well DONE", bg: "#f7cddb", fg: "#a53b64" },
  { kind: "you-did-it", label: "you DID it", bg: "#ffd7a8", fg: "#a55a1f" },
  { kind: "super", label: "SUPER", bg: "#ffb3c1", fg: "#8a2540" },
  { kind: "star", label: "★", bg: "#ffe58a", fg: "#c48a00" },
];

export const stickerByKind = (kind: string) =>
  STICKERS.find((s) => s.kind === kind) ?? STICKERS[0];
