/** Domain types shared across notebook, post-its and stickers modules. */

export type PostItColor =
  | "yellow"
  | "pink"
  | "orange"
  | "cyan"
  | "green"
  | "blue";

export interface PostIt {
  id: string;
  text: string;
  color: PostItColor;
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
}

export interface StickerInstance {
  id: string;
  /** references a sticker kind from the stickers catalog */
  kind: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

export interface NotebookPage {
  id: string;
  index: number;
  /** ISO date the page's "FECHA" header shows */
  date: string | null;
  content: string;
  urgent: string;
}
