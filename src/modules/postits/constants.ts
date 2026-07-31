import type { PostItColor } from "@/shared/types/board";

/** Background + subtle folded-corner tints per post-it color. */
export const POSTIT_STYLES: Record<
  PostItColor,
  { bg: string; fold: string; label: string }
> = {
  yellow: { bg: "var(--postit-yellow)", fold: "#ecdb84", label: "Amarillo" },
  pink: { bg: "var(--postit-pink)", fold: "#efb9d1", label: "Rosa" },
  orange: { bg: "var(--postit-orange)", fold: "#f2b491", label: "Durazno" },
  cyan: { bg: "var(--postit-cyan)", fold: "#a5d4e6", label: "Cielo" },
  green: { bg: "var(--postit-green)", fold: "#aed6a9", label: "Menta" },
  blue: { bg: "var(--postit-blue)", fold: "#adb6ee", label: "Lavanda" },
};
