import type { PostItColor } from "@/shared/types/board";

/** Background + subtle folded-corner tints per post-it color. */
export const POSTIT_STYLES: Record<
  PostItColor,
  { bg: string; fold: string; label: string }
> = {
  yellow: { bg: "var(--postit-yellow)", fold: "#e9d264", label: "Amarillo" },
  pink: { bg: "var(--postit-pink)", fold: "#e6bcb4", label: "Rosa" },
  orange: { bg: "var(--postit-orange)", fold: "#d24a25", label: "Naranja" },
  cyan: { bg: "var(--postit-cyan)", fold: "#88cfe0", label: "Cian" },
  green: { bg: "var(--postit-green)", fold: "#84b34f", label: "Verde" },
  blue: { bg: "var(--postit-blue)", fold: "#4e7896", label: "Azul" },
};
