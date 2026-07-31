import { useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import type { PageFlipMethods } from "react-pageflip";
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
import { RichToolbar } from "@/shared/ui/RichToolbar";
import type { NotebookStyle } from "@/shared/types/board";
import { useBoardStore } from "@/modules/desk/store/useBoardStore";
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
  const height = Math.min(720, Math.max(460, h - 230));
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

  const bookRef = useRef<{ pageFlip: () => PageFlipMethods } | null>(null);
  const api = () => bookRef.current?.pageFlip();

  // Forward flip animates (flipNext works); backward flip is broken in
  // react-pageflip's portrait mode, so "prev" uses the instant turnToPrevPage.
  const flip = (dir: "next" | "prev") => {
    const a = api();
    if (!a) return;
    dir === "next" ? a.flipNext() : a.turnToPrevPage();
  };
  const goToPage = (index: number) => api()?.turnToPage(index);

  const deleteCurrentPage = () => {
    const index = api()?.getCurrentPageIndex() ?? 0;
    const id = pageIds[index];
    if (id) removePage(id);
    setConfirmingDelete(false);
  };

  return (
    <section className="flex h-full w-full flex-col items-center justify-center gap-3">
      <div className="drop-shadow-[0_18px_30px_rgba(0,0,0,.28)]">
        <HTMLFlipBook
          key={`${bookWidth}x${bookHeight}`}
          ref={bookRef}
          width={bookWidth}
          height={bookHeight}
          size="fixed"
          showCover={false}
          usePortrait
          mobileScrollSupport={false}
          maxShadowOpacity={0.35}
          drawShadow
          disableFlipByClick
          className="notebook-book"
        >
          {pageIds.map((id) => (
            <NotebookPageSheet key={id} pageId={id} />
          ))}
        </HTMLFlipBook>
      </div>

      {/* navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => flip("prev")}
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-ink/60 min-w-16 text-center text-base font-semibold">
          {pageIds.length} {pageIds.length === 1 ? "hoja" : "hojas"}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => flip("next")}
          aria-label="Página siguiente"
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="ml-1 gap-1 rounded-full"
          onClick={addPage}
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
            aria-label="Eliminar hoja actual"
            title="Eliminar hoja actual"
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
