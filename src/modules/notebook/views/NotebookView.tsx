import { useRef } from "react";
import HTMLFlipBook from "react-pageflip";
import type { PageFlipMethods } from "react-pageflip";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useBoardStore } from "@/modules/desk/store/useBoardStore";
import { NotebookPageSheet } from "../components/NotebookPageSheet";

export function NotebookView() {
  const pages = useBoardStore((s) => s.pages);
  const updatePage = useBoardStore((s) => s.updatePage);
  const addPage = useBoardStore((s) => s.addPage);

  const bookRef = useRef<{ pageFlip: () => PageFlipMethods } | null>(null);
  const flip = (dir: "next" | "prev") => {
    const api = bookRef.current?.pageFlip();
    if (!api) return;
    dir === "next" ? api.flipNext() : api.flipPrev();
  };

  return (
    <section className="flex h-full w-full flex-col items-center justify-center gap-4">
      <div className="drop-shadow-[0_18px_30px_rgba(0,0,0,.28)]">
        <HTMLFlipBook
          ref={bookRef}
          width={430}
          height={580}
          size="fixed"
          showCover={false}
          usePortrait
          mobileScrollSupport={false}
          maxShadowOpacity={0.35}
          drawShadow
          disableFlipByClick
          className="notebook-book"
        >
          {pages.map((page) => (
            <NotebookPageSheet
              key={page.id}
              page={page}
              onChangeContent={(v) => updatePage(page.id, { content: v })}
              onChangeUrgent={(v) => updatePage(page.id, { urgent: v })}
            />
          ))}
        </HTMLFlipBook>
      </div>

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
        <span className="font-hand text-ink/60 min-w-16 text-center text-lg">
          {pages.length} {pages.length === 1 ? "hoja" : "hojas"}
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
          className="ml-2 gap-1 rounded-full"
          onClick={addPage}
        >
          <Plus className="size-4" /> Hoja
        </Button>
      </div>
    </section>
  );
}
