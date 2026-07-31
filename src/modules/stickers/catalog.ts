/**
 * Sticker catalog. Each sticker renders from an image `src` (upload the Word
 * artwork to a CDN like Cloudinary and paste the URLs below). While `src` is
 * empty, a text-badge fallback is drawn so the app keeps working.
 */
export interface StickerDef {
  kind: string;
  label: string;
  /** Image URL (e.g. Cloudinary). Empty → text-badge fallback. */
  src: string;
  bg: string;
  fg: string;
}

// 👉 Pega aquí las URLs de Cloudinary en `src` para cada sticker.
export const STICKERS: StickerDef[] = [
  { kind: "good-try", label: "GOOD try", src: "", bg: "#ffe58a", fg: "#8a6d00" },
  { kind: "great-job", label: "GREAT job", src: "", bg: "#bfe3f2", fg: "#1f5c7a" },
  { kind: "good-work", label: "Good WORK", src: "", bg: "#8f86c9", fg: "#ffffff" },
  { kind: "nice-work", label: "nice WORK", src: "", bg: "#c9edc0", fg: "#3c7a2f" },
  { kind: "awesome", label: "AWESOME", src: "", bg: "#8f86c9", fg: "#ffffff" },
  { kind: "good-job", label: "good JOB", src: "", bg: "#f7cddb", fg: "#a53b64" },
  { kind: "well-done", label: "well DONE", src: "", bg: "#f7cddb", fg: "#a53b64" },
  { kind: "you-did-it", label: "you DID it", src: "", bg: "#ffe58a", fg: "#a55a1f" },
  { kind: "super", label: "SUPER", src: "", bg: "#5aa9c9", fg: "#0f3a4a" },
];

export const stickerByKind = (kind: string) =>
  STICKERS.find((s) => s.kind === kind) ?? STICKERS[0];
