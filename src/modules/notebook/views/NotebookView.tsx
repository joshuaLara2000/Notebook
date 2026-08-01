import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  AlignJustify,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  Plus,
  Square,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MOD_LABEL, useHotkeys } from "@/shared/hooks/useHotkeys";
import { RichToolbar } from "@/shared/ui/RichToolbar";
import type { NotebookStyle } from "@/shared/types/board";
import { useBoardStore } from "@/modules/desk/store/useBoardStore";
import { StickerLayer } from "@/modules/stickers/views/StickerLayer";
import { FlipBook, type FlipBookHandle } from "../components/FlipBook";
import { NotebookPageSheet } from "../components/NotebookPageSheet";
import { NotebookIndex } from "../components/NotebookIndex";

const PAPER_OPTIONS: { value: NotebookStyle; icon: typeof Square; label: string }[] =
  [
    { value: "ruled", icon: AlignJustify, label: "Renglones" },
    { value: "grid", icon: Grid3x3, label: "Cuadrícula" },
    { value: "blank", icon: Square, label: "Blanco" },
  ];

function computeBookSize() {
  const h = typeof window !== "undefined" ? window.innerHeight : 800;
  // Larger book on tall screens; reserve room for the top bar and the controls.
  const height = Math.min(900, Math.max(480, h - 250));
  return { bookHeight: height, bookWidth: Math.round(height * 0.75) };
}

export function NotebookView() {
  // Subscribe to page ids only (shallow) so editing content never re-renders
  // this view — otherwise react-pageflip rebuilds the pages and steals focus.
  const pageIds = useBoardStore(useShallow((s) => s.pages.map((p) => p.id)));
  const addPage = useBoardStore((s) => s.addPage);
  const removePage = useBoardStore((s) => s.removePage);
  const notebookStyle = useBoardStore((s) => s.notebookStyle);
  const setNotebookStyle = useBoardStore((s) => s.setNotebookStyle);
  const setCurrentPage = useBoardStore((s) => s.setCurrentPage);
  const setNotebookSize = useBoardStore((s) => s.setNotebookSize);

  // Índice de la hoja visible, para mostrar "actual/total" en el navegador.
  const [currentIndex, setCurrentIndex] = useState(0);

  // Keep the store's "current page" in sync so stickers scope to this page.
  useEffect(() => {
    if (pageIds[0]) setCurrentPage(pageIds[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleFlip = (index: number) => {
    setCurrentIndex(index);
    const id = pageIds[index];
    if (id) setCurrentPage(id);
  };

  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Size the notebook to the viewport height: big on tall screens, never
  // overlapping the top bar or clipping the controls. Reserves ~230px for the
  // top bar, the two control rows and margins. Recomputed on resize.
  const [{ bookWidth, bookHeight }, setSize] = useState(computeBookSize);
  useEffect(() => {
    const onResize = () => setSize(computeBookSize());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // reporta el tamaño de la libreta para acotar los stickers a su área
  useEffect(() => {
    setNotebookSize(bookWidth, bookHeight);
  }, [bookWidth, bookHeight, setNotebookSize]);

  const bookRef = useRef<FlipBookHandle | null>(null);
  const api = () => bookRef.current;

  // Volteo 3D propio: anima en ambos sentidos.
  const flip = (dir: "next" | "prev") => {
    const a = api();
    if (!a) return;
    dir === "next" ? a.flipNext() : a.flipPrev();
  };
  const goToPage = (index: number) => api()?.goTo(index);

  const deleteCurrentPage = () => {
    const index = api()?.getIndex() ?? 0;
    const id = pageIds[index];
    if (id) removePage(id);
    setConfirmingDelete(false);
  };

  // Al agregar hoja, salta (animando) a la nueva última hoja.
  const jumpToLastRef = useRef(false);
  useEffect(() => {
    if (!jumpToLastRef.current) return;
    jumpToLastRef.current = false;
    api()?.goTo(pageIds.length - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIds]);

  const handleAddPage = () => {
    jumpToLastRef.current = true;
    addPage();
  };

  // Estado de los extremos para deshabilitar controles.
  const atFirst = currentIndex <= 0;
  const atLast = currentIndex >= pageIds.length - 1;
  const onlyOnePage = pageIds.length <= 1;

  // Atajos: nueva hoja (⌘⏎) y navegar entre hojas (←/→, fuera de edición).
  useHotkeys([
    { combo: "mod+enter", handler: handleAddPage, allowInInput: true },
    { combo: "arrowleft", handler: () => flip("prev") },
    { combo: "arrowright", handler: () => flip("next") },
  ]);

  return (
    <section className="flex flex-col items-center gap-3">
      <div className="relative">
        <FlipBook
          ref={bookRef}
          pageIds={pageIds}
          renderPage={(id) => <NotebookPageSheet pageId={id} />}
          width={bookWidth}
          height={bookHeight}
          onFlip={handleFlip}
        />

        {/* stickers de la hoja actual, encima de la libreta y recortados a ella */}
        <StickerLayer />
      </div>

      {/* navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => flip("prev")}
          disabled={atFirst}
          aria-label="Página anterior"
          title="Hoja anterior (←)"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-ink/60 min-w-20 text-center text-base font-semibold">
          {Math.min(currentIndex, pageIds.length - 1) + 1}/{pageIds.length}{" "}
          {pageIds.length === 1 ? "hoja" : "hojas"}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => flip("next")}
          disabled={atLast}
          aria-label="Página siguiente"
          title="Hoja siguiente (→)"
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="ml-1 gap-1 rounded-full"
          onClick={handleAddPage}
          title={`Nueva hoja (${MOD_LABEL}⏎)`}
        >
          <Plus className="size-4" /> Hoja
        </Button>
        {confirmingDelete ? (
          <span className="flex items-center gap-1">
            <Button
              variant="destructive"
              size="sm"
              className="rounded-full"
              onClick={deleteCurrentPage}
            >
              Eliminar hoja
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => setConfirmingDelete(false)}
            >
              Cancelar
            </Button>
          </span>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="text-ink/50 hover:text-destructive rounded-full"
            onClick={() => setConfirmingDelete(true)}
            disabled={onlyOnePage}
            aria-label="Eliminar hoja actual"
            title={
              onlyOnePage
                ? "No puedes eliminar la única hoja"
                : "Eliminar hoja actual"
            }
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      {/* tools: formatting · paper style · index */}
      <div className="flex items-center gap-2">
        <div className="bg-paper/70 flex items-center rounded-full border px-1 shadow-sm">
          <RichToolbar />
        </div>

        <div className="bg-paper/70 flex items-center gap-0.5 rounded-full border p-0.5 shadow-sm">
          {PAPER_OPTIONS.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setNotebookStyle(value)}
              aria-label={label}
              title={label}
              className={cn(
                "grid size-7 place-items-center rounded-full transition",
                notebookStyle === value
                  ? "bg-primary text-primary-foreground"
                  : "text-ink/60 hover:bg-black/5"
              )}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>

        <NotebookIndex onGoToPage={goToPage} />
      </div>
    </section>
  );
}
