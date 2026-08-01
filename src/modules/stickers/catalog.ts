import { STICKER_LINKS } from "./stickerLinks";

/**
 * Catálogo de stickers. Cada sticker usa su imagen (URL en `stickerLinks.ts`);
 * mientras la URL esté vacía se dibuja un badge de texto de respaldo.
 */
export interface StickerDef {
  kind: string;
  label: string;
  /** URL de imagen (Cloudinary). Vacío → badge de texto. */
  src: string;
  bg: string;
  fg: string;
}

// Metadatos base; el `src` se toma de stickerLinks.ts por `kind`.
const BASE: Omit<StickerDef, "src">[] = [
  { kind: "good-try", label: "GOOD try", bg: "#ffe58a", fg: "#8a6d00" },
  { kind: "great-job", label: "GREAT job", bg: "#bfe3f2", fg: "#1f5c7a" },
  { kind: "good-work", label: "Good WORK", bg: "#8f86c9", fg: "#ffffff" },
  { kind: "nice-work", label: "nice WORK", bg: "#c9edc0", fg: "#3c7a2f" },
  { kind: "awesome", label: "AWESOME", bg: "#8f86c9", fg: "#ffffff" },
  { kind: "good-job", label: "good JOB", bg: "#f7cddb", fg: "#a53b64" },
  { kind: "well-done", label: "well DONE", bg: "#f7cddb", fg: "#a53b64" },
  { kind: "you-did-it", label: "you DID it", bg: "#ffe58a", fg: "#a55a1f" },
  { kind: "super", label: "SUPER", bg: "#5aa9c9", fg: "#0f3a4a" },
];

export const STICKERS: StickerDef[] = BASE.map((s) => ({
  ...s,
  src: STICKER_LINKS[s.kind] ?? "",
}));

export const stickerByKind = (kind: string) =>
  STICKERS.find((s) => s.kind === kind) ?? STICKERS[0];
