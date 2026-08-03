import { useEffect, useMemo, useRef } from "react";

import { useBoardStore } from "@/modules/desk/store/useBoardStore";
import { htmlToPlainText } from "@/shared/utils/richText";
import { clampBoxToBounds } from "@/shared/utils/geometry";
import { PostItCard } from "../components/PostItCard";

export function PostItWall() {
  const sectionRef = useRef<HTMLElement>(null);
  const postits = useBoardStore((s) => s.postits);
  const updatePostIt = useBoardStore((s) => s.updatePostIt);
  const movePostIt = useBoardStore((s) => s.movePostIt);
  const bringToFront = useBoardStore((s) => s.bringToFront);
  const archivePostIt = useBoardStore((s) => s.archivePostIt);
  const removePostIt = useBoardStore((s) => s.removePostIt);
  const resizePostIt = useBoardStore((s) => s.resizePostIt);

  // Rescue notes that ended up (partly) off the desk — e.g. one dragged above
  // the top edge in an older build, or left stranded after the window shrank —
  // so their drag handle is always reachable again. Runs on load and on resize.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rescue = () => {
      const bounds = { width: el.clientWidth, height: el.clientHeight };
      if (!bounds.width || !bounds.height) return;
      for (const p of useBoardStore.getState().postits) {
        if (p.archived) continue;
        const c = clampBoxToBounds(
          p.x,
          p.y,
          { width: p.width, height: p.height },
          bounds
        );
        if (c.x !== p.x || c.y !== p.y) movePostIt(p.id, c.x, c.y);
      }
    };
    rescue();
    window.addEventListener("resize", rescue);
    return () => window.removeEventListener("resize", rescue);
  }, [postits, movePostIt]);

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
    <section
      ref={sectionRef}
      className="pointer-events-none absolute inset-0 z-20 isolate overflow-hidden"
    >
      <header className="absolute left-5 top-16 z-10">
        <h2 className="text-ink/70 text-2xl font-bold">Post-its</h2>
      </header>

      {visible.length === 0 && (
        <div className="text-ink/35 font-hand pointer-events-none absolute inset-y-0 left-0 right-[42%] flex items-center justify-center px-6 text-center text-xl">
          Usa “+ Post-it” arriba para pegar tu primera nota
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
