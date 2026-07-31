import { forwardRef, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { RichTextArea } from "@/shared/ui/RichTextArea";
import { useBoardStore } from "@/modules/desk/store/useBoardStore";

interface NotebookPageSheetProps {
  pageId: string;
}

/**
 * Attaches *native* mousedown/touch/pointer listeners that stop propagation
 * before the event reaches react-pageflip's own listener on an ancestor
 * (React 19 delegates handlers to the app root, too late to beat the flip
 * engine's preventDefault). Used for the plain URGENTE textarea; the rich
 * content editor already does this internally.
 */
function useStopFlipRef() {
  return useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    const stop = (e: Event) => e.stopPropagation();
    el.addEventListener("mousedown", stop);
    el.addEventListener("touchstart", stop);
    el.addEventListener("pointerdown", stop);
    return () => {
      el.removeEventListener("mousedown", stop);
      el.removeEventListener("touchstart", stop);
      el.removeEventListener("pointerdown", stop);
    };
  }, []);
}

const PAPER_CLASS = {
  ruled: "paper-ruled",
  grid: "paper-grid",
  blank: "paper-blank",
} as const;

/**
 * A single notebook page: "FECHA" header, a rich-text writing area on the
 * chosen paper style, an "URGENTE" box and a spiral binding. Forwarded ref is
 * required by react-pageflip. Subscribes to its own page slice so typing only
 * re-renders this leaf (otherwise the flip engine would rebuild and steal focus).
 */
export const NotebookPageSheet = forwardRef<
  HTMLDivElement,
  NotebookPageSheetProps
>(({ pageId }, ref) => {
  const page = useBoardStore((s) => s.pages.find((p) => p.id === pageId));
  const updatePage = useBoardStore((s) => s.updatePage);
  const notebookStyle = useBoardStore((s) => s.notebookStyle);
  const stopFlipRef = useStopFlipRef();

  // react-pageflip expects a real element per child even if data is missing.
  if (!page) return <div ref={ref} className="bg-paper h-full w-full" />;

  const dateLabel = page.date
    ? format(new Date(page.date), "dd 'de' MMMM, yyyy", { locale: es })
    : "__ / __ / ____";

  return (
    <div ref={ref} className="bg-paper h-full w-full">
      <div className="relative flex h-full flex-col px-10 py-7">
        {/* spiral binding */}
        <div className="absolute inset-y-3 left-2 flex flex-col justify-between">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className="block h-1.5 w-4 rounded-full bg-black/15"
            />
          ))}
        </div>

        {/* FECHA header */}
        <div className="font-hand text-ink/70 mb-3 self-end text-lg">
          FECHA: <span className="text-ink">{dateLabel}</span>
        </div>

        {/* rich writing area on the selected paper style */}
        <div className={cn("min-h-0 flex-1", PAPER_CLASS[notebookStyle])}>
          <RichTextArea
            html={page.content}
            onChange={(v) => updatePage(pageId, { content: v })}
            placeholder="Escribe tus apuntes…"
            className="font-hand text-ink h-full text-xl leading-[2rem]"
          />
        </div>

        {/* URGENTE box */}
        <div className="mt-3 rounded-md border-2 border-dashed border-ink/25 p-2">
          <div className="mb-1 flex items-center gap-2">
            <span className="border-urgent text-urgent grid size-8 place-items-center rounded-full border-2 text-[0.6rem] font-bold">
              URGE
            </span>
            <span className="text-ink/50 text-xs uppercase tracking-wide">
              Urgente
            </span>
          </div>
          <textarea
            ref={stopFlipRef}
            value={page.urgent}
            onChange={(e) => updatePage(pageId, { urgent: e.target.value })}
            placeholder="Algo que no puede esperar…"
            className="font-hand text-ink placeholder:text-ink/25 h-12 w-full resize-none bg-transparent text-lg leading-tight outline-none"
          />
        </div>
      </div>
    </div>
  );
});

NotebookPageSheet.displayName = "NotebookPageSheet";
