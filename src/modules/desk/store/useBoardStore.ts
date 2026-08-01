import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  NotebookPage,
  NotebookStyle,
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
    // Every new page is stamped with today's date automatically.
    date: new Date().toISOString(),
    content: "",
    urgent: "",
  };
}

interface BoardState {
  postits: PostIt[];
  stickers: StickerInstance[];
  pages: NotebookPage[];
  notebookStyle: NotebookStyle;
  /** id of the notebook page currently shown — scopes which stickers render */
  currentPageId: string;
  /** tamaño en px de la libreta, para acotar los stickers a su área */
  notebookSize: { w: number; h: number };
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
  /** coloca un sticker en la hoja actual, dentro del área de la libreta */
  addSticker: (kind: string) => void;
  moveSticker: (id: string, x: number, y: number) => void;
  resizeSticker: (id: string, scale: number) => void;
  removeSticker: (id: string) => void;

  // notebook
  updatePage: (id: string, patch: Partial<NotebookPage>) => void;
  addPage: () => void;
  removePage: (id: string) => void;
  setNotebookStyle: (style: NotebookStyle) => void;
  setCurrentPage: (id: string) => void;
  setNotebookSize: (w: number, h: number) => void;

  // sync
  /** Reemplaza el tablero con datos remotos (al iniciar sesión). */
  hydrate: (data: {
    pages: NotebookPage[];
    postits: PostIt[];
    stickers: StickerInstance[];
    notebookStyle: NotebookStyle;
  }) => void;
  /** Vuelve al tablero vacío por defecto (al cerrar sesión). */
  reset: () => void;
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => {
      const initialPage = makePage(0);
      return {
      postits: [],
      stickers: [],
      pages: [initialPage],
      notebookStyle: "ruled",
      currentPageId: initialPage.id,
      notebookSize: { w: 400, h: 520 },
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

      addSticker: (kind) =>
        set((s) => {
          const z = s.topZ + 1;
          // coloca en un punto aleatorio dentro del área de la libreta
          const bw = s.notebookSize.w || 400;
          const bh = s.notebookSize.h || 520;
          const sticker: StickerInstance = {
            id: uid(),
            kind,
            pageId: s.currentPageId,
            x: Math.round(bw * 0.2 + Math.random() * bw * 0.4),
            y: Math.round(bh * 0.15 + Math.random() * bh * 0.45),
            rotation: Math.random() * 12 - 6,
            scale: 1,
            zIndex: z,
          };
          return { stickers: [...s.stickers, sticker], topZ: z };
        }),

      moveSticker: (id, x, y) =>
        set((s) => {
          // acota el sticker dentro de los límites de la libreta
          const maxX = Math.max(0, s.notebookSize.w - 80);
          const maxY = Math.max(0, s.notebookSize.h - 80);
          const cx = Math.min(Math.max(0, x), maxX);
          const cy = Math.min(Math.max(0, y), maxY);
          return {
            stickers: s.stickers.map((st) =>
              st.id === id ? { ...st, x: cx, y: cy } : st
            ),
          };
        }),

      resizeSticker: (id, scale) =>
        set((s) => ({
          stickers: s.stickers.map((st) =>
            st.id === id ? { ...st, scale } : st
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

      removePage: (id) =>
        set((s) => {
          if (s.pages.length <= 1) return { pages: [makePage(0)] };
          const remaining = s.pages
            .filter((p) => p.id !== id)
            .map((p, i) => ({ ...p, index: i }));
          return { pages: remaining };
        }),

      setNotebookStyle: (style) => set({ notebookStyle: style }),

      setCurrentPage: (id) => set({ currentPageId: id }),

      setNotebookSize: (w, h) => set({ notebookSize: { w, h } }),

      hydrate: (data) =>
        set(() => {
          const pages = data.pages.length ? data.pages : [makePage(0)];
          const maxZ = Math.max(
            1,
            ...data.postits.map((p) => p.zIndex),
            ...data.stickers.map((s) => s.zIndex)
          );
          return {
            pages,
            postits: data.postits,
            stickers: data.stickers,
            notebookStyle: data.notebookStyle,
            currentPageId: pages[0].id,
            topZ: maxZ + 1,
          };
        }),

      reset: () =>
        set(() => {
          const page = makePage(0);
          return {
            pages: [page],
            postits: [],
            stickers: [],
            notebookStyle: "ruled" as NotebookStyle,
            currentPageId: page.id,
            topZ: 1,
          };
        }),
      };
    },
    {
      name: "notebook-board",
      version: 3,
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
        // Bind legacy stickers to the first page; set the current page.
        const firstPageId = state?.pages?.[0]?.id ?? "";
        if (state?.stickers) {
          state.stickers = (state.stickers as Partial<StickerInstance>[]).map(
            (st) => ({ ...st, pageId: st.pageId ?? firstPageId })
          ) as StickerInstance[];
        }
        if (state && !state.currentPageId) state.currentPageId = firstPageId;
        return state as BoardState;
      },
    }
  )
);

export { POSTIT_COLORS };
