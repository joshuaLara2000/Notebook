import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  NotebookPage,
  PostIt,
  PostItColor,
  StickerInstance,
} from "@/shared/types/board";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const POSTIT_COLORS: PostItColor[] = [
  "yellow",
  "pink",
  "orange",
  "cyan",
  "green",
  "blue",
];

function makePage(index: number): NotebookPage {
  return {
    id: uid(),
    index,
    date: index === 0 ? new Date().toISOString() : null,
    content: "",
    urgent: "",
  };
}

interface BoardState {
  postits: PostIt[];
  stickers: StickerInstance[];
  pages: NotebookPage[];
  topZ: number;

  // post-its
  addPostIt: (color?: PostItColor) => void;
  updatePostIt: (id: string, patch: Partial<PostIt>) => void;
  movePostIt: (id: string, x: number, y: number) => void;
  resizePostIt: (id: string, width: number, height: number) => void;
  bringToFront: (id: string) => void;
  setPostItColor: (id: string, color: PostItColor) => void;
  /** Close a note: hide from the board, keep it in the notes list. */
  archivePostIt: (id: string) => void;
  /** Reopen a closed note back onto the board. */
  restorePostIt: (id: string) => void;
  /** Delete a note permanently. */
  removePostIt: (id: string) => void;

  // stickers
  addSticker: (kind: string, x: number, y: number) => void;
  moveSticker: (id: string, x: number, y: number) => void;
  removeSticker: (id: string) => void;

  // notebook
  updatePage: (id: string, patch: Partial<NotebookPage>) => void;
  addPage: () => void;
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      postits: [],
      stickers: [],
      pages: [makePage(0)],
      topZ: 1,

      addPostIt: (color) =>
        set((s) => {
          const z = s.topZ + 1;
          const nextColor =
            color ?? POSTIT_COLORS[s.postits.length % POSTIT_COLORS.length];
          const postit: PostIt = {
            id: uid(),
            text: "",
            color: nextColor,
            x: 40 + Math.random() * 80,
            y: 120 + Math.random() * 90,
            width: 184,
            height: 184,
            rotation: Math.random() * 8 - 4,
            zIndex: z,
            archived: false,
            updatedAt: new Date().toISOString(),
          };
          return { postits: [...s.postits, postit], topZ: z };
        }),

      updatePostIt: (id, patch) =>
        set((s) => ({
          postits: s.postits.map((p) =>
            p.id === id
              ? { ...p, ...patch, updatedAt: new Date().toISOString() }
              : p
          ),
        })),

      movePostIt: (id, x, y) =>
        set((s) => ({
          postits: s.postits.map((p) => (p.id === id ? { ...p, x, y } : p)),
        })),

      resizePostIt: (id, width, height) =>
        set((s) => ({
          postits: s.postits.map((p) =>
            p.id === id ? { ...p, width, height } : p
          ),
        })),

      bringToFront: (id) =>
        set((s) => {
          const z = s.topZ + 1;
          return {
            topZ: z,
            postits: s.postits.map((p) =>
              p.id === id ? { ...p, zIndex: z } : p
            ),
          };
        }),

      setPostItColor: (id, color) =>
        set((s) => ({
          postits: s.postits.map((p) => (p.id === id ? { ...p, color } : p)),
        })),

      archivePostIt: (id) =>
        set((s) => ({
          postits: s.postits.map((p) =>
            p.id === id ? { ...p, archived: true } : p
          ),
        })),

      restorePostIt: (id) =>
        set((s) => {
          const z = s.topZ + 1;
          return {
            topZ: z,
            postits: s.postits.map((p) =>
              p.id === id
                ? {
                    ...p,
                    archived: false,
                    x: 40 + Math.random() * 80,
                    y: 120 + Math.random() * 90,
                    zIndex: z,
                    updatedAt: new Date().toISOString(),
                  }
                : p
            ),
          };
        }),

      removePostIt: (id) =>
        set((s) => ({ postits: s.postits.filter((p) => p.id !== id) })),

      addSticker: (kind, x, y) =>
        set((s) => {
          const z = s.topZ + 1;
          const sticker: StickerInstance = {
            id: uid(),
            kind,
            x,
            y,
            rotation: Math.random() * 12 - 6,
            scale: 1,
            zIndex: z,
          };
          return { stickers: [...s.stickers, sticker], topZ: z };
        }),

      moveSticker: (id, x, y) =>
        set((s) => ({
          stickers: s.stickers.map((st) =>
            st.id === id ? { ...st, x, y } : st
          ),
        })),

      removeSticker: (id) =>
        set((s) => ({ stickers: s.stickers.filter((st) => st.id !== id) })),

      updatePage: (id, patch) =>
        set((s) => ({
          pages: s.pages.map((pg) => (pg.id === id ? { ...pg, ...patch } : pg)),
        })),

      addPage: () =>
        set((s) => ({ pages: [...s.pages, makePage(s.pages.length)] })),
    }),
    {
      name: "notebook-board",
      version: 2,
      // Backfill notes saved before archive/updatedAt/size existed.
      migrate: (persisted) => {
        const state = persisted as Partial<BoardState> | undefined;
        if (state?.postits) {
          state.postits = (state.postits as Partial<PostIt>[]).map((p) => ({
            ...p,
            archived: p.archived ?? false,
            updatedAt: p.updatedAt ?? new Date().toISOString(),
            width: p.width ?? 184,
            height: p.height ?? 184,
          })) as PostIt[];
        }
        return state as BoardState;
      },
    }
  )
);

export { POSTIT_COLORS };
