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
  /** Rich-text content as sanitized HTML (bold/italic/underline/strike/lists). */
  text: string;
  color: PostItColor;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  /** Closed notes are hidden from the board but kept in the notes list. */
  archived: boolean;
  /** ISO timestamp of the last content edit, for "recently edited" sorting. */
  updatedAt: string;
}

export interface StickerInstance {
  id: string;
  /** references a sticker kind from the stickers catalog */
  kind: string;
  /** the notebook page this sticker belongs to; it only shows on that page */
  pageId: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

export type NotebookStyle = "ruled" | "grid" | "blank";

export interface NotebookPage {
  id: string;
  index: number;
  /** ISO date the page's "FECHA" header shows */
  date: string | null;
  content: string;
  urgent: string;
}
