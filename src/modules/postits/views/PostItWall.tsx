import { useMemo } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useBoardStore } from "@/modules/desk/store/useBoardStore";
import { htmlToPlainText } from "@/shared/utils/richText";
import { PostItCard } from "../components/PostItCard";
import { NotesSheet } from "../components/NotesSheet";

export function PostItWall() {
  const postits = useBoardStore((s) => s.postits);
  const addPostIt = useBoardStore((s) => s.addPostIt);
  const updatePostIt = useBoardStore((s) => s.updatePostIt);
  const bringToFront = useBoardStore((s) => s.bringToFront);
  const archivePostIt = useBoardStore((s) => s.archivePostIt);
  const removePostIt = useBoardStore((s) => s.removePostIt);
  const resizePostIt = useBoardStore((s) => s.resizePostIt);

  // Closing a note keeps it in the list — unless it's empty, then just drop it.
  const closeNote = (id: string, html: string) => {
    if (htmlToPlainText(html)) archivePostIt(id);
    else removePostIt(id);
  };

  // Only notes that are open live on the board; closed ones stay in the list.
  const visible = useMemo(
    () => postits.filter((p) => !p.archived),
    [postits]
  );

  return (
    // Full-desk layer: transparent to pointer events except the notes and the
    // header, so the notebook underneath stays writable where no note covers it.
    <section className="pointer-events-none absolute inset-0 z-20 isolate overflow-hidden">
      <header className="absolute left-5 top-16 z-10 flex items-center gap-3">
        <h2 className="text-ink/70 text-2xl font-bold">Post-its</h2>
        <Button
          size="sm"
          variant="outline"
          className="pointer-events-auto gap-1 rounded-full"
          onClick={() => addPostIt()}
        >
          <Plus className="size-4" /> Nuevo
        </Button>
        <div className="pointer-events-auto">
          <NotesSheet />
        </div>
      </header>

      {visible.length === 0 && (
        <div className="text-ink/35 font-hand absolute left-8 top-32 max-w-xs text-xl">
          Toca “Nuevo” para pegar tu primer post-it
        </div>
      )}

      {visible.map((p) => (
        <PostItCard
          key={p.id}
          postit={p}
          onChange={(text) => updatePostIt(p.id, { text })}
          onFocus={() => bringToFront(p.id)}
          onArchive={() => closeNote(p.id, p.text)}
          onResize={(w, h) => resizePostIt(p.id, w, h)}
        />
      ))}
    </section>
  );
}
